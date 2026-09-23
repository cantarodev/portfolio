import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import {
  ActionButton,
  CodeBlock,
  Disclosure,
  EventLog,
  Metric,
  MetricGrid,
  ShareBar,
  SimTrace,
  Term,
} from "@/components/labs/ui";
import { useSimulation } from "@/components/labs/use-simulation";
import type { QueueConfig } from "@/lib/sim/queue-engine";
import { BASE_CONFIG } from "@/lib/sim/presets";
import { decodeQueryString, encodeQueueParams } from "@/lib/sim/url";

const RECOVERY_EXCERPT = `// El manejo de fallos vive en el límite del worker
procesarTrabajo(message) {
  try        { return await manejar(message) }
  catch (e)  {
    if (backoff.programado(message)) return   // reintentar luego
    if (message.attempts >= maxRetries)       // envenenado
      return dlq.publicar(message)
    throw e
  }
}`;

function StatusPill({ label, healthy }: { label: string; healthy: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] ${
        healthy
          ? "border-term/30 bg-term/[0.04] text-term"
          : "border-term-red/40 bg-term-red/[0.06] text-term-red"
      }`}
    >
      <span
        aria-hidden
        className={`size-2 rounded-full ${healthy ? "bg-term" : "bg-term-red"}`}
      />
      {label}
    </div>
  );
}

export function FailureLab() {
  const [config, setConfig] = useState<QueueConfig>(() => ({
    ...BASE_CONFIG,
    arrivalRate: 6,
    workers: 3,
    ...(typeof window !== "undefined"
      ? decodeQueryString(window.location.search)
      : {}),
  }));
  const [lastInjection, setLastInjection] = useState<string | null>(null);

  const { snapshot, running, start, pause, reset, run, configure } =
    useSimulation(config);

  function update(partial: Partial<QueueConfig>) {
    setConfig((previous) => ({ ...previous, ...partial }));
    configure(partial);
  }

  const downWorkers = snapshot.workers.filter((w) => w.status === "down").length;
  const apiHealthy = !config.apiDown;
  const dbHealthy = !config.databaseDown && config.processingFactor <= 1;
  const workersHealthy = downWorkers === 0 && snapshot.workers.length > 0;
  const degraded =
    !apiHealthy || !dbHealthy || !workersHealthy || config.failureRate > 0;

  const affected = snapshot.retries + snapshot.failed;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="inline-flex items-center gap-1.5 rounded border border-term/40 bg-term/10 px-3 py-1.5 font-mono text-[11px] text-term transition-colors hover:bg-term/20"
        >
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? "Pausar" : "Iniciar"}
        </button>
        <ActionButton
          onClick={() => {
            setLastInjection(null);
            reset({
              ...config,
              apiDown: false,
              databaseDown: false,
              processingFactor: 1,
              failureRate: 0,
              dataErrorRate: 0,
            });
            setConfig((previous) => ({
              ...previous,
              apiDown: false,
              databaseDown: false,
              processingFactor: 1,
              failureRate: 0,
              dataErrorRate: 0,
            }));
          }}
        >
          <RotateCcw className="inline size-3" /> Recuperación limpia
        </ActionButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatusPill label="API" healthy={apiHealthy} />
        <StatusPill label="Cola" healthy />
        <StatusPill
          label={`Workers (${snapshot.workers.length - downWorkers})`}
          healthy={workersHealthy}
        />
        <StatusPill label="Base de datos" healthy={dbHealthy} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SimTrace
            workers={snapshot.workers}
            queueDepth={snapshot.queueDepth}
            apiDown={config.apiDown}
            databaseDown={config.databaseDown}
          />

          <MetricGrid>
            <Metric label="Mensajes afectados" value={affected} tone="warning" />
            <Metric label="Recuperados" value={snapshot.completed} />
            <Metric label="Reintentos" value={snapshot.retries} tone="warning" />
            <Metric label="Errores de datos" value={snapshot.dataErrors} tone="danger" />
            <Metric label="Perdidos (DLQ)" value={snapshot.failed} tone="danger" />
          </MetricGrid>

          <div>
            <h2 className="mb-2 font-mono text-[11px] tracking-widest text-crema/65 uppercase">
              Línea de recuperación
            </h2>
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              {["SANOS", "FALLO", "DETECCIÓN", "REINTENTO / FAILOVER", "RECUPERACIÓN"].map(
                (step, index) => (
                  <li key={step} className="flex items-center gap-2">
                    <span
                      className={`rounded border px-2 py-1 ${
                        degraded && index > 0 && index < 4
                          ? "border-gold/40 text-gold"
                          : "border-term/25 text-term/70"
                      }`}
                    >
                      {step}
                    </span>
                    {index < 4 && <span className="text-crema/60">→</span>}
                  </li>
                ),
              )}
            </ol>
          </div>

          <div>
            <h2 className="mb-2 font-mono text-[11px] tracking-widest text-crema/65 uppercase">
              Registro de eventos
            </h2>
            <EventLog events={snapshot.events} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-term-red/20 bg-term-red/[0.04] p-4">
            <h2 className="font-sans text-sm font-semibold text-crema">
              Inyectar fallo
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                tone="danger"
                onClick={() => {
                  update({ apiDown: true });
                  setLastInjection("La API está caída — no llegan mensajes nuevos.");
                }}
              >
                Caer API
              </ActionButton>
              <ActionButton
                onClick={() => {
                  update({ apiDown: false });
                  setLastInjection("API restaurada — vuelven las llegadas.");
                }}
              >
                Restaurar API
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => {
                  update({ databaseDown: true });
                  setLastInjection(
                    "Base de datos no disponible — cada intento falla hasta agotar los reintentos en la DLQ.",
                  );
                }}
              >
                BD no disponible
              </ActionButton>
              <ActionButton
                onClick={() => {
                  update({ databaseDown: false, processingFactor: 1 });
                  setLastInjection("Base de datos restaurada a velocidad normal.");
                }}
              >
                Restaurar BD
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => {
                  update({ processingFactor: 3 });
                  setLastInjection(
                    "Base de datos lenta — el tiempo de proceso se triplica y el throughput cae.",
                  );
                }}
              >
                BD lenta
              </ActionButton>
              <ActionButton onClick={() => run((engine) => engine.killWorker())}>
                Matar worker
              </ActionButton>
              <ActionButton onClick={() => run((engine) => engine.restartWorker())}>
                Reiniciar worker
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => {
                  update({ failureRate: 0.25 });
                  setLastInjection(
                    "Fallos transitorios al 25% (timeout / rate limit / red) — estos se reintentan.",
                  );
                }}
              >
                Transitorios 25%
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => {
                  update({ dataErrorRate: 0.25 });
                  setLastInjection(
                    "Datos inválidos al 25% — los fallos permanentes no se reintentan y van directo a la DLQ.",
                  );
                }}
              >
                Datos inválidos 25%
              </ActionButton>
              <ActionButton onClick={() => update({ failureRate: 0, dataErrorRate: 0 })}>
                Limpiar fallos
              </ActionButton>
              <ActionButton onClick={() => run((engine) => engine.prefill(40))}>
                Backlog +40
              </ActionButton>
              <ActionButton onClick={() => run((engine) => engine.retryFailed())}>
                Reintentar DLQ
              </ActionButton>
            </div>
            {lastInjection && (
              <p aria-live="polite" className="mt-3 text-xs text-crema/65">
                {lastInjection}
              </p>
            )}
          </div>

          <CodeBlock code={RECOVERY_EXCERPT} />

          <ShareBar
            path="/cantaro-labs/failure"
            query={encodeQueueParams(config)}
            title="Cantaro Labs — reto de fallos"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Disclosure label="¿Qué cuenta como fallo?">
          Los errores transitorios (timeout, rate limit, red) se reintentan. Los
          errores permanentes (datos inválidos o mal formados) no — reintentarlos
          no puede funcionar, así que van directo a la{" "}
          <Term tip="Destino para mensajes que fallan repetidamente al procesarse.">
            dead-letter queue
          </Term>
          .
        </Disclosure>
        <Disclosure label="¿Por qué importa la DLQ?">
          Evita que un mensaje envenenado bloquee el tráfico sano y conserva el
          mensaje para inspeccionarlo después en lugar de descartarlo en silencio.
        </Disclosure>
      </div>
    </div>
  );
}
