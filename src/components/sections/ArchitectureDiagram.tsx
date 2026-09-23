import { Reveal } from "@/components/ui/reveal";
import { ARCHITECTURE_STAGES } from "@/lib/constants";
import type { ArchitectureStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUP_STYLES: Record<
  NonNullable<ArchitectureStage["group"]>,
  string
> = {
  source: "border-term-cyan/25 bg-term-cyan/[0.04]",
  processing: "border-term/25 bg-term/[0.04]",
  storage: "border-copper/30 bg-copper/[0.05]",
};

const GROUP_LABELS: Record<
  NonNullable<ArchitectureStage["group"]>,
  string
> = {
  source: "Origen",
  processing: "Procesamiento",
  storage: "Almacenamiento",
};

/**
 * Diagrama de arquitectura responsive. Vertical por defecto (mobile-first),
 * así nunca provoca scroll horizontal. Las etiquetas llevan los conceptos.
 */
export function ArchitectureDiagram() {
  return (
    <ol
      aria-label="Pipeline de procesamiento de LinkedIn Market Intelligence"
      className="flex flex-col"
    >
      {ARCHITECTURE_STAGES.map((stage, index) => (
        <li key={stage.id} className="flex flex-col">
          <Reveal delay={index * 0.04}>
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors sm:p-5",
                GROUP_STYLES[stage.group ?? "processing"],
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-crema/10 bg-ink/60 font-mono text-[10px] text-crema/60"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-mono text-sm font-medium text-crema">
                      {stage.label}
                    </h3>
                    <span className="font-mono text-[10px] tracking-widest text-crema/60 uppercase">
                      {GROUP_LABELS[stage.group ?? "processing"]}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-crema/60">
                    {stage.detail}
                  </p>

                  {stage.id === "workers" && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      {["Worker", "Worker"].map((worker, workerIndex) => (
                        <div
                          key={workerIndex}
                          className="flex-1 rounded-lg border border-term/20 bg-ink/40 px-3 py-2 text-center font-mono text-[11px] text-term/80"
                        >
                          {worker}
                        </div>
                      ))}
                    </div>
                  )}

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {stage.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-crema/15 bg-ink/40 px-2 py-0.5 font-mono text-[10px] text-crema/70"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>

          {index < ARCHITECTURE_STAGES.length - 1 && (
            <div aria-hidden className="ml-[30px] h-7 w-px bg-term/25" />
          )}
        </li>
      ))}
    </ol>
  );
}
