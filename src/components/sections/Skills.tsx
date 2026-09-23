import { motion } from "framer-motion";

import { Section } from "@/components/sections/Section";
import { revealItem } from "@/components/ui/reveal";
import { SKILL_GROUPS } from "@/lib/constants";

export function Skills() {
  return (
    <Section
      id="stack"
      eyebrow="Capacidades"
      title="Stack y capacidades"
      intro="Agrupado por lo que puedo construir, no por logos."
      className="border-t border-crema/5"
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SKILL_GROUPS.map((group) => (
          <motion.li
            key={group.title}
            variants={revealItem}
            className="flex min-w-0 flex-col rounded-xl border border-term/15 bg-term/[0.03] p-5"
          >
            <h3 className="font-mono text-sm font-medium text-term">
              {group.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-crema/55">
              {group.summary}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded border border-crema/15 bg-ink/40 px-2 py-0.5 font-mono text-[10px] text-crema/75"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
