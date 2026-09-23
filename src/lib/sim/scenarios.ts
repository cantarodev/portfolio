import type { QueueConfig } from "@/lib/sim/queue-engine";
import { BASE_CONFIG } from "@/lib/sim/presets";

export interface ChallengeOption {
  id: string;
  label: string;
  effect: Partial<QueueConfig>;
  explanation: string;
}

export interface SimScenario {
  id: string;
  title: string;
  brief: string;
  config: QueueConfig;
  question: string;
  options: ChallengeOption[];
}

/**
 * Escenarios "¿Puedes arreglar el sistema?". Son ejercicios de simulación, no
 * evaluaciones: el objetivo es mostrar cómo cada palanca cambia el backlog y la
 * recuperación.
 */
export const SCENARIOS: SimScenario[] = [
  {
    id: "backlog",
    title: "El backlog está creciendo",
    brief:
      "El tráfico subió a ALTO pero el pool de workers se quedó pequeño. La cola se está quedando atrás y la DLQ se está llenando.",
    config: {
      ...BASE_CONFIG,
      arrivalRate: 18,
      workers: 2,
      processingMs: 600,
      failureRate: 0.3,
      autoScale: false,
    },
    question: "¿Qué cambiarías primero?",
    options: [
      {
        id: "more-workers",
        label: "Añadir workers",
        effect: { workers: 6 },
        explanation:
          "Esto reduce el backlog porque aumentó la capacidad de proceso. Con 6 workers, el throughput puede igualar una tasa de llegada ALTA.",
      },
      {
        id: "retries",
        label: "Activar reintentos",
        effect: { maxRetries: 5 },
        explanation:
          "Más reintentos ayudan con fallos transitorios, pero si el cuello de botella es la capacidad, la cola igual va a crecer. Los reintentos por sí solos no añaden throughput.",
      },
      {
        id: "auto-scale",
        label: "Activar auto-scaling",
        effect: { autoScale: true },
        explanation:
          "El auto-scaling reacciona al backlog añadiendo workers. Ajusta la capacidad a la carga, que es justo lo que necesitaba este escenario.",
      },
      {
        id: "nothing",
        label: "No hacer nada",
        effect: {},
        explanation:
          "El backlog sigue creciendo mientras la llegada supera la capacidad, y los mensajes empiezan a caer en la DLQ.",
      },
    ],
  },
  {
    id: "slow-db",
    title: "La base de datos se puso lenta",
    brief:
      "Una lentitud en la base de datos triplicó el tiempo de proceso. Los workers están ocupados pero el throughput se derrumbó.",
    config: {
      ...BASE_CONFIG,
      arrivalRate: 8,
      workers: 4,
      processingMs: 600,
      processingFactor: 3,
      failureRate: 0.1,
      autoScale: false,
    },
    question: "¿Cómo proteges el pipeline?",
    options: [
      {
        id: "more-workers",
        label: "Añadir workers",
        effect: { workers: 8 },
        explanation:
          "Añadir workers puede compensar un proceso más lento, pero solo si la base de datos aguanta más carga concurrente. Si no, solo mueves el cuello de botella.",
      },
      {
        id: "reduce-load",
        label: "Reducir la presión de llegada",
        effect: { arrivalRate: 4 },
        explanation:
          "Bajar la carga entrante deja que el sistema se ponga al día. Esto es back-pressure: frenar al productor en vez de saturar al consumidor.",
      },
      {
        id: "reset-db",
        label: "Restaurar la velocidad de la BD",
        effect: { processingFactor: 1 },
        explanation:
          "Arreglar la causa raíz restaura el throughput. Es el arreglo más directo cuando la lentitud es temporal.",
      },
    ],
  },
];

export function scenarioById(id: string) {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
