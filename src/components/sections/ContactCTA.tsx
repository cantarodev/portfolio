import { Download, Mail } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { Section } from "@/components/sections/Section";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Reveal } from "@/components/ui/reveal";
import { CTA, PERSONAL } from "@/lib/constants";

export function ContactCTA() {
  return (
    <Section
      id="contact"
      eyebrow="Contacto"
      title="Construyamos algo confiable"
      intro="¿Buscas un perfil Backend, Integración o Cloud Engineering?"
      className="border-t border-crema/5"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={PERSONAL.resume} download>
                <Download />
                {CTA.cv}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={PERSONAL.github} target="_blank" rel="noreferrer">
                <GithubIcon /> GitHub
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={PERSONAL.linkedin} target="_blank" rel="noreferrer">
                <LinkedinIcon /> LinkedIn
              </a>
            </Button>
          </div>

          <p className="mt-6 font-mono text-xs text-crema/70">
            <a
              href={`mailto:${PERSONAL.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-term"
            >
              <Mail className="size-4" /> {PERSONAL.email}
            </a>
          </p>

          <p className="mt-6 max-w-md border-l-2 border-term/30 pl-4 text-xs leading-relaxed text-crema/65">
            El formulario hace POST a un endpoint configurable (webhook / función
            serverless). Si no hay endpoint, abre tu cliente de correo. Sin
            secretos en el navegador.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-term/20 bg-ink/70 p-5 shadow-2xl shadow-term/5 backdrop-blur-md sm:p-6">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
