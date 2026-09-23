/**
 * Static, GPU-light backdrop: warm gradients, a subtle grid and ambient
 * glows — no canvas, no animation loop, nothing to block scrolling.
 */
export function SiteBackdrop() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="lite-hills absolute inset-0 opacity-95" />
      <div className="grid-floor absolute inset-0 opacity-25" />
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-term/[0.06] to-transparent" />
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-copper/[0.07] blur-3xl" />
      <div className="absolute top-1/3 -right-24 size-96 rounded-full bg-term/[0.05] blur-3xl" />
    </div>
  );
}
