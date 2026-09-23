import { Cloud, Database, KeyRound, ShieldCheck } from "lucide-react";

import { CLOUD_SERVICES } from "@/lib/constants";
import type { CloudState } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  sqs: Cloud,
  rds: Database,
  waf: ShieldCheck,
  ssm: KeyRound,
} as const;

/** Tooltips en inglés (pedido explícito para la cabecera). */
const TOOLTIP: Record<string, string> = {
  sqs: "HEALTHY · event-driven queue",
  rds: "ONLINE · Multi-AZ PostgreSQL",
  waf: "ACTIVE · rules + rate limiting",
  ssm: "SECURE · Session Manager (no SSH)",
};

const DOT: Record<CloudState, string> = {
  healthy: "bg-term",
  idle: "bg-term",
  active: "bg-term",
  warning: "bg-term-red",
};

/**
 * Telemetría de infraestructura del HUD.
 * `● EN VIVO | ☁ SQS ● | 🗄 RDS ● | 🛡 WAF ● | 🔑 SSM ●`
 */
export function CloudStatus({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto font-mono text-[10px] whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="Telemetría de infraestructura"
    >
      <span className="flex shrink-0 items-center gap-1.5 pr-1 text-term">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-term/70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-term" />
        </span>
        EN VIVO
      </span>

      {CLOUD_SERVICES.map((service) => {
        const Icon = ICONS[service.id as keyof typeof ICONS] ?? Cloud;
        return (
          <span
            key={service.id}
            className="flex shrink-0 items-center gap-1.5 rounded border border-term/20 bg-term/[0.04] px-2 py-1 text-crema/75"
            title={`${service.name}: ${TOOLTIP[service.id] ?? service.status}`}
          >
            <Icon className="size-3 text-term/80" aria-hidden />
            {service.name}
            <span
              className={cn(
                "size-1.5 rounded-full",
                DOT[service.state],
                service.state === "active" && "animate-pulse",
              )}
              aria-hidden
            />
          </span>
        );
      })}
    </div>
  );
}
