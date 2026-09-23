import { useId, useState } from "react";
import { Check, Copy, ExternalLink, Info } from "lucide-react";

import type { SimEvent, SimWorker } from "@/lib/sim/queue-engine";
import { cn } from "@/lib/utils";

/* -- Controls ----------------------------------------------------------- */

export function ControlGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  tip,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  tip?: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-crema/50 uppercase">
        {label}
        {tip && <Term tip={tip}>?</Term>}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                active
                  ? "border-term/50 bg-term/15 text-term"
                  : "border-crema/15 bg-ink/40 text-crema/60 hover:border-crema/30 hover:text-crema/85",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  tone = "default",
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger" | "success";
  disabled?: boolean;
  /** When provided, renders the button as a toggle (aria-pressed). */
  active?: boolean;
}) {
  const tones = {
    default: "border-crema/20 text-crema/80 hover:border-crema/40 hover:text-crema",
    danger: "border-term-red/40 text-term-red hover:bg-term-red/10",
    success: "border-term/40 text-term hover:bg-term/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded border bg-ink/40 px-2.5 py-1.5 font-mono text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
      )}
    >
      {children}
    </button>
  );
}

/* -- Metrics ------------------------------------------------------------ */

export function MetricBar({
  value,
  tone = "term",
}: {
  value: number;
  tone?: "term" | "warning" | "danger";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const tones = {
    term: "bg-term",
    warning: "bg-gold",
    danger: "bg-term-red",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-crema/10">
      <div
        className={cn("h-full rounded-full transition-[width] duration-200", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Metric({
  label,
  value,
  max,
  tone = "term",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: "term" | "warning" | "danger";
}) {
  const display = Number.isFinite(value) ? Math.round(value) : 0;
  return (
    <div className="rounded-lg border border-crema/10 bg-ink/40 p-3">
      <p className="font-mono text-[10px] tracking-widest text-crema/45 uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl text-crema tabular-nums">{display}</p>
      {max !== undefined && (
        <div className="mt-2">
          <MetricBar value={(display / max) * 100} tone={tone} />
        </div>
      )}
    </div>
  );
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-live="polite"
      aria-label="Métricas de la simulación en vivo"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
    >
      {children}
    </div>
  );
}

/* -- Event log ---------------------------------------------------------- */

const EVENT_TONE: Record<SimEvent["kind"], string> = {
  enqueue: "text-crema/60",
  success: "text-term",
  failure: "text-term-red",
  retry: "text-gold",
  dlq: "text-term-red",
  worker_down: "text-term-red",
  worker_up: "text-term",
  scale: "text-term-cyan",
  info: "text-crema/50",
};

export function EventLog({ events }: { events: SimEvent[] }) {
  return (
    <div
      className="h-40 overflow-y-auto rounded-lg border border-crema/10 bg-ink/60 p-3 font-mono text-[11px]"
      aria-live="polite"
      aria-label="Registro de eventos de la simulación"
    >
      {events.length === 0 ? (
        <p className="text-crema/30">Aún no hay eventos. Inicia la simulación.</p>
      ) : (
        <ul className="space-y-1">
          {events.map((event) => (
            <li key={event.id} className={cn("flex gap-2", EVENT_TONE[event.kind])}>
              <span className="shrink-0 tabular-nums text-crema/25">
                {event.time.toFixed(1)}s
              </span>
              <span className="break-words">{event.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -- Trace diagram ------------------------------------------------------ */

const STATUS_LABEL: Record<SimWorker["status"], string> = {
  idle: "libre",
  busy: "ocupado",
  down: "caído",
};

export function SimTrace({
  workers,
  queueDepth,
  apiDown,
  databaseDown,
}: {
  workers: SimWorker[];
  queueDepth: number;
  apiDown?: boolean;
  databaseDown?: boolean;
}) {
  const dots = Math.min(queueDepth, 24);
  return (
    <div className="rounded-xl border border-term/15 bg-term/[0.03] p-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <TraceNode
          label="API"
          status={apiDown ? "down" : "ok"}
          subtitle={apiDown ? "caída" : "aceptando"}
        />

        <TraceArrow />

        <div className="min-w-0 flex-1 rounded-lg border border-term/25 bg-ink/50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-term">COLA</span>
            <span className="font-mono text-[10px] text-crema/40 tabular-nums">
              {queueDepth} en cola
            </span>
          </div>
          <div
            className="mt-2 flex flex-wrap gap-1"
            role="img"
            aria-label={`${queueDepth} mensajes esperando en la cola`}
          >
            {Array.from({ length: dots }).map((_, index) => (
              <span
                key={index}
                className="size-2 rounded-full bg-term/70"
              />
            ))}
            {queueDepth > dots && (
              <span className="font-mono text-[10px] text-crema/40">
                +{queueDepth - dots}
              </span>
            )}
            {queueDepth === 0 && (
              <span className="font-mono text-[10px] text-crema/30">vacía</span>
            )}
          </div>
        </div>

        <TraceArrow />

        <div className="min-w-0 flex-1 rounded-lg border border-crema/15 bg-ink/50 p-3">
          <span className="font-mono text-[11px] text-crema/70">WORKERS</span>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {workers.map((worker) => (
              <li
                key={worker.id}
                className={cn(
                  "flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px]",
                  worker.status === "down"
                    ? "border-term-red/40 text-term-red"
                    : worker.status === "busy"
                      ? "border-gold/40 text-gold"
                      : "border-term/30 text-term/80",
                )}
                title={`Worker ${worker.id}: ${STATUS_LABEL[worker.status]}`}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    worker.status === "down"
                      ? "bg-term-red"
                      : worker.status === "busy"
                        ? "bg-gold"
                        : "bg-term",
                  )}
                />
                w{worker.id}
              </li>
            ))}
          </ul>
        </div>

        <TraceArrow />

        <TraceNode
          label="DB"
          status={databaseDown ? "down" : "ok"}
          subtitle={databaseDown ? "no disponible" : "persistiendo"}
        />
      </div>
    </div>
  );
}

function TraceNode({
  label,
  status,
  subtitle,
}: {
  label: string;
  status: "ok" | "down";
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-lg border px-3 py-2 text-center",
        status === "down"
          ? "border-term-red/40 bg-term-red/[0.06]"
          : "border-term/25 bg-ink/50",
      )}
    >
      <p
        className={cn(
          "font-mono text-[11px]",
          status === "down" ? "text-term-red" : "text-term",
        )}
      >
        {label}
      </p>
      <p className="font-mono text-[10px] text-crema/40">{subtitle}</p>
    </div>
  );
}

function TraceArrow() {
  return (
    <span
      aria-hidden
      className="self-center font-mono text-crema/25 sm:rotate-0"
    >
      →
    </span>
  );
}

/* -- Tooltip ------------------------------------------------------------ */

/**
 * Inline glossary term. The definition is exposed via the native `title`
 * tooltip and an `aria-describedby` reference — no absolutely-positioned
 * popup, so it can never expand the layout viewport or block scrolling.
 */
export function Term({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const id = useId();
  return (
    <>
      <span
        tabIndex={0}
        title={tip}
        aria-describedby={id}
        className="cursor-help border-b border-dotted border-term/50 text-term/90 outline-none"
      >
        {children}
      </span>
      <span id={id} className="sr-only">
        {tip}
      </span>
    </>
  );
}

/* -- Code --------------------------------------------------------------- */

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-crema/10 bg-ink/70 p-4 font-mono text-[11px] leading-relaxed text-term/85">
      <code>{code}</code>
    </pre>
  );
}

/* -- Under the hood ----------------------------------------------------- */

export function UnderTheHood() {
  const layers = [
    "Motor de simulación — tick() de tiempo discreto",
    "Abstracción de cola — adaptador en memoria (listo para SQS / RabbitMQ)",
    "Pool de workers — capacidad finita, kill/restart",
    "Gestor de reintentos — intentos, backoff, enrutado a dead-letter",
    "Motor de métricas — contadores derivados, sin decoración",
  ];
  return (
    <ol className="space-y-2">
      {layers.map((layer, index) => (
        <li
          key={layer}
          className="flex items-center gap-3 rounded-lg border border-crema/10 bg-ink/40 px-3 py-2 font-mono text-[11px] text-crema/70"
        >
          <span className="text-crema/30">{String(index + 1).padStart(2, "0")}</span>
          {layer}
        </li>
      ))}
    </ol>
  );
}

/* -- Share -------------------------------------------------------------- */

export function ShareBar({
  path,
  query,
  title,
}: {
  path: string;
  query: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  function buildUrl() {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}${query ? `?${query}` : ""}`;
  }

  async function copy() {
    const url = buildUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este enlace", url);
    }
  }

  const url = buildUrl();
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton onClick={copy} tone="success">
        {copied ? <Check className="inline size-3" /> : <Copy className="inline size-3" />}{" "}
        {copied ? "Copiado" : "Copiar enlace"}
      </ActionButton>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded border border-crema/20 bg-ink/40 px-2.5 py-1.5 font-mono text-[11px] text-crema/70 transition-colors hover:border-crema/40 hover:text-crema"
      >
        LinkedIn <ExternalLink className="size-3" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded border border-crema/20 bg-ink/40 px-2.5 py-1.5 font-mono text-[11px] text-crema/70 transition-colors hover:border-crema/40 hover:text-crema"
      >
        X <ExternalLink className="size-3" />
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encoded}&title=${text}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded border border-crema/20 bg-ink/40 px-2.5 py-1.5 font-mono text-[11px] text-crema/70 transition-colors hover:border-crema/40 hover:text-crema"
      >
        Reddit <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

/* -- Disclosure --------------------------------------------------------- */

export function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-term/15 bg-term/[0.03] p-3">
      <summary className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-term/90 marker:content-['']">
        <Info className="size-3.5" />
        {label}
      </summary>
      <div className="mt-2 text-xs leading-relaxed text-crema/65">{children}</div>
    </details>
  );
}
