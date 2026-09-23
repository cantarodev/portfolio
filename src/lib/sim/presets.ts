import type { QueueConfig } from "@/lib/sim/queue-engine";

export interface Preset<T extends string | number> {
  value: T;
  label: string;
}

export const TRAFFIC_PRESETS = [
  { value: "low", label: "Low", arrivalRate: 2 },
  { value: "medium", label: "Medium", arrivalRate: 6 },
  { value: "high", label: "High", arrivalRate: 18 },
  { value: "extreme", label: "Extreme", arrivalRate: 45 },
] as const;

export const WORKER_OPTIONS = [1, 2, 3, 5, 10] as const;

export const PROCESSING_PRESETS = [
  { value: "fast", label: "Fast", processingMs: 250 },
  { value: "normal", label: "Normal", processingMs: 600 },
  { value: "slow", label: "Slow", processingMs: 1400 },
] as const;

export const FAILURE_PRESETS = [
  { value: "0", label: "0%", failureRate: 0 },
  { value: "5", label: "5%", failureRate: 0.05 },
  { value: "10", label: "10%", failureRate: 0.1 },
  { value: "25", label: "25%", failureRate: 0.25 },
  { value: "50", label: "50%", failureRate: 0.5 },
] as const;

/** Permanent failures (invalid data). These do NOT retry. */
export const DATA_ERROR_PRESETS = [
  { value: "0", label: "0%", dataErrorRate: 0 },
  { value: "5", label: "5%", dataErrorRate: 0.05 },
  { value: "10", label: "10%", dataErrorRate: 0.1 },
  { value: "25", label: "25%", dataErrorRate: 0.25 },
] as const;

export type DataErrorValue = (typeof DATA_ERROR_PRESETS)[number]["value"];

export function dataErrorPreset(value: DataErrorValue) {
  return (
    DATA_ERROR_PRESETS.find((preset) => preset.value === value) ??
    DATA_ERROR_PRESETS[0]
  );
}

export type TrafficValue = (typeof TRAFFIC_PRESETS)[number]["value"];
export type ProcessingValue = (typeof PROCESSING_PRESETS)[number]["value"];
export type FailureValue = (typeof FAILURE_PRESETS)[number]["value"];

export function trafficPreset(value: TrafficValue) {
  return TRAFFIC_PRESETS.find((preset) => preset.value === value) ?? TRAFFIC_PRESETS[0];
}

export function processingPreset(value: ProcessingValue) {
  return (
    PROCESSING_PRESETS.find((preset) => preset.value === value) ??
    PROCESSING_PRESETS[1]
  );
}

export function failurePreset(value: FailureValue) {
  return FAILURE_PRESETS.find((preset) => preset.value === value) ?? FAILURE_PRESETS[0];
}

export function trafficValueFromRate(rate: number): TrafficValue {
  const closest = [...TRAFFIC_PRESETS].sort(
    (a, b) => Math.abs(a.arrivalRate - rate) - Math.abs(b.arrivalRate - rate),
  )[0];
  return closest.value;
}

export const MAX_RETRIES = 3;

/** Baseline configuration used by every lab unless a scenario overrides it. */
export const BASE_CONFIG: QueueConfig = {
  arrivalRate: 4,
  workers: 3,
  processingMs: 600,
  failureRate: 0,
  dataErrorRate: 0,
  maxRetries: MAX_RETRIES,
  autoScale: false,
  processingFactor: 1,
  databaseDown: false,
  apiDown: false,
};
