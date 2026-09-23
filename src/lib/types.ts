export interface ProjectDetail {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  repo?: string;
  link?: string;
  featured?: boolean;
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
