export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  /** Categoría / rol técnico del proyecto. */
  category?: string;
  tagline: string;
  description: string;
  stack: string[];
  repo?: string;
  link?: string;
  /** URL de demo en vivo. */
  demo?: string;
  featured?: boolean;
  /** Puntos clave / aspectos destacados. */
  highlights?: string[];
  /** Métricas destacadas (Lighthouse, etc.). */
  metrics?: ProjectMetric[];
  /** Insignia "Open Source / Reference Architecture". */
  openSource?: boolean;
}

export type CloudState = "healthy" | "idle" | "active" | "warning";

export interface CloudService {
  id: string;
  name: string;
  status: string;
  state: CloudState;
  detail: string;
}

export interface Principle {
  title: string;
  body: string;
}

export interface SkillGroup {
  title: string;
  summary: string;
  items: string[];
}

export interface ArchitectureStage {
  id: string;
  label: string;
  detail: string;
  tags: string[];
  group?: "source" | "processing" | "storage";
}

export interface CaseStudyBlock {
  title: string;
  items: string[];
}
