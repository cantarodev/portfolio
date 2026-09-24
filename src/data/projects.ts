import type { ProjectDetail } from "@/lib/types";

/**
 * Datos de proyectos del portafolio.
 * Fuente única de verdad para la sección de Proyectos y las páginas de caso
 * de estudio (`/projects/[slug]`).
 */
export const PROJECTS: ProjectDetail[] = [
  {
    id: "linkedin-market-intelligence",
    name: "LinkedIn Market Intelligence",
    category: "Backend & Event-Driven Architecture",
    tagline:
      "Extensión de Chrome + Backend event-driven + Infraestructura en AWS",
    description:
      "Extensión de Chrome más una API de ingesta que procesa datos del mercado laboral de forma asíncrona con AWS SQS y PostgreSQL.",
    stack: [
      "Chrome Extension",
      "TypeScript",
      "Node.js",
      "AWS SQS",
      "PostgreSQL",
      "Docker",
      "Terraform",
    ],
    repo: "https://github.com/cantarodev",
    featured: true,
    highlights: [
      "Ingesta desacoplada con AWS SQS y workers",
      "Reintentos con backoff y dead-letter queue",
      "Idempotencia y aislamiento de fallos",
      "Persistencia normalizada en PostgreSQL",
      "Infraestructura como código con Terraform",
    ],
    metrics: [
      { label: "Procesamiento", value: "Asíncrono" },
      { label: "Resiliencia", value: "Retry + DLQ" },
      { label: "Infra", value: "IaC" },
    ],
  },
  {
    id: "cantaro-dev",
    name: "cantaro.dev — High-Performance & Cloud Native Portfolio",
    category: "Cloud Engineering & Web Architecture",
    tagline:
      "Portafolio de alto rendimiento con arquitectura serverless en AWS, entrega de contenido global y seguridad Zero-Trust.",
    description:
      "Sitio estático generado con Astro y servido desde Amazon S3 (privado, vía OAC) tras CloudFront, con Cloudflare en el borde. Cero secretos en el cliente, caché inmutable y despliegue continuo con GitHub Actions.",
    stack: [
      "Astro",
      "Tailwind CSS",
      "AWS S3 & CloudFront",
      "Cloudflare",
      "GitHub Actions (CI/CD)",
      "TypeScript",
    ],
    demo: "https://cantaro.dev",
    openSource: true,
    highlights: [
      "S3 privado con OAC: tráfico exclusivo desde CloudFront",
      "DNS, protección DDoS y reglas de seguridad en el borde (Cloudflare)",
      "0 secretos o API keys en el cliente; runtime pesado 0 KiB",
      "SSG con Astro: sin overhead de framework en runtime",
      "@fontsource: tipografías autohospedadas (sin Google Fonts)",
      "Cache-Control inmutable (1 año) para /_astro/* y HTML revalidado",
      "CI/CD con GitHub Actions: sync a S3 con headers por tipo de archivo",
      "Invalidación de CloudFront tras cada push a la rama principal",
    ],
    metrics: [
      { label: "Lighthouse", value: "100/100" },
      { label: "JS innecesario", value: "0 KiB" },
      { label: "Edge caching", value: "CDN" },
    ],
  },
];
