# SPEC.md — MyCompi Design & Performance Spec

## Design Tokens

### Colores de marca (actualizado 2026-03-26)
```css
--color-brand-dark: #2D3261       /* Azul principal — logo, Navbar, títulos, CTAs */
--color-brand-pastel: #D1E0F3     /* Azul pastel — fondos de sección hero, cards, bordes */
--color-brand-yellow: #FFD154     /* Amarillo vibrante — acentos, highlights, iconos en cuadrados */
--color-brand-cream: #FCF9F1      /* Crema — fondo general de la página */
--color-brand-secondary: #555555  /* Texto secundario */
--color-brand-muted: #888888      /* Texto terciario / trust signals */
```

### Tipografía (actualizado 2026-03-26)
```css
font-family: 'Poppins', system-ui, sans-serif;
/* Headlines: ExtraBold/Bold, body: Regular/Medium */
```

### UI Elements
- Border-radius pills: `9999px`
- Border-radius cards: `2rem-3rem`
- Icon squares: amarillo (#FFD154), rounded-2xl, dentro de elementos de accent
- Sombras: suaves, sin negrura

## SEO Meta Tags

```html
<title>MyCompi — Asistentes virtuales IA para empresas | Automatiza tu negocio por 49€/mes</title>
<meta name="description" content="Contrata un equipo de asistentes virtuales IA para tu negocio: atención al cliente, ventas, marketing y desarrollo. Todo por 49€/mes. Sin contratos, sin permanencia." />
<meta name="keywords" content="asistente virtual IA, automatización empresarial, chatbot empresa, atención al cliente automatizada, ventas IA, marketing automatizado, equipo virtual" />
<!-- Open Graph + Twitter Card configurados -->
```

## Performance

- Lazy loading con `loading="lazy" decoding="async"`
- Font preconnect para Google Fonts
- Build: Vite + Rolldown (landing ~350KB JS gzipado)

## Accesibilidad

- Tab order lógico en formularios
- `aria-label` en botones con solo icono
- Focus states con outline 2px

## Componentes

### Buttons
- Primario: `bg-brand-dark text-white rounded-pill`
- Secundario: `border border-gray-300 text-gray-600 rounded-pill hover:bg-brand-pastel`
- CTA: `bg-brand-yellow text-brand-dark rounded-pill`

### Cards
- `bg-white rounded-[2rem] border-2 border-brand-pastel`
- Hover: `hover:shadow-md hover:border-brand-yellow transition-all`

### FAQ Cards
- Grid 2 columnas desktop / 1 móvil
- Siempre visibles (no acordeón)
- Filtro por categoría: General / Pagos / Técnico

### Comparativa Section
- Fondo oscuro `bg-brand-dark`
- Lado izquierdo: coste empleados (~10.300€/mes)
- Lado derecho: MyCompi (49€/mes)
- Bottom line: ~10.250€/mes de diferencia

## Landing Sections (orden)

1. Hero — headline + subheadline + CTA + screenshot dashboard
2. Stats — números clave
3. Services — qué hacen los Compis
4. Pricing — plan único 49€/mes
5. TeamPresentation — 6 Compis con foto pravatar.cc
6. Comparativa — 7 Compis vs empleados tradicionales
7. Testimonials
8. FAQ — grid + filtro por categoría
9. Contact
10. Footer

## Imaxes

- Dashboard screenshot: `/assets/dashboard.jpg`
- Logo: `/assets/logo.png`
- Fotos equipo: `https://i.pravatar.cc/160?img=X` (fotos realistas)
- Avatares proof social: `https://i.pravatar.cc/64?img=X`
