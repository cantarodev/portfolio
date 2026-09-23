import { motion } from "framer-motion";

import { Section } from "@/components/sections/Section";
import { revealItem } from "@/components/ui/reveal";
import { PRINCIPLES } from "@/lib/constants";

export function Principles() {
  return (
    <Section
      id="principles"
      eyebrow="Cómo trabajo"
      title="Principios de ingeniería"
      intro="Una lista corta que uso de verdad al tomar decisiones."
      className="border-t border-crema/5"
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PRINCIPLES.map((principle) => (
          <motion.li
            key={principle.title}
            variants={revealItem}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-crema/10 bg-crema/[0.02] p-5"
          >
            <h3 className="font-sans text-base font-semibold text-copper">
              {principle.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-crema/65">
              {principle.body}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
