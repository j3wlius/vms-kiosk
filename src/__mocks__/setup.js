// Global setup for Jest tests
// Mock Canvas module globally
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
      })),
      putImageData: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      setLineDash: jest.fn(),
      getLineDash: jest.fn(() => []),
      setLineDashOffset: jest.fn(),
      lineDashOffset: 0,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      strokeStyle: '#000000',
      fillStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'inherit',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
    })),
    width: 0,
    height: 0,
    toDataURL: jest.fn(() => 'data:image/png;base64,'),
    toBuffer: jest.fn(() => Buffer.from('')),
    toBlob: jest.fn(() => new Blob()),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  loadImage: jest.fn(() =>
    Promise.resolve({
      width: 0,
      height: 0,
      src: 'mock-image',
    })
  ),
  registerFont: jest.fn(),
  Image: jest.fn(() => ({
    width: 0,
    height: 0,
    src: '',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  Canvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
      })),
      putImageData: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      setLineDash: jest.fn(),
      getLineDash: jest.fn(() => []),
      setLineDashOffset: jest.fn(),
      lineDashOffset: 0,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      strokeStyle: '#000000',
      fillStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'inherit',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
    })),
    width: 0,
    height: 0,
    toDataURL: jest.fn(() => 'data:image/png;base64,'),
    toBuffer: jest.fn(() => Buffer.from('')),
    toBlob: jest.fn(() => new Blob()),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}));

// Mock other problematic modules
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(() =>
    Promise.resolve({
      data: {
        text: 'Mock OCR text',
        confidence: 0.9,
        words: [],
      },
    })
  ),
  createWorker: jest.fn(() =>
    Promise.resolve({
      recognize: jest.fn(() =>
        Promise.resolve({
          data: {
            text: 'Mock OCR text',
            confidence: 0.9,
            words: [],
          },
        })
      ),
      terminate: jest.fn(() => Promise.resolve()),
    })
  ),
}));

// Mock QRCode module
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() =>
    Promise.resolve('data:image/png;base64,mock-qr-code')
  ),
  toString: jest.fn(() => Promise.resolve('mock-qr-string')),
}));

// Mock Jimp module
jest.mock('jimp', () => ({
  read: jest.fn(() =>
    Promise.resolve({
      resize: jest.fn().mockReturnThis(),
      quality: jest.fn().mockReturnThis(),
      greyscale: jest.fn().mockReturnThis(),
      normalize: jest.fn().mockReturnThis(),
      getBase64: jest.fn(() =>
        Promise.resolve('data:image/png;base64,mock-image')
      ),
      getBuffer: jest.fn(() => Promise.resolve(Buffer.from('mock-image-data'))),
    })
  ),
}));
