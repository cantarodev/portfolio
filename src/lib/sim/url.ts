import type { QueueConfig } from "@/lib/sim/queue-engine";
import {
  DATA_ERROR_PRESETS,
  FAILURE_PRESETS,
  PROCESSING_PRESETS,
  TRAFFIC_PRESETS,
  trafficValueFromRate,
  type DataErrorValue,
  type FailureValue,
  type ProcessingValue,
  type TrafficValue,
} from "@/lib/sim/presets";

export type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseIntParam(
  raw: string | string[] | undefined,
  min: number,
  max: number,
): number | undefined {
  const value = first(raw);
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Decode a shared simulation link into a validated partial config.
 * Every value is clamped — never trust the query string.
 */
export function decodeQueueParams(
  searchParams: SearchParamsRecord,
): Partial<QueueConfig> {
  const config: Partial<QueueConfig> = {};

  const workers = parseIntParam(searchParams.workers, 1, 10);
  if (workers !== undefined) config.workers = workers;

  const traffic = first(searchParams.traffic);
  if (traffic) {
    const preset = TRAFFIC_PRESETS.find((entry) => entry.value === traffic);
    if (preset) config.arrivalRate = preset.arrivalRate;
  }

  const processing = first(searchParams.processing);
  if (processing) {
    const preset = PROCESSING_PRESETS.find((entry) => entry.value === processing);
    if (preset) config.processingMs = preset.processingMs;
  }

  const failure = first(searchParams.failure);
  if (failure) {
    const preset = FAILURE_PRESETS.find((entry) => entry.value === failure);
    if (preset) config.failureRate = preset.failureRate;
  }

  const data = first(searchParams.data);
  if (data) {
    const preset = DATA_ERROR_PRESETS.find((entry) => entry.value === data);
    if (preset) config.dataErrorRate = preset.dataErrorRate;
  }

  if (first(searchParams.autoScale) === "1") config.autoScale = true;

  return config;
}

/** Decode a query string (client-side) into a validated partial config. */
export function decodeQueryString(search: string): Partial<QueueConfig> {
  const params: SearchParamsRecord = {};
  new URLSearchParams(search).forEach((value, key) => {
    params[key] = value;
  });
  return decodeQueueParams(params);
}

/** Encode the current config into a shareable query string. */
export function encodeQueueParams(config: QueueConfig): string {
  const params = new URLSearchParams();
  params.set("workers", String(config.workers));
  params.set("traffic", trafficValueFromRate(config.arrivalRate));
  const processing = PROCESSING_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.processingMs - config.processingMs) <
    Math.abs(closest.processingMs - config.processingMs)
      ? preset
      : closest,
  );
  params.set("processing", processing.value);
  const failure = FAILURE_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.failureRate - config.failureRate) <
    Math.abs(closest.failureRate - config.failureRate)
      ? preset
      : closest,
  );
  params.set("failure", failure.value);
  const data = DATA_ERROR_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.dataErrorRate - config.dataErrorRate) <
    Math.abs(closest.dataErrorRate - config.dataErrorRate)
      ? preset
      : closest,
  );
  params.set("data", data.value);
  if (config.autoScale) params.set("autoScale", "1");
  return params.toString();
}

export type { DataErrorValue, FailureValue, ProcessingValue, TrafficValue };
