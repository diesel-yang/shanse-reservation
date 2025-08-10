import sharp from 'sharp'

const src = 'public/shanse-logo-original.PNG' // 你的原始圖片路徑

// 192x192
sharp(src).resize(192, 192).toFile('public/icons/icon-192.png')

// 512x512
sharp(src).resize(512, 512).toFile('public/icons/icon-512.png')

// maskable 512x512（加邊距確保安全區域）
sharp(src)
  .resize(512, 512, { fit: 'contain', background: { r: 237, g: 138, b: 63, alpha: 1 } })
  .toFile('public/icons/maskable-512.png')
