import { ArchitectureDiagram } from "@/components/sections/ArchitectureDiagram";
import { Section } from "@/components/sections/Section";
import { Reveal } from "@/components/ui/reveal";

export function ArchitectureSection() {
  return (
    <Section
      id="architecture"
      eyebrow="Diseño de sistemas"
      title="Arquitectura"
      intro="Aceptar trabajo rápido, procesarlo de forma asíncrona, aislar fallos y mantener los datos consistentes."
      className="border-t border-crema/5"
    >
      <Reveal className="max-w-2xl">
        <ArchitectureDiagram />
      </Reveal>
    </Section>
  );
}
