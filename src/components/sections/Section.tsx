import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title?: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Cascarón semántico de sección, mobile-first. El encabezado y el contenido
 * aparecen con una animación sutil al entrar en viewport.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  containerClassName,
}: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn("relative scroll-mt-32 py-12 sm:py-16", className)}
    >
      <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", containerClassName)}>
        {(eyebrow || title || intro) && (
          <Reveal className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="font-mono text-[11px] tracking-[0.3em] text-term/70 uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                id={headingId}
                className="mt-3 font-sans text-3xl font-semibold tracking-tight text-balance text-crema sm:text-4xl"
              >
                {title}
              </h2>
            )}
            {intro && (
              <div className="mt-4 text-sm leading-relaxed text-crema/60 sm:text-base">
                {intro}
              </div>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
