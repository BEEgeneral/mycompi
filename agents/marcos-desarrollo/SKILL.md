# SKILL.md — Marcos Fernández · Desarrollo Web

## Herramientas disponibles

### 🔥 Firecrawl (scraping para research web)
Usa Firecrawl para investigar webs de referencia y analizar competencia técnica.

```javascript
// Analizar una web de referencia
async function analyzeReferenceSite(url) {
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.FIRECRAWL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown', 'metadata']
    })
  });
  const data = await response.json();
  return {
    title: data.data.metadata.title,
    description: data.data.metadata.description,
    language: data.data.metadata.language,
    content: data.data.markdown,
    screenshot: data.data.screenshot
  };
}

// Descubrir todas las URLs de una web (sitemap-like)
async function crawlSite(rootUrl) {
  const response = await fetch('https://api.firecrawl.dev/v0/map', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.FIRECRAWL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: rootUrl
    })
  });
  const data = await response.json();
  return data.data;
}
```

**Casos de uso:**
- Analizar webs de competencia para extraer inspiración de diseño/UX
- Inspeccionar estructura de tiendas online competidoras
- Revisar qué plugins/tecnologías usa una web (por el contenido)
- Extraer copy y contenido de webs de referencia
- Investigar el stack técnico de competidores por sus páginas de trabajo o blog
- Mapear todas las páginas de un competidor para entender su estructura

**API Key:** `fc-661a99cbd41648e99db5ec72d4d94d4a`
**Límite:** 500 páginas/mes (plan gratis)
**Docs:** https://docs.firecrawl.dev

## Integración MyCompi

- La API key está en `FIRECRAWL_API_KEY` del `.env`
- Usar `/v0/map` para descubrir estructura completa de un sitio sin scrapear página por página
- Usar `/v0/scrape` cuando se necesite el contenido de una página específica
- El campo `screenshot` es útil para mostrar al cliente qué hace la competencia
- Rate limit: no hacer más de 1 request/segundo
- Guardar análisis en memoria para no repetir scraping de la misma web
