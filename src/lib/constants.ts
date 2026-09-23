import type {
  ArchitectureStage,
  CaseStudyBlock,
  CloudService,
  Principle,
  ProjectDetail,
  SkillGroup,
} from "@/lib/types";

export const SITE = {
  name: "cantaro.dev",
  title: "Jhon Cantaro — Ingeniero Backend | AWS | DevOps",
  description:
    "Ingeniero Backend / Integración especializado en TypeScript, Node.js, Python, PostgreSQL, AWS, sistemas event-driven y DevOps.",
  url: "https://cantaro.dev",
} as const;

export const PERSONAL = {
  name: "Jhon Cantaro",
  firstName: "Jhon",
  alias: "cantarodev",
  role: "Ingeniero Backend / Integración",
  focus: "Backend · Integración · Cloud · DevOps",
  location: "Perú",
  email: "info@cantaro.dev",
  github: "https://github.com/cantarodev",
  linkedin: "https://www.linkedin.com/in/cantarodev",
  resume: "/CV-JHON-CANTARO.pdf",
} as const;

export const HERO = {
  headline: "Ingeniero Backend / Integración",
  badge: "⚡ DISTRIBUTED SYSTEMS & CLOUD ARCHITECTURE",
  supporting:
    "Diseño y construyo arquitecturas event-driven altamente escalables, APIs robustas e infraestructura cloud resiliente para sistemas críticos.",
  stack: [
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Terraform",
  ],
} as const;

export const CTA = {
  projects: "Ver proyectos",
  explore: "Explora mi trabajo",
  cv: "Descargar CV",
  exploreLabs: "Explorar Labs",
} as const;

/** Pipeline mostrado en la tarjeta "Flujo del sistema" del Hero. */
export const SYSTEM_FLOW = [
  "Petición",
  "API Gateway",
  "Cola SQS",
  "Worker",
  "Base de Datos",
] as const;

export const NAV_LINKS = [
  { id: "hero", label: "Inicio", href: "#hero" },
  { id: "projects", label: "Proyectos", href: "#projects" },
  { id: "labs", label: "Labs", href: "/cantaro-labs" },
  { id: "architecture", label: "Arquitectura", href: "#architecture" },
  { id: "contact", label: "Contacto", href: "#contact" },
] as const;

export const LABS = [
  {
    id: "queue",
    name: "Laboratorio de Colas",
    icon: "workflow",
    question:
      "¿Qué pasa cuando tu aplicación recibe más trabajo del que puede procesar?",
    difficulty: "Inicial",
    duration: "2–4 min",
    concepts: ["Colas", "Back-pressure", "Reintentos", "Dead-letter"],
    href: "/cantaro-labs/queue",
  },
  {
    id: "traffic",
    name: "Laboratorio de Tráfico",
    icon: "zap",
    question: "¿Qué pasa cuando el tráfico sube 10× de golpe?",
    difficulty: "Inicial",
    duration: "2–3 min",
    concepts: ["Escalado horizontal", "Throughput", "Carga"],
    href: "/cantaro-labs/traffic",
  },
  {
    id: "failure",
    name: "Laboratorio de Fallos",
    icon: "alert",
    question: "¿Qué tan resiliente es tu sistema?",
    difficulty: "Intermedio",
    duration: "3–5 min",
    concepts: ["Detección", "Recuperación", "Failover"],
    href: "/cantaro-labs/failure",
  },
] as const;

export type LabId = (typeof LABS)[number]["id"];

export const LAB_NOTES = [
  {
    id: "dlq",
    title: "Por qué añadí una dead-letter queue",
    body: "Procesar mensajes fallidos para siempre no es resiliencia, es un bucle de reintentos. Cuando un mensaje agota sus intentos se mueve a una dead-letter queue para que el tráfico sano siga fluyendo y el mensaje envenenado se pueda inspeccionar después.",
    tag: "Confiabilidad",
  },
  {
    id: "simulation",
    title: "Los labs corren una simulación real",
    body: "El motor de colas avanza un reloj discreto: las llegadas se acumulan, los workers tienen capacidad finita y los fallos consumen intentos. Cada métrica sale de esas transiciones, no de una animación aleatoria.",
    tag: "Arquitectura",
  },
  {
    id: "decoupling",
    title: "Desacoplar es una decisión de capacidad",
    body: "Una cola no es solo un buffer. Permite que el productor acepte trabajo más rápido de lo que el consumidor lo procesa, y eso es lo que hace sobrevivible un pico de tráfico sin sobredimensionar cada componente.",
    tag: "Event-driven",
  },
] as const;

export const FEATURED_PROJECT = {
  id: "linkedin-market-intelligence",
  name: "LinkedIn Market Intelligence",
  subtitle:
    "Extensión de Chrome + Backend event-driven + Infraestructura en AWS",
  summary:
    "Una extensión de Chrome más una API de ingesta que recoge datos del mercado laboral y los procesa de forma asíncrona a través de AWS SQS, convirtiendo ofertas crudas en inteligencia de mercado consultable.",
  problem:
    "Los datos del mercado laboral están dispersos, limitados por rate limit y son ruidosos. Recogerlos de forma síncrona desde el navegador significaría peticiones lentas, manejo de errores frágil y ninguna forma de reintentar fallos individuales sin perder todo el lote.",
  approach: [
    "Capturar ofertas desde el cliente con una extensión de Chrome y enviarlas a una API REST delgada.",
    "Desacoplar la ingesta del procesamiento con una cola durable para que productores y consumidores escalen por separado.",
    "Procesar los trabajos en workers que pueden fallar, reintentar y ser reemplazados sin afectar la cola.",
    "Persistir registros normalizados en PostgreSQL y exponerlos para analítica.",
  ],
  stack: [
    "Chrome Extension",
    "TypeScript",
    "Node.js",
    "REST API",
    "AWS SQS",
    "PostgreSQL",
    "Docker",
    "Terraform",
  ],
  indicators: [
    "Procesamiento asíncrono",
    "Workers con reintentos",
    "Aislamiento de fallos",
    "Pipeline observable",
    "Infraestructura como código",
  ],
} as const;

export const ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    id: "extension",
    label: "Extensión de Chrome",
    detail: "Recoge ofertas desde el navegador y envía payloads estructurados.",
    tags: ["Cliente"],
    group: "source",
  },
  {
    id: "api",
    label: "API REST",
    detail: "Valida y autentica los payloads antes de encolarlos.",
    tags: ["Desacople"],
    group: "source",
  },
  {
    id: "ingestion",
    label: "Capa de ingesta",
    detail: "Normaliza los datos y publica un mensaje por trabajo.",
    tags: ["Async"],
    group: "processing",
  },
  {
    id: "sqs",
    label: "AWS SQS",
    detail: "Buffer durable que absorbe picos y aísla fallos.",
    tags: ["Aislamiento", "Reintentos"],
    group: "processing",
  },
  {
    id: "workers",
    label: "Workers",
    detail:
      "Consumen trabajos en paralelo, reintentan errores transitorios y enrutan mensajes envenenados a una dead-letter queue.",
    tags: ["Idempotencia", "Back-pressure"],
    group: "processing",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    detail:
      "Guarda registros normalizados con restricciones que mantienen los datos consistentes.",
    tags: ["Persistencia"],
    group: "storage",
  },
  {
    id: "analytics",
    label: "Analítica",
    detail: "Consulta los datos persistidos para sacar señales de mercado.",
    tags: ["Observabilidad"],
    group: "storage",
  },
];

export const CASE_STUDY: {
  problem: string;
  challenges: CaseStudyBlock;
  reliability: CaseStudyBlock;
  observability: CaseStudyBlock;
  infrastructure: CaseStudyBlock;
} = {
  problem: FEATURED_PROJECT.problem,
  challenges: {
    title: "Retos de ingeniería",
    items: [
      "Procesamiento asíncrono para que el trabajo lento nunca bloquee la petición",
      "Estrategia de reintentos con backoff para fallos transitorios",
      "Back-pressure: la cola absorbe picos en lugar de tumbar a los workers",
      "Manejo de dead-letter para trabajos que no se pueden procesar",
      "Idempotencia para que un reintento no duplique registros",
      "Recuperación: un worker caído se reemplaza sin perder su trabajo",
      "Observabilidad para entender por qué falló un trabajo",
    ],
  },
  reliability: {
    title: "Confiabilidad",
    items: [
      "Los mensajes permanecen en SQS hasta que se confirman",
      "Los trabajos fallidos se reintentan y se aíslan en lugar de bloquear el pipeline",
      "Los trabajos inválidos se apartan en vez de descartarse en silencio",
      "La caída de un worker no detiene al resto",
    ],
  },
  observability: {
    title: "Observabilidad",
    items: [
      "Logs estructurados en cada etapa del procesamiento",
      "Seguimiento de errores en el límite del worker",
      "Visibilidad de la cola: trabajo pendiente y fallido",
    ],
  },
  infrastructure: {
    title: "Infraestructura",
    items: [
      "AWS: SQS, PostgreSQL, EC2, ALB, WAF, Auto Scaling",
      "Docker para imágenes de worker reproducibles",
      "Terraform para infraestructura versionada y revisable",
      "AWS Systems Manager para el acceso a instancias",
    ],
  },
};

export const PRINCIPLES: Principle[] = [
  {
    title: "Confiabilidad",
    body: "Los sistemas deben recuperarse de los fallos. Un paso fallido no debería tumbar el pipeline.",
  },
  {
    title: "Observabilidad",
    body: "Si algo falla, deberíamos poder saber por qué: logs, métricas y estado de la cola.",
  },
  {
    title: "Desacople",
    body: "Los componentes no deberían fallar juntos sin necesidad. Colas y contratos claros mantienen los límites.",
  },
  {
    title: "Automatización",
    body: "La infraestructura y los despliegues deben ser reproducibles, no memorizados.",
  },
  {
    title: "Simplicidad",
    body: "La complejidad debe tener una razón. El diseño más simple que cumple el requisito gana.",
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Backend",
    summary: "Servicios y APIs que siguen correctos bajo carga.",
    items: ["TypeScript", "Node.js", "Python", "FastAPI", "APIs REST"],
  },
  {
    title: "Arquitectura",
    summary: "Diseñar para el fallo antes de que ocurra.",
    items: [
      "Arquitectura event-driven",
      "Colas",
      "Workers",
      "Reintentos / backoff",
      "Idempotencia",
      "Sistemas distribuidos",
    ],
  },
  {
    title: "Datos",
    summary: "Modelar y consultar datos relacionales.",
    items: ["PostgreSQL", "Modelado relacional", "Optimización de consultas"],
  },
  {
    title: "Cloud y DevOps",
    summary: "Infraestructura reproducible en AWS.",
    items: [
      "AWS",
      "Terraform",
      "Docker",
      "AWS SSM",
      "ALB",
      "WAF",
      "Auto Scaling",
    ],
  },
  {
    title: "Frontend",
    summary: "Lo suficiente para llevar el producto de punta a punta.",
    items: ["React", "Next.js"],
  },
];

/** Feed de observabilidad simulado para la telemetría del HUD. */
export const CLOUD_SERVICES: CloudService[] = [
  {
    id: "sqs",
    name: "SQS",
    status: "SALUDABLE",
    state: "healthy",
    detail: "cola event-driven",
  },
  {
    id: "rds",
    name: "RDS",
    status: "EN LÍNEA",
    state: "healthy",
    detail: "PostgreSQL Multi-AZ",
  },
  {
    id: "waf",
    name: "WAF",
    status: "ACTIVO",
    state: "active",
    detail: "reglas + rate limiting",
  },
  {
    id: "ssm",
    name: "SSM",
    status: "SEGURO",
    state: "active",
    detail: "Session Manager (sin SSH)",
  },
];

export const PROJECTS: ProjectDetail[] = [
  {
    id: "linkedin-market-intelligence",
    name: "LinkedIn Market Intelligence",
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
  },
];
