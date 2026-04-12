# SKILL.md — Carlos Mendoza · Ventas

## Herramientas disponibles

### 🔥 Firecrawl (scraping web para leads)
Usa Firecrawl para enriquecer datos de prospects y empresas.

```javascript
// Enrichment de empresa
async function enrichCompany(url) {
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
    content: data.data.markdown
  };
}

// Buscar empresa por nombre
async function findCompany(companyName) {
  const response = await fetch('https://api.firecrawl.dev/v0/search', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.FIRECRAWL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: companyName + ' empresa España',
      limit: 5
    })
  });
  const results = await response.json();
  return results.data;
}
```

**Casos de uso:**
- Enriquecer leads con datos de su web corporativa
- Verificar que una empresa existe y está activa
- Extraer información de contacto de webs de empresas
- Analizar el mercado de un prospect antes de llamar
- Encontrar decisores en empresas (buscando páginas de equipo)

**API Key:** `fc-661a99cbd41648e99db5ec72d4d94d4a`
**Límite:** 500 páginas/mes (plan gratis)
**Docs:** https://docs.firecrawl.dev

## Integración MyCompi

- La API key está en `FIRECRAWL_API_KEY` del `.env`
- Antes de enriquecer, verificar que la web es real (no redes sociales)
- Envolver en try/catch — algunas webs bloquean scraping
- Rate limit: no hacer más de 1 request/segundo
- Guardar datos enriquecidos en memoria para no repetir llamadas
