import { test } from "node:test";
import assert from "node:assert/strict";

import { QueueEngine, type QueueConfig } from "../src/lib/sim/queue-engine.ts";

function makeEngine(overrides: Partial<QueueConfig> = {}) {
  // Deterministic RNG: always returns 0.5 so `rng() < failureRate` is
  // predictable (fails only when failureRate > 0.5, never at 0/0.25).
  return new QueueEngine({ rng: () => 0.5, config: overrides });
}

function run(engine: QueueEngine, seconds: number, step = 0.1) {
  for (let elapsed = 0; elapsed < seconds; elapsed += step) engine.tick(step);
}

test("drains a fixed workload when capacity is sufficient", () => {
  const engine = makeEngine({ arrivalRate: 0, workers: 2, processingMs: 100 });
  engine.createOrder(10);
  run(engine, 3);

  const snapshot = engine.snapshot();
  assert.equal(snapshot.completed, 10);
  assert.equal(snapshot.queueDepth, 0);
  assert.equal(snapshot.failed, 0);
});

test("queue grows when arrival rate exceeds processing capacity", () => {
  const engine = makeEngine({ arrivalRate: 20, workers: 1, processingMs: 1000 });
  run(engine, 5);
  const snapshot = engine.snapshot();
  assert.ok(snapshot.queueDepth > 0, "expected a growing backlog");
  assert.ok(snapshot.throughput < 20, "throughput cannot exceed capacity");
});

test("failures consume retries and eventually reach the DLQ", () => {
  const engine = makeEngine({
    arrivalRate: 0,
    workers: 1,
    processingMs: 100,
    failureRate: 1,
    maxRetries: 3,
  });
  engine.createOrder(5);
  run(engine, 5);

  const snapshot = engine.snapshot();
  assert.equal(snapshot.completed, 0);
  assert.equal(snapshot.deadLetters, 5);
  assert.equal(snapshot.failed, 5);
  assert.ok(snapshot.retries >= 5, "each message should have been retried");
});

test("invalid-data failures go straight to the DLQ without retries", () => {
  const engine = makeEngine({
    arrivalRate: 0,
    workers: 1,
    processingMs: 100,
    failureRate: 0,
    dataErrorRate: 1,
    maxRetries: 3,
  });
  engine.createOrder(4);
  run(engine, 3);

  const snapshot = engine.snapshot();
  assert.equal(snapshot.dataErrors, 4);
  assert.equal(snapshot.failed, 4);
  assert.equal(snapshot.deadLetters, 4);
  assert.equal(snapshot.retries, 0);
  assert.equal(snapshot.completed, 0);
});

test("killing a worker returns its in-flight message to the queue", () => {
  const engine = makeEngine({
    arrivalRate: 0,
    workers: 2,
    processingMs: 1000,
  });
  engine.createOrder(2);
  run(engine, 0.5);

  const before = engine.snapshot();
  assert.equal(before.processing, 2);

  engine.killWorker();
  const after = engine.snapshot();
  assert.equal(after.processing, 1);
  assert.equal(after.queueDepth, 1);
  assert.ok(after.workers.some((worker) => worker.status === "down"));
});

test("retryFailed requeues dead letters with a fresh attempt budget", () => {
  const engine = makeEngine({
    arrivalRate: 0,
    workers: 1,
    processingMs: 100,
    failureRate: 1,
    maxRetries: 2,
  });
  engine.createOrder(3);
  run(engine, 5);
  assert.equal(engine.snapshot().deadLetters, 3);

  engine.retryFailed();
  const snapshot = engine.snapshot();
  assert.equal(snapshot.deadLetters, 0);
  assert.equal(snapshot.queueDepth, 3);
});

test("never produces NaN or Infinity metrics", () => {
  const engine = makeEngine({ arrivalRate: 30, workers: 2, processingMs: 900 });
  run(engine, 6);
  const snapshot = engine.snapshot();
  const values = [
    snapshot.time,
    snapshot.queueDepth,
    snapshot.throughput,
    snapshot.completed,
    snapshot.failed,
    snapshot.dataErrors,
    snapshot.retries,
  ];
  for (const value of values) {
    assert.ok(Number.isFinite(value), `expected finite value, got ${value}`);
  }
});
