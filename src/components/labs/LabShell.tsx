import Link from "@/components/ui/link";
import { ArrowLeft } from "lucide-react";

import { LABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LabShell({
  currentId,
  title,
  question,
  children,
}: {
  currentId: string;
  title: string;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
      <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <Link
          href="/cantaro-labs"
          className="inline-flex items-center gap-1.5 text-crema/65 transition-colors hover:text-term"
        >
          <ArrowLeft className="size-3.5" /> cantaro-labs
        </Link>
        <span className="text-crema/60">/</span>
        <span className="text-term/80">{title}</span>
      </div>

      <header className="mb-8 max-w-3xl">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-crema sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-crema/60 sm:text-base">
          {question}
        </p>
      </header>

      <nav aria-label="Experimentos de Cantaro Labs" className="mb-8">
        <ul className="flex flex-wrap gap-1.5">
          {LABS.map((lab) => {
            const active = lab.id === currentId;
            return (
              <li key={lab.id}>
                <Link
                  href={lab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded border px-3 py-1.5 font-mono text-[11px] transition-colors",
                    active
                      ? "border-term/50 bg-term/15 text-term"
                      : "border-crema/15 bg-ink/40 text-crema/60 hover:border-crema/30 hover:text-crema/85",
                  )}
                >
                  {lab.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}
    </div>
  );
}
