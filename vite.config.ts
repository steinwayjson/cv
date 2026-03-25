import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * Вите-плагин: инлайнит критичный CSS в HTML и делает основной CSS неблокирующим.
 * Это убирает render-blocking stylesheet — главный убийца FCP/LCP.
 */
function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css-inline',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // Находим CSS-файл в бандле
        const cssAsset = Object.keys(ctx.bundle ?? {}).find(k => k.endsWith('.css'))
        if (!cssAsset || !ctx.bundle) return html

        const asset = ctx.bundle[cssAsset]
        if (asset.type !== 'asset' || typeof asset.source !== 'string') return html

        const fullCss = asset.source

        // Критический CSS: переменные, шрифты, bg/fg, header, fade-section, grid
        const criticalRules: string[] = []
        // Извлекаем :root, .dark, @font-face, body, html, header, .fade-section, .scroll-progress
        const ruleRegex = /(?:@font-face|:root|\.dark|@custom-variant)[^{}]*\{[^}]*\}/g
        let match
        while ((match = ruleRegex.exec(fullCss)) !== null) {
          criticalRules.push(match[0])
        }

        // Минимальный inline CSS для мгновенного рендера  
        const inlineCss = `
:root{--background:#ffffff;--foreground:oklch(0.145 0 0);--primary:#030213;--primary-foreground:oklch(1 0 0);--border:rgba(0,0,0,0.1);--muted-foreground:#717182;--accent:#e9ebef;--card:#ffffff}
.dark{--background:oklch(0.145 0 0);--foreground:oklch(0.985 0 0);--primary:oklch(0.985 0 0);--primary-foreground:oklch(0.205 0 0);--border:oklch(0.269 0 0);--muted-foreground:oklch(0.708 0 0);--accent:oklch(0.269 0 0);--card:oklch(0.145 0 0)}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('/fonts/inter-cyrillic-wght-normal.woff2') format('woff2-variations');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('/fonts/inter-latin-wght-normal.woff2') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
*,::before,::after{box-sizing:border-box}
html{font-family:'Inter Variable','Inter',system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.618;scroll-behavior:smooth}
body{background-color:var(--background);color:var(--foreground);margin:0;line-height:1.618}
.fade-section{opacity:0;transform:translateY(24px);content-visibility:auto}
.fade-section.is-visible{opacity:1;transform:none}
`.trim().replace(/\n/g, '')

        // Вставляем inline CSS перед </head>
        html = html.replace(
          '</head>',
          `<style>${inlineCss}</style>\n</head>`
        )

        // Делаем основной CSS неблокирующим
        const cssHref = `/assets/${cssAsset.split('/').pop()}`
        html = html.replace(
          `<link rel="stylesheet" crossorigin href="${cssHref}">`,
          `<link rel="stylesheet" href="${cssHref}" media="print" onload="this.media='all'">\n    <noscript><link rel="stylesheet" href="${cssHref}"></noscript>`
        )

        return html
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    criticalCssPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  ssr: {
    noExternal: true,
  },
})
