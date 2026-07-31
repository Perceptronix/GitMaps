export type ImageDimensions = {
  width: number
  height: number
  pixelsPerInch?: number
}

const CRC_WIDTH = 4

/**
 * Utility class for parsing PNG file headers
 * Extracts metadata like IHDR (dimensions) and pHYs (DPI information)
 */
export class PNGScanner {
  dataview: DataView
  pos: number

  constructor(buffer: ArrayBuffer) {
    this.dataview = new DataView(buffer)
    this.pos = 0
  }

  advance(bytes: number) {
    this.pos += bytes
  }

  readInt(bytes: 1 | 2 | 4) {
    const value = (() => {
      switch (bytes) {
        case 1:
          return this.dataview.getUint8(this.pos)
        case 2:
          return this.dataview.getUint16(this.pos)
        case 4:
          return this.dataview.getUint32(this.pos)
        default:
          throw new Error('bytes parameter must be 1, 2 or 4')
      }
    })()
    this.advance(bytes)
    return value
  }

  readChar() {
    return this.readInt(1)
  }

  readShort() {
    return this.readInt(2)
  }

  readLong() {
    return this.readInt(4)
  }

  readString(length: number): string {
    const bytes = new Uint8Array(this.dataview.buffer, this.pos, length)
    this.advance(length)
    return new TextDecoder('ascii').decode(bytes)
  }

  scan(fn: (this: PNGScanner, type: string, len: number) => boolean) {
    // PNG signature is 8 bytes: 0x89504e470d0a1a0a
    const expectedSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    for (let i = 0; i < expectedSignature.length; i++) {
      if (this.dataview.getUint8(this.pos + i) !== expectedSignature[i]) {
        throw new Error('Invalid PNG file: header signature mismatch')
      }
    }
    this.advance(8)
    while (this.pos < this.dataview.byteLength) {
      const len = this.readLong()
      const type = this.readString(4)
      const resumeAt = this.pos + len + CRC_WIDTH
      if (fn.call(this, type, len) === false || type === 'IEND') {
        break
      }
      this.pos = resumeAt
    }
  }
}

const METERS_PER_INCH = 0.0254
export const RETINA_PPI = 72 * 2 // Standard retina display pixel density

/**
 * Parse PNG image data to extract dimensions and DPI information
 */
const getImageDimensions = (imgData: ArrayBuffer) => {
  const scanner = new PNGScanner(imgData)

  const meta: ImageDimensions = {
    width: 0,
    height: 0,
    pixelsPerInch: 72, // Default to standard screen PPI
  }

  scanner.scan(function (this: PNGScanner, type) {
    switch (type) {
      case 'IHDR': {
        meta.width = this.readLong()
        meta.height = this.readLong()
        return true
      }
      case 'pHYs': {
        const ppuX = this.readLong()
        const ppuY = this.readLong()
        const unit = this.readChar()
        let inchesRatio: number | undefined = undefined
        if (unit === 1) {
          inchesRatio = METERS_PER_INCH
          meta.pixelsPerInch = Math.round(((ppuX + ppuY) / 2) * inchesRatio)
        }
        // If unit is not 1, do not update meta.ppi
        return false
      }
      case 'IDAT': {
        return false
      }
    }

    return true
  })

  return meta
}

/**
 * Get image dimensions using the browser's built-in image decoding.
 * Works for any format the browser supports (JPEG, GIF, WebP, etc.).
 */
const getBrowserImageDimensions = (file: File): Promise<ImageDimensions | null> => {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight})
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/**
 * Extract image dimensions from a File object.
 * Tries PNG header parsing first (to get DPI info for retina), then falls back
 * to browser image decoding (works for JPEG, GIF, WebP, and any other format).
 */
export const getImageSizeFromFile = async (file: File) => {
  // Only attempt PNG header parsing for PNG files — avoids reading the entire
  // file into memory for non-PNG formats that will fall back to browser decoding anyway
  if (file.type === 'image/png') {
    const imgResult = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })

    if (imgResult) {
      try {
        const pngResult = getImageDimensions(imgResult)
        if (pngResult.width > 0 && pngResult.height > 0) return pngResult
      } catch {
        // Failed to parse PNG — fall through to browser decoding
      }
    }
  }

  // Browser decoding for JPEG, GIF, WebP, and any other format
  return getBrowserImageDimensions(file)
}
