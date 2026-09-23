/**
 * In-memory queue simulation engine.
 *
 * This is a real discrete-time simulation: arrivals accumulate, workers have
 * finite capacity, failures consume retry attempts and permanently poisoned
 * messages move to a dead-letter queue. No random decoration — every metric is
 * derived from the state transitions below.
 *
 * It is dependency-free (no React, no DOM) so it can be unit tested and reused
 * behind a future QueueAdapter (SQS / RabbitMQ / etc.).
 */

export type WorkerStatus = "idle" | "busy" | "down";

export interface QueueMessage {
  id: number;
  attempts: number;
  enqueuedAt: number;
}

/** Public worker shape (serializable). */
export interface SimWorker {
  id: number;
  status: WorkerStatus;
  current: number | null;
  busyUntil: number;
}

interface InternalWorker extends Omit<SimWorker, "current"> {
  message: QueueMessage | null;
}

export type SimEventKind =
  | "enqueue"
  | "success"
  | "failure"
  | "retry"
  | "dlq"
  | "worker_down"
  | "worker_up"
  | "scale"
  | "info";

export interface SimEvent {
  id: number;
  time: number;
  kind: SimEventKind;
  message: string;
}

export interface QueueConfig {
  /** Incoming messages per simulated second. */
  arrivalRate: number;
  /** Target worker pool size (fixed unless autoScale is on). */
  workers: number;
  /** Base processing time per message, in milliseconds. */
  processingMs: number;
  /**
   * Probability (0..1) of a TRANSIENT failure (timeout, rate limit, network).
   * These are retried.
   */
  failureRate: number;
  /**
   * Probability (0..1) of a PERMANENT failure (invalid / malformed data).
   * These are NOT retried — retrying bad data only burns capacity, so the
   * message goes straight to the dead-letter queue.
   */
  dataErrorRate: number;
  /** Attempts before a transient failure is sent to the DLQ. */
  maxRetries: number;
  /** Grow/shrink the worker pool based on backlog. */
  autoScale: boolean;
  /** Multiplier applied to processing time (slow database = 3). */
  processingFactor: number;
  /** When true every processing attempt fails. */
  databaseDown: boolean;
  /** When true no new messages arrive. */
  apiDown: boolean;
}

export interface QueueSnapshot {
  time: number;
  paused: boolean;
  queueDepth: number;
  processing: number;
  completed: number;
  failed: number;
  /** Permanent (invalid data) failures — not retried. */
  dataErrors: number;
  retries: number;
  deadLetters: number;
  enqueued: number;
  throughput: number;
  workers: SimWorker[];
  dlq: QueueMessage[];
  events: SimEvent[];
}

export interface QueueEngineOptions {
  rng?: () => number;
  /** Max workers auto-scale may reach. */
  maxWorkers?: number;
  /** Rolling window (seconds) used for throughput. */
  throughputWindow?: number;
  config?: Partial<QueueConfig>;
}

const TRANSIENT_REASONS = ["timeout", "rate limit", "network"] as const;

export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  arrivalRate: 4,
  workers: 3,
  processingMs: 600,
  failureRate: 0,
  dataErrorRate: 0,
  maxRetries: 3,
  autoScale: false,
  processingFactor: 1,
  databaseDown: false,
  apiDown: false,
};

export class QueueEngine {
  config: QueueConfig;

  private readonly rng: () => number;
  private readonly maxWorkers: number;
  private readonly throughputWindow: number;

  private queue: QueueMessage[] = [];
  private workers: InternalWorker[] = [];
  private dlq: QueueMessage[] = [];
  private events: SimEvent[] = [];

  private time = 0;
  private nextMessageId = 1000;
  private nextWorkerId = 1;
  private nextEventId = 1;
  private arrivalAccumulator = 0;
  private scaleCooldown = 0;
  private paused = false;

  private completedCount = 0;
  private failedCount = 0;
  private dataErrorCount = 0;
  private retryCount = 0;
  private enqueuedCount = 0;
  private completionTimes: number[] = [];

  constructor(options: QueueEngineOptions = {}) {
    this.rng = options.rng ?? Math.random;
    this.maxWorkers = options.maxWorkers ?? 12;
    this.throughputWindow = options.throughputWindow ?? 4;
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...options.config };
    this.scaleWorkers(this.config.workers);
  }

  // -- controls ----------------------------------------------------------

  reset(config: Partial<QueueConfig> = {}) {
    this.config = { ...this.config, ...config };
    this.queue = [];
    this.dlq = [];
    this.events = [];
    this.workers = [];
    this.time = 0;
    this.nextMessageId = 1000;
    this.nextWorkerId = 1;
    this.nextEventId = 1;
    this.arrivalAccumulator = 0;
    this.scaleCooldown = 0;
    this.paused = false;
    this.completedCount = 0;
    this.failedCount = 0;
    this.dataErrorCount = 0;
    this.retryCount = 0;
    this.enqueuedCount = 0;
    this.completionTimes = [];
    this.scaleWorkers(this.config.workers);
  }

  updateConfig(partial: Partial<QueueConfig>) {
    const previous = this.config.workers;
    this.config = { ...this.config, ...partial };
    if (partial.workers !== undefined && partial.workers !== previous) {
      this.scaleWorkers(partial.workers);
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.pushEvent("info", paused ? "Workers en pausa" : "Workers reanudados");
  }

  createOrder(count = 1) {
    for (let index = 0; index < count; index += 1) this.enqueue();
  }

  /** Prefill the queue to reproduce a backlog scenario. */
  prefill(depth: number) {
    for (let index = 0; index < depth; index += 1) this.enqueue();
  }

  /** Take a worker offline; any message it was holding returns to the queue. */
  killWorker(): SimWorker | null {
    const candidates = this.workers.filter((worker) => worker.status !== "down");
    if (!candidates.length) return null;

    const target = candidates[candidates.length - 1];
    const held = target.message;
    target.status = "down";
    target.message = null;
    target.busyUntil = 0;

    if (held) {
      held.attempts += 1;
      if (held.attempts >= this.config.maxRetries) {
        this.failedCount += 1;
        this.dlq.push(held);
        this.pushEvent(
          "dlq",
          `Worker ${target.id} murió a mitad del trabajo → mensaje #${held.id} superó los reintentos → DLQ`,
        );
      } else {
        this.retryCount += 1;
        this.queue.push(held);
        this.pushEvent(
          "retry",
          `Worker ${target.id} murió a mitad del trabajo → mensaje #${held.id} vuelve a la cola`,
        );
      }
    }

    this.pushEvent("worker_down", `Worker ${target.id} está CAÍDO`);
    return this.toPublicWorker(target);
  }

  restartWorker(): SimWorker | null {
    const downed = this.workers.find((worker) => worker.status === "down");
    if (!downed) return null;
    downed.status = "idle";
    this.pushEvent("worker_up", `Worker ${downed.id} vuelve a estar en línea`);
    return this.toPublicWorker(downed);
  }

  /** Requeue every dead-letter message with a fresh attempt budget. */
  retryFailed() {
    if (!this.dlq.length) return;
    const revived = this.dlq.splice(0, this.dlq.length);
    for (const message of revived) {
      message.attempts = 0;
      this.queue.push(message);
    }
    this.pushEvent("info", `${revived.length} mensaje(s) de dead-letter reencolados`);
  }

  clearQueue() {
    const dropped = this.queue.length;
    this.queue = [];
    this.pushEvent("info", `Cola vaciada (${dropped} mensaje(s) descartados)`);
  }

  // -- simulation --------------------------------------------------------

  tick(deltaSeconds: number) {
    const dt = Math.min(Math.max(deltaSeconds, 0), 0.25);
    this.time += dt;
    this.scaleCooldown = Math.max(0, this.scaleCooldown - dt);

    this.receiveArrivals(dt);
    this.resolveBusyWorkers();

    if (!this.paused) {
      this.assignWork();
      if (this.config.autoScale) this.autoScale();
    }

    this.completionTimes = this.completionTimes.filter(
      (time) => this.time - time <= this.throughputWindow,
    );
  }

  snapshot(): QueueSnapshot {
    return {
      time: this.time,
      paused: this.paused,
      queueDepth: this.queue.length,
      processing: this.workers.filter((w) => w.status === "busy").length,
      completed: this.completedCount,
      failed: this.failedCount,
      dataErrors: this.dataErrorCount,
      retries: this.retryCount,
      deadLetters: this.dlq.length,
      enqueued: this.enqueuedCount,
      throughput: this.throughput(),
      workers: this.workers.map((worker) => this.toPublicWorker(worker)),
      dlq: this.dlq.slice(-6).map((message) => ({ ...message })),
      events: this.events.slice(0, 8),
    };
  }

  throughput(): number {
    return this.completionTimes.length / this.throughputWindow;
  }

  private receiveArrivals(dt: number) {
    if (this.config.apiDown) return;
    this.arrivalAccumulator += this.config.arrivalRate * dt;
    while (this.arrivalAccumulator >= 1) {
      this.arrivalAccumulator -= 1;
      this.enqueue();
    }
  }

  private enqueue() {
    this.nextMessageId += 1;
    this.queue.push({
      id: this.nextMessageId,
      attempts: 0,
      enqueuedAt: this.time,
    });
    this.enqueuedCount += 1;
  }

  private assignWork() {
    for (const worker of this.workers) {
      if (worker.status !== "idle") continue;
      const message = this.queue.shift();
      if (!message) break;

      worker.status = "busy";
      worker.message = message;
      worker.busyUntil = this.time + this.processingDuration();
    }
  }

  private resolveBusyWorkers() {
    for (const worker of this.workers) {
      if (worker.status !== "busy" || worker.busyUntil > this.time) continue;

      const message = worker.message;
      worker.status = "idle";
      worker.message = null;

      if (!message) continue;

      const roll = this.rng();

      if (this.config.databaseDown) {
        this.handleTransient(message, "database unavailable");
      } else if (roll < this.config.dataErrorRate) {
        // Permanent failure: retrying bad data only wastes capacity.
        this.handlePermanent(message);
      } else if (roll < this.config.dataErrorRate + this.config.failureRate) {
        const reason =
          TRANSIENT_REASONS[
            Math.floor(this.rng() * TRANSIENT_REASONS.length)
          ] ?? "timeout";
        this.handleTransient(message, reason);
      } else {
        this.completedCount += 1;
        this.completionTimes.push(this.time);
      }
    }
  }

  /** Timeout / rate limit / network — retried up to maxRetries. */
  private handleTransient(message: QueueMessage, reason: string) {
    message.attempts += 1;

    if (message.attempts >= this.config.maxRetries) {
      this.failedCount += 1;
      this.dlq.push(message);
      this.pushEvent(
        "dlq",
        `Mensaje #${message.id} agotó ${this.config.maxRetries} intentos (${reason}) → DLQ`,
      );
      return;
    }

    this.retryCount += 1;
    this.queue.push(message);
    this.pushEvent(
      "retry",
      `Mensaje #${message.id} falló (${reason}, intento ${message.attempts}/${this.config.maxRetries}) → reintento`,
    );
  }

  /** Invalid / malformed data — goes straight to the DLQ, no retries. */
  private handlePermanent(message: QueueMessage) {
    this.failedCount += 1;
    this.dataErrorCount += 1;
    this.dlq.push(message);
    this.pushEvent(
      "dlq",
      `Mensaje #${message.id} rechazado (datos inválidos) → DLQ, sin reintento`,
    );
  }

  private autoScale() {
    if (this.scaleCooldown > 0) return;

    const backlog = this.queue.length;
    const active = this.workers.filter((w) => w.status !== "down").length;

    if (backlog > active * 2 && active < this.maxWorkers) {
      const worker = this.addWorker();
      this.scaleCooldown = 0.6;
      this.pushEvent("scale", `Backlog ${backlog} → escalando (worker ${worker.id})`);
      return;
    }

    if (backlog === 0 && this.workers.length > 1) {
      const idleIndex = this.workers.findIndex((w) => w.status === "idle");
      if (idleIndex !== -1) {
        const [removed] = this.workers.splice(idleIndex, 1);
        this.scaleCooldown = 0.8;
        this.pushEvent("scale", `Cola vacía → reduciendo (worker ${removed.id})`);
      }
    }
  }

  private processingDuration() {
    return (this.config.processingMs / 1000) * this.config.processingFactor;
  }

  private addWorker(): InternalWorker {
    const worker: InternalWorker = {
      id: this.nextWorkerId,
      status: "idle",
      busyUntil: 0,
      message: null,
    };
    this.nextWorkerId += 1;
    this.workers.push(worker);
    return worker;
  }

  /** Grow/shrink the pool, preferring to remove idle workers first. */
  private scaleWorkers(target: number) {
    const clamped = Math.max(1, Math.min(target, this.maxWorkers));

    while (this.workers.length < clamped) this.addWorker();

    while (this.workers.length > clamped) {
      const idleIndex = this.workers.findIndex((w) => w.status === "idle");
      const index = idleIndex === -1 ? this.workers.length - 1 : idleIndex;
      const [removed] = this.workers.splice(index, 1);
      if (removed?.message) {
        this.queue.push(removed.message);
      }
    }
  }

  private toPublicWorker(worker: InternalWorker): SimWorker {
    return {
      id: worker.id,
      status: worker.status,
      current: worker.message?.id ?? null,
      busyUntil: worker.busyUntil,
    };
  }

  private pushEvent(kind: SimEventKind, message: string) {
    this.events.unshift({
      id: this.nextEventId,
      time: this.time,
      kind,
      message,
    });
    this.nextEventId += 1;
    if (this.events.length > 40) this.events.pop();
  }
}
