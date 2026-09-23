import { Fragment, useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";

import { FLOW_ICONS } from "@/components/ui/tech-icons";
import { CLOUD_SERVICES, SYSTEM_FLOW } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Primeros 4 nodos en fila; el almacenamiento va debajo del Worker. */
const PIPELINE = SYSTEM_FLOW.slice(0, 4);
const STORAGE = SYSTEM_FLOW[4];

function FlowNode({ step }: { step: string }) {
  const Icon = FLOW_ICONS[step] ?? FLOW_ICONS["API Gateway"];
  return (
    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-term/20 bg-term/[0.04] px-2 py-1.5 font-mono text-[10px] whitespace-nowrap text-crema/85 sm:w-auto sm:px-2.5">
      <Icon className="size-3.5 text-term/80" aria-hidden />
      {step}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-term/70" />
      <span className="relative inline-flex size-2 rounded-full bg-term" />
    </span>
  );
}

/**
 * Panel de arquitectura: `Petición → API Gateway → Cola SQS → Worker`, y
 * `Base de Datos` debajo del Worker con flecha descendente (evita overflow).
 *
 * Colapsable en móvil/tablet (< lg), oculto por defecto; siempre visible en
 * desktop (>= lg).
 */
export function SystemFlowCard({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("w-full max-w-xl", className)}>
      {/* Toggle (solo < lg) */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="system-flow"
        className="flex w-full items-center justify-between rounded-xl border border-term/20 bg-ink/90 px-4 py-3 font-mono text-[11px] text-term/85 backdrop-blur-md transition-colors duration-200 hover:bg-term/[0.06] lg:hidden"
      >
        <span className="flex items-center gap-2">
          <LiveDot />
          Flujo del sistema
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id="system-flow"
        className={cn(
          "rounded-xl border border-term/20 bg-ink/90 p-5 shadow-2xl shadow-term/5 backdrop-blur-md lg:block lg:p-6",
          open ? "mt-3 block" : "hidden lg:mt-0",
        )}
      >
        <p className="hidden items-center gap-2 font-mono text-[11px] text-term/85 lg:flex">
          <LiveDot />
          Flujo del sistema
        </p>

        {/* Fila principal: 4 nodos */}
        <div className="mt-5 flex w-full flex-col items-center justify-between gap-2 sm:flex-row sm:gap-1.5 lg:mt-5">
          {PIPELINE.map((step, index) => (
            <Fragment key={step}>
              <FlowNode step={step} />
              {index < PIPELINE.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="size-3.5 shrink-0 rotate-90 animate-pulse text-term/60 transition-transform duration-300 sm:rotate-0"
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* Persistencia debajo del Worker */}
        <div className="mt-2 flex flex-col items-center gap-2 sm:mt-1 sm:items-end sm:pr-1">
          <ArrowDown
            aria-hidden
            className="size-4 animate-pulse text-term/60"
          />
          <FlowNode step={STORAGE} />
        </div>

        {/* Telemetría de microservicios */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-term/10 pt-4 font-mono text-[10px] text-crema/70">
          <span className="tracking-widest text-crema/40 uppercase">
            Servicios
          </span>
          {CLOUD_SERVICES.map((service) => (
            <span key={service.id} className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-term" aria-hidden />
              {service.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
