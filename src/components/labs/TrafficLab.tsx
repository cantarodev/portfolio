import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import {
  ActionButton,
  ControlGroup,
  Disclosure,
  Metric,
  MetricBar,
  MetricGrid,
  SimTrace,
  Term,
} from "@/components/labs/ui";
import { useSimulation } from "@/components/labs/use-simulation";
import type { QueueConfig } from "@/lib/sim/queue-engine";
import {
  BASE_CONFIG,
  TRAFFIC_PRESETS,
  WORKER_OPTIONS,
  trafficPreset,
  type TrafficValue,
} from "@/lib/sim/presets";
import { decodeQueryString } from "@/lib/sim/url";

const MAX_ARRIVAL = 45;

function capacityPerSecond(config: QueueConfig) {
  const perSecond = config.workers / (config.processingMs / 1000);
  return Number.isFinite(perSecond) ? perSecond : 0;
}

export function TrafficLab() {
  const [config, setConfig] = useState<QueueConfig>(() => ({
    ...BASE_CONFIG,
    arrivalRate: 2,
    workers: 2,
    ...(typeof window !== "undefined"
      ? decodeQueryString(window.location.search)
      : {}),
  }));

  const { snapshot, running, start, pause, reset, configure } =
    useSimulation(config);

  function update(partial: Partial<QueueConfig>) {
    setConfig((previous) => ({ ...previous, ...partial }));
    configure(partial);
  }

  const trafficValue =
    TRAFFIC_PRESETS.find((preset) => preset.arrivalRate === config.arrivalRate)
      ?.value ?? TRAFFIC_PRESETS[0].value;
  const capacity = capacityPerSecond(config);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="inline-flex min-h-10 items-center gap-1.5 rounded border border-term/40 bg-term/10 px-4 py-2 font-mono text-[11px] text-term transition-colors hover:bg-term/20"
        >
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? "Pausar" : "Iniciar"}
        </button>
        <ActionButton onClick={() => reset(config)}>
          <RotateCcw className="inline size-3" /> Reiniciar
        </ActionButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
          <SimTrace workers={snapshot.workers} queueDepth={snapshot.queueDepth} />

          <div className="rounded-xl border border-term/15 bg-term/[0.03] p-4">
            <h2 className="mb-3 font-sans text-sm font-semibold text-crema">
              Carga vs capacidad
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                  <span className="text-crema/60">Peticiones entrantes</span>
                  <span className="text-crema/80 tabular-nums">
                    {config.arrivalRate}/s
                  </span>
                </div>
                <MetricBar value={(config.arrivalRate / MAX_ARRIVAL) * 100} tone="warning" />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                  <span className="text-crema/60">Capacidad de proceso</span>
                  <span className="text-crema/80 tabular-nums">
                    {capacity.toFixed(1)}/s
                  </span>
                </div>
                <MetricBar
                  value={(capacity / MAX_ARRIVAL) * 100}
                  tone={capacity < config.arrivalRate ? "danger" : "term"}
                />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                  <span className="text-crema/60">Cola</span>
                  <span className="text-crema/80 tabular-nums">
                    {snapshot.queueDepth}
                  </span>
                </div>
                <MetricBar
                  value={(snapshot.queueDepth / 80) * 100}
                  tone={snapshot.queueDepth > 40 ? "danger" : "term"}
                />
              </div>
            </div>

            {capacity < config.arrivalRate && (
              <p className="mt-4 font-mono text-[11px] text-term-red">
                ⚠ La carga entrante supera la capacidad — la cola va a crecer
                (back-pressure).
              </p>
            )}
          </div>

          <MetricGrid>
            <Metric label="Llegadas /s" value={config.arrivalRate} />
            <Metric label="Throughput /s" value={snapshot.throughput} max={MAX_ARRIVAL} />
            <Metric label="Cola" value={snapshot.queueDepth} max={80} tone={snapshot.queueDepth > 40 ? "danger" : "term"} />
            <Metric label="Workers" value={snapshot.workers.length} />
          </MetricGrid>
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
          <div className="rounded-xl border border-crema/10 bg-ink/40 p-4">
            <h2 className="font-sans text-sm font-semibold text-crema">
              Controles
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <ControlGroup
                label="Tráfico"
                value={trafficValue}
                onChange={(value: TrafficValue) =>
                  update({ arrivalRate: trafficPreset(value).arrivalRate })
                }
                options={TRAFFIC_PRESETS.map((preset) => ({
                  value: preset.value,
                  label: preset.label,
                }))}
                tip="La tasa de mensajes entrantes por segundo simulado."
              />
              <ControlGroup
                label="Escalado"
                value={config.autoScale ? "auto" : "fixed"}
                onChange={(value) => update({ autoScale: value === "auto" })}
                options={[
                  { value: "fixed", label: "Fijo" },
                  { value: "auto", label: "Auto Scale" },
                ]}
                tip="Auto Scale añade workers cuando crece el backlog."
              />
              {!config.autoScale && (
                <ControlGroup
                  label="Workers"
                  value={config.workers}
                  onChange={(value) => update({ workers: value })}
                  options={WORKER_OPTIONS.map((count) => ({
                    value: count,
                    label: String(count),
                  }))}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Disclosure label="Escalado horizontal">
          Añadir workers aumenta el{" "}
          <Term tip="Cuántos mensajes puede terminar el sistema por segundo.">
            throughput
          </Term>{" "}
          hasta que aparece el siguiente cuello de botella — normalmente la base
          de datos.
        </Disclosure>
        <Disclosure label="La cola como señal">
          La profundidad de la cola es la diferencia entre la tasa de llegada y la
          capacidad de proceso. Si crece, la carga va ganando.
        </Disclosure>
        <Disclosure label="Back-pressure">
          En lugar de descartar o saturar, la cola absorbe picos y deja que los
          consumidores se pongan al día. Cuando no puede, hay que frenar a los
          productores o añadir capacidad.
        </Disclosure>
      </div>
    </div>
  );
}
