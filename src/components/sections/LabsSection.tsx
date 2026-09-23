import Link from "@/components/ui/link";
import { ArrowRight } from "lucide-react";

import { LabCard } from "@/components/labs/LabCard";
import { Section } from "@/components/sections/Section";
import { Reveal } from "@/components/ui/reveal";
import { LABS } from "@/lib/constants";

export function LabsSection() {
  return (
    <Section
      id="labs-home"
      eyebrow="Cantaro Labs"
      title="Juega con los sistemas que hay detrás del código."
      intro="Experimentos interactivos sobre colas, tráfico y fallos — cada uno corre una simulación real que puedes romper."
      className="border-t border-crema/5"
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {LABS.map((lab, index) => (
          <li key={lab.id} className="min-w-0">
            <Reveal delay={index * 0.07} className="h-full">
              <LabCard lab={lab} />
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link
          href="/cantaro-labs"
          className="inline-flex items-center gap-1.5 rounded border border-term/40 bg-term/10 px-4 py-2 font-mono text-xs text-term transition-colors hover:bg-term/20"
        >
          Explorar Labs <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </Section>
  );
}
