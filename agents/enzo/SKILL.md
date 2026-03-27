# SKILL.md — Enzo Herrera · Marketing

## Herramientas disponibles

### 🔥 Firecrawl (scraping web)
Usa Firecrawl para extraer datos de webs de competencia, análisis de mercado y content research.

```javascript
// Scraping básico
async function scrapeUrl(url) {
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
  return data.data;
}

// Buscar y scrapear
async function searchAndScrape(query) {
  const search = await fetch('https://api.firecrawl.dev/v0/search', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.FIRECRAWL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, limit: 10 })
  });
  const results = await search.json();
  return results.data;
}
```

**Casos de uso:**
- Analizar webs de competidores (precios, productos, mensajes)
- Extraer contenido para content research
- Monitorizar qué publican competidores
- Investigar mercados antes de entrar

**API Key:** `fc-661a99cbd41648e99db5ec72d4d94d4a`
**Límite:** 500 páginas/mes (plan gratis)
**Docs:** https://docs.firecrawl.dev

## Integración MyCompi

- La API key está en `FIRECRAWL_API_KEY` del `.env`
- Envolver en try/catch — Firecrawl puede fallar en webs con anti-bot
- Preferir `markdown` para contenido, `json` para datos estructurados
- Rate limit: no hacer más de 1 request/segundo
