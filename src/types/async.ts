export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export interface NativeCapabilityStatus {
  available: boolean;
  eventCount?: number;
  message: string;
}
