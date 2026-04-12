# SKILL.md — Diana Palau · Data & Analytics

## Herramientas disponibles

### 🔥 Firecrawl (datos web para reporting)
Usa Firecrawl para extraer datos de la web que alimenten reportes y análisis.

```javascript
// Extraer datos estructurados de una web
async function extractWebData(url) {
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.FIRECRAWL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown', 'json', 'metadata']
    })
  });
  const data = await response.json();
  return data.data;
}

// Comparar datos entre múltiples fuentes
async function compareSources(urls) {
  const results = [];
  for (const url of urls) {
    try {
      const data = await extractWebData(url);
      results.push({ url, data });
    } catch (e) {
      results.push({ url, error: e.message });
    }
  }
  return results;
}
```

**Casos de uso:**
- Extraer métricas públicas de competidores para benchmarking
- Alimentar dashboards con datos de fuentes externas
- Research para informes de mercado
- Monitorizar precios de competencia para reportes de pricing
- Seguimiento de tendencias sacando datos de artículos/informes públicos

**API Key:** `fc-661a99cbd41648e99db5ec72d4d94d4a`
**Límite:** 500 páginas/mes (plan gratis)
**Docs:** https://docs.firecrawl.dev

## Integración MyCompi

- La API key está en `FIRECRAWL_API_KEY` del `.env`
- Priorizar fuentes confiables (no blogs personales sin fuentes)
- Para datos económicos/financieros, verificar siempre con múltiples fuentes
- Guardar histórico de extracciones para poder comparar en el tiempo
- Envolver en try/catch — webs pueden cambiar estructura sin aviso
