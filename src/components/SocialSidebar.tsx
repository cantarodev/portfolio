import { Mail } from "lucide-react";

import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { PERSONAL } from "@/lib/constants";

/** Barra social fija lateral (solo desktop). */
export function SocialSidebar() {
  return (
    <aside
      aria-label="Redes y contacto"
      className="fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 flex-col items-center gap-6 lg:flex"
    >
      <a
        href={PERSONAL.github}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        className="text-crema/65 transition-all duration-200 hover:scale-110 hover:text-term"
      >
        <GithubIcon className="size-4" />
      </a>
      <a
        href={PERSONAL.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        className="text-crema/65 transition-all duration-200 hover:scale-110 hover:text-term"
      >
        <LinkedinIcon className="size-4" />
      </a>
      <a
        href={`mailto:${PERSONAL.email}`}
        aria-label="Contacto"
        className="text-crema/65 transition-all duration-200 hover:scale-110 hover:text-term"
      >
        <Mail className="size-4" />
      </a>
      <span
        aria-hidden
        className="h-16 w-px bg-gradient-to-b from-term/40 to-transparent"
      />
    </aside>
  );
}
