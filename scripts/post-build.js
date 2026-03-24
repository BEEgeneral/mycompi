#!/usr/bin/env node
/**
 * post-build.js
 * After landing build, rewrites public/index.html with actual hashed bundles.
 */
const fs = require('fs')
const path = require('path')

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets')

function latestFile(ext) {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => f.startsWith('index-') && f.endsWith(ext))
  if (!files.length) return null
  return files
    .map(f => ({ f, mtime: fs.statSync(path.join(ASSETS_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime)[0].f
}

const latestJs = latestFile('.js')
const latestCss = latestFile('.css')

if (!latestJs || !latestCss) {
  console.error(`No bundles found: JS=${latestJs} CSS=${latestCss}`)
  process.exit(1)
}

console.log(`Bundles: ${latestJs} | ${latestCss}`)

let html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8')
html = html.replace(/src="\/assets\/index-[^"]+\.js"/, `src="/assets/${latestJs}"`)
html = html.replace(/href="\/assets\/index-[^"]+\.css"/, `href="/assets/${latestCss}"`)
fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), html)
console.log('public/index.html updated')
