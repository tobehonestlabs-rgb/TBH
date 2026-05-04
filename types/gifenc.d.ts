declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: { palette?: Uint8Array[]; delay?: number; dispose?: number; transparent?: number }
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
    reset(): void
  }

  export function quantize(
    rgba: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    opts?: Record<string, unknown>
  ): Uint8Array[]

  export function applyPalette(
    rgba: Uint8ClampedArray | Uint8Array,
    palette: Uint8Array[],
    format?: string
  ): Uint8Array
}
