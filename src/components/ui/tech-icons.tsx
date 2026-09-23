import {
  Braces,
  Cloud,
  Container,
  Cpu,
  Database,
  Hexagon,
  Layers,
  ListOrdered,
  Send,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/** Íconos por tecnología (genéricos, sin marcas). */
export const TECH_ICONS: Record<string, LucideIcon> = {
  TypeScript: Braces,
  "Node.js": Hexagon,
  Python: Terminal,
  PostgreSQL: Database,
  AWS: Cloud,
  Docker: Container,
  Terraform: Layers,
};

/** Íconos de las etapas del flujo de sistema. */
export const FLOW_ICONS: Record<string, LucideIcon> = {
  Petición: Send,
  "API Gateway": Server,
  "Cola SQS": ListOrdered,
  Worker: Cpu,
  "Base de Datos": Database,
};
