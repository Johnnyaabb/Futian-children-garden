/**
 * 生成 TabBar 占位图标（Node.js 脚本）
 * 运行: node generate-icons.js
 *
 * 需要: npm install canvas
 * 若无 canvas 环境，可手动下载图标替换 assets/icons/ 目录下文件
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const icons = [
  { name: 'home',     emoji: '🏠', color: '#999' },
  { name: 'home-active', emoji: '🏠', color: '#FF6B35' },
  { name: 'cart',     emoji: '🛒', color: '#999' },
  { name: 'cart-active', emoji: '🛒', color: '#FF6B35' },
  { name: 'order',    emoji: '📋', color: '#999' },
  { name: 'order-active', emoji: '📋', color: '#FF6B35' },
  { name: 'merchant', emoji: '🏪', color: '#999' },
  { name: 'merchant-active', emoji: '🏪', color: '#FF6B35' },
]

icons.forEach(({ name, emoji, color }) => {
  const canvas = createCanvas(81, 81)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.font = '48px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 40, 42)

  const out = fs.createWriteStream(path.join(__dirname, 'assets/icons', `${name}.png`))
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  console.log(`✓ Generated ${name}.png`)
})
