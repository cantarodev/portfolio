import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { ArchitectureDiagram } from "@/components/sections/ArchitectureDiagram";
import {
  ActionButton,
  CodeBlock,
  ControlGroup,
  Disclosure,
  EventLog,
  Metric,
  MetricGrid,
  ShareBar,
  SimTrace,
  Term,
  UnderTheHood,
} from "@/components/labs/ui";
import { useSimulation } from "@/components/labs/use-simulation";
import type { QueueConfig } from "@/lib/sim/queue-engine";
import {
  BASE_CONFIG,
  DATA_ERROR_PRESETS,
  FAILURE_PRESETS,
  PROCESSING_PRESETS,
  TRAFFIC_PRESETS,
  WORKER_OPTIONS,
  dataErrorPreset,
  failurePreset,
  processingPreset,
  type DataErrorValue,
  type FailureValue,
  type ProcessingValue,
  type TrafficValue,
  trafficPreset,
} from "@/lib/sim/presets";
import { SCENARIOS, type SimScenario } from "@/lib/sim/scenarios";
import { decodeQueryString, encodeQueueParams } from "@/lib/sim/url";

const CODE_EXCERPT = `// lib/sim/queue-engine.ts (extracto)
tick(dt) {
  this.receiveArrivals(dt)      // arrivalRate * dt -> mensajes
  this.resolveBusyWorkers()     // termina trabajos, decide éxito/fallo

  if (!this.paused) {
    this.assignWork()           // worker libre + cola -> procesando
    if (this.config.autoScale) this.autoScale()
  }
}

handleTransient(message, reason) {   // timeout / rate limit / red
  message.attempts += 1
  if (message.attempts >= maxRetries) this.dlq.push(message)
  else this.queue.push(message)      // reintento
}

handlePermanent(message) {           // datos inválidos
  this.dlq.push(message)             // sin reintento
}`;

type View = "sim" | "arch" | "code";

export function QueueLab() {
  const [config, setConfig] = useState<QueueConfig>(() => ({
    ...BASE_CONFIG,
    ...(typeof window !== "undefined"
      ? decodeQueryString(window.location.search)
      : {}),
  }));
  const [view, setView] = useState<View>("sim");
  const [scenario, setScenario] = useState<SimScenario | null>(null);
  const [challengeResult, setChallengeResult] = useState<string | null>(null);
  const challengeTimer = useRef<number | null>(null);

  const { snapshot, running, start, pause, reset, run, configure } =
    useSimulation(config);

  useEffect(() => {
    return () => {
      if (challengeTimer.current) window.clearTimeout(challengeTimer.current);
    };
  }, []);

  function update(partial: Partial<QueueConfig>) {
    setConfig((previous) => ({ ...previous, ...partial }));
    configure(partial);
  }

  function handleReset() {
    setScenario(null);
    setChallengeResult(null);
    reset(config);
  }

  function loadScenario(next: SimScenario) {
    setScenario(next);
    setChallengeResult(null);
    setConfig(next.config);
    reset(next.config);
    start();
  }

  function chooseOption(optionId: string) {
    if (!scenario) return;
    const option = scenario.options.find((entry) => entry.id === optionId);
    if (!option) return;

    const nextConfig = { ...scenario.config, ...option.effect };
    setConfig(nextConfig);
    reset(nextConfig);
    start();

    if (challengeTimer.current) window.clearTimeout(challengeTimer.current);
    challengeTimer.current = window.setTimeout(() => {
      pause();
      setChallengeResult(option.explanation);
    }, 6000);
  }

  const trafficValue =
    TRAFFIC_PRESETS.find((preset) => preset.arrivalRate === config.arrivalRate)
      ?.value ?? TRAFFIC_PRESETS[0].value;
  const processingValue =
    PROCESSING_PRESETS.find((preset) => preset.processingMs === config.processingMs)
      ?.value ?? PROCESSING_PRESETS[1].value;
  const failureValue =
    FAILURE_PRESETS.find((preset) => preset.failureRate === config.failureRate)
      ?.value ?? FAILURE_PRESETS[0].value;
  const dataErrorValue =
    DATA_ERROR_PRESETS.find(
      (preset) => preset.dataErrorRate === config.dataErrorRate,
    )?.value ?? DATA_ERROR_PRESETS[0].value;

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="inline-flex items-center gap-1.5 rounded border border-term/40 bg-term/10 px-3 py-1.5 font-mono text-[11px] text-term transition-colors hover:bg-term/20"
        >
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? "Pausar" : "Iniciar"}
        </button>
        <ActionButton onClick={handleReset}>
          <RotateCcw className="inline size-3" /> Reiniciar
        </ActionButton>
        <ActionButton onClick={() => run((engine) => engine.prefill(40))}>
          Ráfaga +40
        </ActionButton>
        <ActionButton onClick={() => run((engine) => engine.createOrder(10))}>
          +10 pedidos
        </ActionButton>
        <ActionButton
          tone="danger"
          onClick={() => run((engine) => engine.killWorker())}
        >
          Matar worker
        </ActionButton>
        <ActionButton
          tone="success"
          onClick={() => run((engine) => engine.restartWorker())}
        >
          Reiniciar worker
        </ActionButton>
        <ActionButton onClick={() => run((engine) => engine.retryFailed())}>
          Reintentar fallidos
        </ActionButton>
        <ActionButton onClick={() => run((engine) => engine.clearQueue())}>
          Vaciar cola
        </ActionButton>
      </div>

      {/* Vistas */}
      <div role="tablist" aria-label="Vistas del laboratorio" className="flex gap-1.5">
        {(["sim", "arch", "code"] as View[]).map((entry) => (
          <button
            key={entry}
            role="tab"
            aria-selected={view === entry}
            onClick={() => setView(entry)}
            className={
              view === entry
                ? "rounded border border-term/50 bg-term/15 px-3 py-1.5 font-mono text-[11px] text-term"
                : "rounded border border-crema/15 bg-ink/40 px-3 py-1.5 font-mono text-[11px] text-crema/60 hover:text-crema/85"
            }
          >
            {entry === "sim"
              ? "Simulación"
              : entry === "arch"
                ? "Arquitectura"
                : "Implementación"}
          </button>
        ))}
      </div>

      {view === "sim" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <SimTrace
              workers={snapshot.workers}
              queueDepth={snapshot.queueDepth}
              apiDown={config.apiDown}
              databaseDown={config.databaseDown}
            />

            <MetricGrid>
              <Metric label="Cola" value={snapshot.queueDepth} max={60} tone={snapshot.queueDepth > 30 ? "danger" : "term"} />
              <Metric label="Procesando" value={snapshot.processing} max={Math.max(snapshot.workers.length, 1)} tone="warning" />
              <Metric label="Completados" value={snapshot.completed} />
              <Metric label="Throughput /s" value={snapshot.throughput} max={Math.max(config.arrivalRate, 1)} />
              <Metric label="Fallidos" value={snapshot.failed} tone="danger" />
              <Metric label="Errores de datos" value={snapshot.dataErrors} tone="danger" />
              <Metric label="Reintentos" value={snapshot.retries} tone="warning" />
              <Metric label="Dead letters" value={snapshot.deadLetters} tone="danger" />
              <Metric label="Workers" value={snapshot.workers.length} />
            </MetricGrid>

            <div>
              <h3 className="mb-2 font-mono text-[11px] tracking-widest text-crema/65 uppercase">
                Registro de eventos
              </h3>
              <EventLog events={snapshot.events} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
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
                  tip="Trabajo entrante por segundo simulado."
                />
                <ControlGroup
                  label="Workers"
                  value={config.workers}
                  onChange={(value) => update({ workers: value })}
                  options={WORKER_OPTIONS.map((count) => ({
                    value: count,
                    label: String(count),
                  }))}
                />
                <ControlGroup
                  label="Tiempo de proceso"
                  value={processingValue}
                  onChange={(value: ProcessingValue) =>
                    update({ processingMs: processingPreset(value).processingMs })
                  }
                  options={PROCESSING_PRESETS.map((preset) => ({
                    value: preset.value,
                    label: preset.label,
                  }))}
                />
                <ControlGroup
                  label="Fallos transitorios"
                  value={failureValue}
                  onChange={(value: FailureValue) =>
                    update({ failureRate: failurePreset(value).failureRate })
                  }
                  options={FAILURE_PRESETS.map((preset) => ({
                    value: preset.value,
                    label: preset.label,
                  }))}
                  tip="Timeout, rate limit o red: estos sí se reintentan."
                />
                <ControlGroup
                  label="Datos inválidos"
                  value={dataErrorValue}
                  onChange={(value: DataErrorValue) =>
                    update({ dataErrorRate: dataErrorPreset(value).dataErrorRate })
                  }
                  options={DATA_ERROR_PRESETS.map((preset) => ({
                    value: preset.value,
                    label: preset.label,
                  }))}
                  tip="Fallos permanentes (payloads malos). No se reintentan: van directo a la DLQ."
                />
              </div>
            </div>

            <div className="rounded-xl border border-term-red/20 bg-term-red/[0.04] p-4">
              <h2 className="font-sans text-sm font-semibold text-crema">
                Dead-letter queue ({snapshot.deadLetters})
              </h2>
              {snapshot.dlq.length === 0 ? (
                <p className="mt-2 font-mono text-[11px] text-crema/60">
                  vacía — ningún mensaje agotó sus reintentos
                </p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {snapshot.dlq.map((message) => (
                    <li
                      key={message.id}
                      className="rounded border border-term-red/40 bg-ink/50 px-2 py-1 font-mono text-[10px] text-term-red"
                    >
                      #{message.id}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs leading-relaxed text-crema/70">
                Una{" "}
                <Term tip="Destino para mensajes que fallan repetidamente al procesarse.">
                  dead-letter queue
                </Term>{" "}
                evita que los mensajes que fallan siempre bloqueen el
                procesamiento normal.
              </p>
            </div>

            <ShareBar
              path="/cantaro-labs/queue"
              query={encodeQueueParams(config)}
              title="Cantaro Labs — reto de colas"
            />
          </div>
        </div>
      )}

      {view === "arch" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="mb-3 font-sans text-sm font-semibold text-crema">
              Arquitectura del laboratorio
            </h2>
            <ol className="space-y-2">
              {[
                "Navegador",
                "Frontend (estado de React)",
                "Motor de simulación (en memoria)",
                "Abstracción de cola",
                "Pool de workers",
                "Motor de métricas",
              ].map((layer, index) => (
                <li
                  key={layer}
                  className="flex items-center gap-3 rounded-lg border border-term/15 bg-term/[0.03] px-3 py-2 font-mono text-[11px] text-crema/75"
                >
                  <span className="text-crema/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {layer}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-col gap-2">
              <Disclosure label="¿Por qué?">
                Desacoplar al productor del consumidor permite que la API acepte
                trabajo más rápido de lo que los workers lo procesan, absorbiendo
                picos sin perder mensajes.
              </Disclosure>
              <Disclosure label="Trade-offs">
                Una cola añade un salto y consistencia eventual. Cambias
                respuestas inmediatas por throughput y resiliencia.
              </Disclosure>
              <Disclosure label="Modos de fallo">
                Mensajes envenenados, tormentas de reintentos, workers que caen a
                mitad de trabajo y una base de datos saturada. El lab te deja
                provocar cada uno.
              </Disclosure>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="mb-3 font-sans text-sm font-semibold text-crema">
              Pipeline de referencia
            </h2>
            <ArchitectureDiagram />
          </div>
        </div>
      )}

      {view === "code" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <CodeBlock code={CODE_EXCERPT} />
          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold text-crema">
              Bajo el capó
            </h2>
            <UnderTheHood />
          </div>
        </div>
      )}

      {/* Educación */}
      <div className="flex flex-col gap-2">
        <Disclosure label="¿Por qué los mensajes sobreviven si mato un worker?">
          Cuando un worker muere a mitad del trabajo, el mensaje que tenía vuelve
          a la cola. Esto es{" "}
          <Term tip="Un mensaje no se elimina hasta que se confirma, así una caída no lo pierde.">
            entrega at-least-once
          </Term>
          : la cola mantiene el mensaje vivo para otro worker.
        </Disclosure>
        <Disclosure label="¿Qué es el back-pressure?">
          El{" "}
          <Term tip="Cuando el trabajo entrante es más rápido de lo que el sistema puede procesar.">
            back-pressure
          </Term>{" "}
          es lo que pasa cuando la tasa de llegada supera la capacidad de proceso.
          La cola crece. La solución es más capacidad, menos carga, o ambas.
        </Disclosure>
        <Disclosure label="No todos los fallos deberían reintentarse">
          Los fallos{" "}
          <Term tip="Timeout, rate limit, errores de red: probablemente funcionen en un intento posterior.">
            transitorios
          </Term>{" "}
          se reintentan. Los fallos{" "}
          <Term tip="Payloads inválidos o mal formados: reintentar no los arregla.">
            permanentes
          </Term>{" "}
          (datos inválidos) van directo a la DLQ: reintentar datos malos solo
          consume capacidad sin llegar a funcionar nunca.
        </Disclosure>
        <Disclosure label="Por qué reintentar puede empeorar las cosas">
          Reintentar fallos transitorios ayuda. Reintentar un mensaje roto para
          siempre crea una tormenta de reintentos. Por eso los intentos son
          acotados y los mensajes envenenados se mueven a la DLQ.
        </Disclosure>
      </div>

      {/* Modo reto */}
      <div className="rounded-xl border border-gold/25 bg-gold/[0.04] p-5">
        <h2 className="font-sans text-base font-semibold text-crema">
          ¿Puedes arreglar el sistema?
        </h2>
        <p className="mt-1.5 text-sm text-crema/60">
          Carga un incidente simulado y elige qué cambiar.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SCENARIOS.map((entry) => (
            <ActionButton key={entry.id} onClick={() => loadScenario(entry)}>
              {entry.title}
            </ActionButton>
          ))}
        </div>

        {scenario && (
          <div className="mt-5 rounded-lg border border-crema/10 bg-ink/50 p-4">
            <p className="font-mono text-[11px] tracking-widest text-term-red uppercase">
              🚨 Incidente
            </p>
            <p className="mt-2 text-sm text-crema/70">{scenario.brief}</p>
            <p className="mt-4 font-mono text-xs text-crema/80">
              {scenario.question}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {scenario.options.map((option) => (
                <ActionButton key={option.id} onClick={() => chooseOption(option.id)}>
                  {option.label}
                </ActionButton>
              ))}
            </div>
            {challengeResult && (
              <p
                aria-live="polite"
                className="mt-4 border-l-2 border-term/40 pl-3 text-sm leading-relaxed text-crema/70"
              >
                {challengeResult}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
