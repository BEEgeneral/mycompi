#!/usr/bin/env node
/**
 * post-build-admin.js
 * After admin build, rewrites public/admin/index.html with actual hashed bundles.
 */
const fs = require('fs')
const path = require('path')

const ADMIN_DIR = path.join(__dirname, '..', 'public', 'admin')
const ASSETS_DIR = path.join(ADMIN_DIR, 'assets')

function latestFile(ext) {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => {
    const base = 'index-'
    return f.startsWith(base) && f.endsWith(ext) && !f.includes('-CSS')
  })
  if (!files.length) return null
  return files
    .map(f => ({ f, mtime: fs.statSync(path.join(ASSETS_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime)[0].f
}

const latestJs = latestFile('.js')
const latestCss = latestFile('.css')

console.log(`Admin bundles: JS=${latestJs} CSS=${latestCss}`)

if (!latestJs || !latestCss) {
  console.error('No bundles found')
  process.exit(1)
}

let html = fs.readFileSync(path.join(ADMIN_DIR, 'index.html'), 'utf8')
html = html.replace(/src="\/admin\/assets\/index-[^"]+\.js"/, `src="/admin/assets/${latestJs}"`)
html = html.replace(/href="\/admin\/assets\/index-[^"]+\.css"/, `href="/admin/assets/${latestCss}"`)
fs.writeFileSync(path.join(ADMIN_DIR, 'index.html'), html)
console.log('public/admin/index.html updated')
