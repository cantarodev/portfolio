import { useCallback, useEffect, useState } from "react";

import { QueueEngine, type QueueConfig, type QueueSnapshot } from "@/lib/sim/queue-engine";

/**
 * Binds a QueueEngine instance to React. The engine is mutated imperatively
 * inside a requestAnimationFrame loop; React only receives throttled snapshots
 * (~8/s) so the UI stays smooth without re-rendering every frame.
 */
export function useSimulation(initialConfig?: Partial<QueueConfig>) {
  const [engine] = useState(() => new QueueEngine({ config: initialConfig }));
  const [snapshot, setSnapshot] = useState<QueueSnapshot>(() => engine.snapshot());
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    let frame = 0;
    let last = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      engine.tick(dt);
      accumulator += dt;
      if (accumulator >= 0.12) {
        accumulator = 0;
        setSnapshot(engine.snapshot());
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, engine]);

  const refresh = useCallback(() => setSnapshot(engine.snapshot()), [engine]);

  const start = useCallback(() => setRunning(true), []);

  const pause = useCallback(() => {
    setRunning(false);
    refresh();
  }, [refresh]);

  const toggle = useCallback(() => {
    setRunning((value) => !value);
    refresh();
  }, [refresh]);

  const reset = useCallback(
    (config?: Partial<QueueConfig>) => {
      setRunning(false);
      engine.reset(config);
      refresh();
    },
    [engine, refresh],
  );

  /** Run an imperative engine action, then publish a fresh snapshot. */
  const run = useCallback(
    (action: (queueEngine: QueueEngine) => void) => {
      action(engine);
      refresh();
    },
    [engine, refresh],
  );

  const configure = useCallback(
    (partial: Partial<QueueConfig>) => {
      engine.updateConfig(partial);
      refresh();
    },
    [engine, refresh],
  );

  return {
    engine,
    snapshot,
    running,
    start,
    pause,
    toggle,
    reset,
    run,
    configure,
    refresh,
  };
}
