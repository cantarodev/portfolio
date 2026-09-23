import { Mail } from "lucide-react";

import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { PERSONAL } from "@/lib/constants";

/** Dock social inferior (solo mobile): iconos + texto cómodos para el pulgar. */
export function MobileSocialDock() {
  const linkClass =
    "flex flex-1 flex-col items-center gap-1 py-1 font-mono text-[10px] text-crema/60 transition-colors duration-200 hover:text-term";

  return (
    <nav
      aria-label="Redes y contacto"
      className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t border-term/15 bg-ink/90 px-6 py-3 backdrop-blur-md lg:hidden"
    >
      <a
        href={PERSONAL.github}
        target="_blank"
        rel="noreferrer"
        className={linkClass}
      >
        <GithubIcon className="size-4" />
        GitHub
      </a>
      <a
        href={PERSONAL.linkedin}
        target="_blank"
        rel="noreferrer"
        className={linkClass}
      >
        <LinkedinIcon className="size-4" />
        LinkedIn
      </a>
      <a href={`mailto:${PERSONAL.email}`} className={linkClass}>
        <Mail className="size-4" aria-hidden />
        Contacto
      </a>
    </nav>
  );
}
