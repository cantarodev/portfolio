import { Download, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { CTA, PERSONAL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-crema/10 bg-ink/85 px-4 pt-10 pb-20 backdrop-blur sm:px-6 lg:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-crema">
            {PERSONAL.name}
          </p>
          <p className="font-mono text-[11px] text-crema/65">
            {PERSONAL.role}
          </p>
        </div>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-crema/60">
            <li>
              <a
                href={PERSONAL.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-term"
              >
                <GithubIcon /> GitHub
              </a>
            </li>
            <li>
              <a
                href={PERSONAL.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-term"
              >
                <LinkedinIcon /> LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PERSONAL.email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-term"
              >
                <Mail className="size-4" /> Email
              </a>
            </li>
          </ul>
        </nav>

        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={PERSONAL.resume} download>
            <Download className="size-4" aria-hidden />
            {CTA.cv}
          </a>
        </Button>
      </div>

      <p className="mx-auto mt-6 max-w-6xl font-mono text-[11px] text-crema/60">
        Ingeniería backend · cloud · integración. © 2026 {PERSONAL.name} · cantaro.dev
      </p>
    </footer>
  );
}
