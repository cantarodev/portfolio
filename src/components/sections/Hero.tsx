import { motion } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";

import { SystemFlowCard } from "@/components/SystemFlowCard";
import { Button } from "@/components/ui/button";
import { TECH_ICONS } from "@/components/ui/tech-icons";
import { CTA, HERO, PERSONAL } from "@/lib/constants";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Presentación"
      className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 lg:min-h-[calc(100vh-100px)] lg:grid-cols-2 lg:gap-12 lg:py-16"
    >
      {/* ---------- Columna izquierda: propuesta de valor ---------- */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="min-w-0"
      >
        <motion.p
          variants={item}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-term/20 bg-term/10 px-3 py-1 font-mono text-[11px] tracking-wide text-term"
        >
          {HERO.badge}
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-5 text-4xl font-bold tracking-tight text-crema lg:text-6xl"
        >
          {PERSONAL.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 font-mono text-lg text-term lg:text-xl"
        >
          {HERO.headline}
        </motion.p>

        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-sm leading-relaxed text-crema/70 lg:text-base"
        >
          {HERO.supporting}
        </motion.p>

        {/* Stack técnico */}
        <motion.ul variants={item} className="mt-6 flex flex-wrap gap-1.5">
          {HERO.stack.map((tech) => {
            const Icon = TECH_ICONS[tech] ?? TECH_ICONS.TypeScript;
            return (
              <li
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-md border border-crema/15 bg-ink/50 px-2.5 py-1 font-mono text-[11px] text-crema/75"
              >
                <Icon className="size-3.5 text-term/80" aria-hidden />
                {tech}
              </li>
            );
          })}
        </motion.ul>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="#projects">
              <ArrowUpRight />
              {CTA.explore}
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <a href={PERSONAL.resume} download>
              <Download />
              {CTA.cv}
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* ---------- Columna derecha: panel de arquitectura ---------- */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="visible"
        className="flex min-w-0 justify-center lg:justify-end"
      >
        <SystemFlowCard />
      </motion.div>
    </section>
  );
}
