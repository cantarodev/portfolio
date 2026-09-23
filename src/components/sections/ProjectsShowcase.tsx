import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Sparkles, X } from "lucide-react";

import { Section } from "@/components/sections/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/brand-icons";
import { revealItem } from "@/components/ui/reveal";
import {
  CASE_STUDY,
  FEATURED_PROJECT,
  PERSONAL,
  PROJECTS,
  SYSTEM_FLOW,
} from "@/lib/constants";

type Project = (typeof PROJECTS)[number];

function CardVisual({ accent }: { accent: string }) {
  return (
    <div
      className="relative h-28 overflow-hidden border-b border-term/10"
      style={{
        backgroundImage: `radial-gradient(120% 120% at 15% 0%, ${accent}22 0%, transparent 55%), linear-gradient(135deg, #0a1712 0%, #050807 60%)`,
      }}
      aria-hidden
    >
      <div className="grid-floor absolute inset-0 opacity-20" />
      <ol className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1 font-mono text-[9px]">
        {SYSTEM_FLOW.map((step, index) => (
          <li key={step} className="flex items-center gap-1">
            <span className="rounded border border-crema/15 bg-ink/60 px-1.5 py-0.5 text-crema/70">
              {step}
            </span>
            {index < SYSTEM_FLOW.length - 1 && (
              <span className="text-term/40">→</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const isFeatured = project?.id === FEATURED_PROJECT.id;

  return (
    <Dialog.Root open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[80] max-h-[86svh] w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-term/20 bg-ink/95 p-5 shadow-2xl backdrop-blur-md focus:outline-none sm:p-7">
          {project && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="font-sans text-xl font-semibold text-crema sm:text-2xl">
                    {project.name}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 font-mono text-[11px] text-term/80">
                    {project.tagline}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Cerrar">
                    <X />
                  </Button>
                </Dialog.Close>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-crema/70">
                {project.description}
              </p>

              {isFeatured && (
                <>
                  <div className="mt-6">
                    <h3 className="font-mono text-[11px] tracking-widest text-term/70 uppercase">
                      Problema
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-crema/65">
                      {CASE_STUDY.problem}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-mono text-[11px] tracking-widest text-term/70 uppercase">
                      Enfoque
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-crema/70">
                      {FEATURED_PROJECT.approach.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span
                            aria-hidden
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-term"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-mono text-[11px] tracking-widest text-term/70 uppercase">
                      Capacidades
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {FEATURED_PROJECT.indicators.map((indicator) => (
                        <li key={indicator}>
                          <Badge variant="term">{indicator}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="mt-6">
                <h3 className="font-mono text-[11px] tracking-widest text-term/70 uppercase">
                  Stack
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge variant="outline">{tech}</Badge>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {project.repo && (
                  <Button asChild>
                    <a href={project.repo} target="_blank" rel="noreferrer">
                      <GithubIcon /> Repositorio
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <a href="#architecture">
                    Ver arquitectura <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProjectsShowcase() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <Section
      id="projects"
      eyebrow="Proyectos"
      title="Lo que he construido"
      intro="Sistemas reales, con arquitectura y decisiones técnicas. Toca una tarjeta para ver el detalle."
      className="border-t border-crema/5"
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {PROJECTS.map((project) => (
          <motion.li
            key={project.id}
            variants={revealItem}
            whileHover={{ y: -4 }}
            className="group flex flex-col overflow-hidden rounded-xl border border-term/15 bg-term/[0.03] transition-colors hover:border-term/40"
          >
            <CardVisual accent={project.featured ? "#39ff88" : "#c98a4b"} />

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2">
                {project.featured && (
                  <Sparkles className="size-3.5 text-term" aria-hidden />
                )}
                <h3 className="font-sans text-lg font-semibold text-crema">
                  {project.name}
                </h3>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-term/75">
                {project.tagline}
              </p>
              <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-crema/60">
                {project.description}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.slice(0, 4).map((tech) => (
                  <li
                    key={tech}
                    className="rounded border border-crema/15 bg-ink/40 px-2 py-0.5 font-mono text-[10px] text-crema/70"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(project)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-term/45 bg-term/10 px-3.5 font-mono text-[11px] text-term transition-all duration-200 hover:bg-term/20"
                >
                  Ver detalle <ArrowUpRight className="size-3.5" aria-hidden />
                </button>
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Repositorio de ${project.name}`}
                    className="grid size-9 place-items-center rounded-lg border border-crema/15 text-crema/60 transition-all duration-200 hover:border-term/40 hover:text-term"
                  >
                    <GithubIcon />
                  </a>
                )}
              </div>
            </div>
          </motion.li>
        ))}

        {/* Tarjeta: más proyectos en GitHub */}
        <motion.li
          variants={revealItem}
          whileHover={{ y: -4 }}
          className="flex flex-col justify-center gap-4 rounded-xl border border-crema/12 bg-crema/[0.02] p-6"
        >
          <div>
            <h3 className="font-sans text-lg font-semibold text-crema">
              Más proyectos y experimentos
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-crema/60">
              Backend, infraestructura y utilidades en repositorios públicos.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <a href={PERSONAL.github} target="_blank" rel="noreferrer">
              <GithubIcon /> Ver repositorios
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
        </motion.li>
      </motion.ul>

      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}
