import { useEffect, useState } from "react";
import Link from "@/components/ui/link";
import { usePathname } from "@/components/ui/use-pathname";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  FlaskConical,
  FolderGit2,
  Layers,
  LayoutGrid,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

import { SystemFlowCard } from "@/components/SystemFlowCard";
import { CloudStatus } from "@/components/hud/CloudStatus";
import { ScrollProgressBar } from "@/components/hud/ScrollProgressBar";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { CTA, NAV_LINKS, PERSONAL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  hero: LayoutGrid,
  projects: FolderGit2,
  labs: FlaskConical,
  architecture: Layers,
  contact: Mail,
} as const;

function useActiveSection() {
  const [active, setActive] = useState<string>(NAV_LINKS[0].id);

  useEffect(() => {
    const sections = NAV_LINKS.filter((link) => link.href.startsWith("#"))
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function isLinkActive(
  link: (typeof NAV_LINKS)[number],
  pathname: string,
  active: string,
) {
  return link.href.startsWith("/")
    ? pathname.startsWith(link.href)
    : active === link.id;
}

function hrefFor(link: (typeof NAV_LINKS)[number], pathname: string) {
  if (!link.href.startsWith("/") && pathname !== "/") return `/${link.href}`;
  return link.href;
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="cantaro.dev — inicio"
      className="font-mono text-sm tracking-tight whitespace-nowrap"
    >
      <span className="text-term">&gt;_</span>{" "}
      <span className="text-crema">cantaro</span>
      <span className="text-crema/60">.dev</span>
    </Link>
  );
}

function ThemeButton({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      aria-pressed={!isDark}
      className={cn(
        "grid place-items-center rounded-md border border-crema/15 text-crema/70 transition-all duration-200 hover:border-term/40 hover:text-term",
        className,
      )}
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

function NavItems({
  active,
  pathname,
  orientation,
  onNavigate,
}: {
  active: string;
  pathname: string;
  orientation: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  return (
    <ul
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-0.5"
          : "flex flex-col gap-1",
      )}
    >
      {NAV_LINKS.map((link) => {
        const Icon = NAV_ICONS[link.id as keyof typeof NAV_ICONS] ?? LayoutGrid;
        const isActive = isLinkActive(link, pathname, active);
        return (
          <li key={link.id} className={orientation === "horizontal" ? "shrink-0" : ""}>
            <Link
              href={hrefFor(link, pathname)}
              onClick={onNavigate}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md border font-mono whitespace-nowrap transition-all duration-200",
                orientation === "horizontal"
                  ? "px-2.5 py-1.5 text-[11px]"
                  : "min-h-11 px-3 py-2.5 text-sm",
                isActive
                  ? "border-term/30 bg-term/10 text-term"
                  : "border-transparent text-crema/70 hover:text-crema",
              )}
            >
              <Icon
                className={orientation === "horizontal" ? "size-3.5" : "size-4"}
                aria-hidden
              />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Header() {
  const active = useActiveSection();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-term/15 bg-ink/95 backdrop-blur-md">
        <ScrollProgressBar />

        {/* ---------- Mobile (< lg) ---------- */}
        <div className="mx-auto flex h-[52px] max-w-[1440px] items-center gap-2 px-3 lg:hidden">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <ThemeButton className="size-11" />
            <Link
              href="/cantaro-labs"
              className="inline-flex h-11 items-center gap-1.5 rounded-md border border-term/30 px-3 font-mono text-xs text-term transition-all duration-200 hover:bg-term/10"
            >
              <FlaskConical className="size-4" aria-hidden /> Labs
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((value) => !value)}
              className="grid size-11 place-items-center rounded-md border border-crema/15 text-crema transition-all duration-200 hover:border-term/40 hover:text-term"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ---------- Desktop row 1 ---------- */}
        <div className="mx-auto hidden max-w-[1440px] items-center gap-3 px-4 py-2 lg:flex">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-term-red/90" />
            <span className="size-2.5 rounded-full bg-term-amber/90" />
            <span className="size-2.5 rounded-full bg-term/90" />
          </div>

          <Brand />

          <span className="h-4 w-px bg-crema/15" aria-hidden />

          <p className="truncate font-mono text-xs text-crema/70">
            {PERSONAL.role}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <ThemeButton className="size-9" />
            <Link
              href="/cantaro-labs"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-term/30 px-3 font-mono text-[11px] text-term transition-all duration-200 hover:bg-term/10"
            >
              <FlaskConical className="size-3.5" aria-hidden /> {CTA.exploreLabs}
              <ArrowRight className="size-3" aria-hidden />
            </Link>
            <Button asChild size="sm" className="h-9 gap-1.5 px-3">
              <a href={PERSONAL.resume} download>
                <Download className="size-3.5" aria-hidden /> CV
              </a>
            </Button>
          </div>
        </div>

        {/* ---------- Desktop row 2 ---------- */}
        <div className="mx-auto hidden max-w-[1440px] items-center gap-3 border-t border-term/10 px-3 py-1.5 lg:flex">
          <nav aria-label="Secciones">
            <NavItems active={active} pathname={pathname} orientation="horizontal" />
          </nav>
          <div className="ml-auto min-w-0">
            <CloudStatus />
          </div>
        </div>
      </header>

      {/* ---------- Mobile drawer (fuera del blur del header) ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[52px] z-40 bg-ink/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="panel"
            id="mobile-nav"
            aria-label="Secciones"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 top-[58px] z-[60] max-h-[calc(100svh-70px)] overflow-y-auto rounded-xl border border-term/15 bg-ink/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <NavItems
              active={active}
              pathname={pathname}
              orientation="vertical"
              onNavigate={() => setOpen(false)}
            />

            <div className="my-3 h-px w-full bg-term/15" aria-hidden />

            <SystemFlowCard />

            <div className="mt-3 flex flex-col gap-1.5">
              <a
                href={PERSONAL.resume}
                download
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-term/45 bg-term/10 px-4 font-mono text-sm font-medium text-term transition-all duration-200 hover:border-term/70 hover:bg-term/20"
              >
                <Download className="size-4" aria-hidden /> {CTA.cv}
              </a>
              <div className="flex items-center gap-2">
                <a
                  href={PERSONAL.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-crema/15 font-mono text-xs text-crema/75 transition-all duration-200 hover:border-term/40 hover:text-term"
                >
                  <GithubIcon /> GitHub
                </a>
                <a
                  href={PERSONAL.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-crema/15 font-mono text-xs text-crema/75 transition-all duration-200 hover:border-term/40 hover:text-term"
                >
                  <LinkedinIcon /> LinkedIn
                </a>
                <a
                  href={`mailto:${PERSONAL.email}`}
                  aria-label="Enviar email"
                  className="grid size-11 place-items-center rounded-md border border-crema/15 text-crema/75 transition-all duration-200 hover:border-term/40 hover:text-term"
                >
                  <Mail className="size-4" aria-hidden />
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
