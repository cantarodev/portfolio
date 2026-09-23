import Link from "@/components/ui/link";
import { AlertTriangle, ArrowRight, Clock, Workflow, Zap } from "lucide-react";

import type { LABS } from "@/lib/constants";

const ICONS = {
  workflow: Workflow,
  zap: Zap,
  alert: AlertTriangle,
} as const;

export function LabCard({
  lab,
}: {
  lab: (typeof LABS)[number];
}) {
  const Icon = ICONS[lab.icon];
  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-term/15 bg-term/[0.03] p-5 transition-colors hover:border-term/35">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-term/20 bg-ink/50">
          <Icon className="size-4 text-term" />
        </span>
        <h3 className="font-sans text-base font-semibold text-crema">
          {lab.name}
        </h3>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-crema/65">
        {lab.question}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-crema/65">
        <span>{lab.difficulty}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" /> {lab.duration}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {lab.concepts.map((concept) => (
          <li
            key={concept}
            className="rounded border border-crema/15 bg-ink/40 px-2 py-0.5 font-mono text-[10px] text-crema/70"
          >
            {concept}
          </li>
        ))}
      </ul>

      <Link
        href={lab.href}
        className="mt-5 inline-flex items-center gap-1.5 self-start rounded border border-term/40 bg-term/10 px-3 py-1.5 font-mono text-[11px] text-term transition-colors hover:bg-term/20"
      >
        Jugar <ArrowRight className="size-3.5" />
      </Link>
    </article>
  );
}
