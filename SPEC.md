# SPEC.md — MyCompi Design & Performance Spec

## Design Tokens

### Colores de marca
```css
--color-brand-bg: #FAFAFA          /* Fondo principal */
--color-brand-bg-section: #F5F5F5   /* Fondo secciones alternas */
--color-brand-text: #111111         /* Texto principal */
--color-brand-secondary: #555555    /* Texto secundario */
--color-brand-border: #E5E5E5       /* Bordes */
--color-brand-yellow: #FFD200       /* Acento amarelo */
--color-brand-yellow-dark: #E6BC00  /* Acento hover */
--color-primary: #4F46E5            /* Primario (indigo-600) */
--color-primary-hover: #4338CA     /* Primario hover */
```

### Tipografía
```css
font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
font-display: swap; /* para Google Fonts */
```

### Contraste
- Texto principal (#111111) sobre fondo (#FAFAFA): ratio 19.5:1 ✓
- Texto secundario (#555555) sobre fondo (#FAFAFA): ratio 7:1 ✓
- Texto claro sobre primario (#4F46E5): ratio 4.8:1 ✓ (AA)
- Acento amarelo (#FFD200) sobre texto (#111111): ratio 14:1 ✓

## Focus States (Accesibilidad)

```css
/* Todos os elementos interactivos */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
  border-radius: 4px;
}
```

## Performance

### Lazy loading de imaxes
```jsx
<img loading="lazy" decoding="async" />
```

### Font display
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Google Fonts con display=swap -->
```

### Imaxes
- Todas as imaxes usan `loading="lazy"`
- Favicon inline como SVG data URI para evitar petición adicional
- Imaxes de equipo: 80x80px max

## Accesibilidad

### Navegación por teclado
- Tab order lógico en todos os formularios
- Skip links para salto ao contenido principal
- Alt text en todas as imaxes

### ARIA
- `aria-label` en botóns que só teñen icono
- `role="button"` en elementos con onClick que non son button
- `aria-live="polite"` en zonas de contenido dinámico

## Componentes

### Button variants
- `bg-indigo-600 text-white` — primario
- `border border-gray-300 text-gray-700` — secundario
- `bg-gray-900 text-white` — escuro

### Card
- `bg-white rounded-2xl border border-gray-200 shadow-sm`
- Hover: `hover:shadow-lg transition-shadow`

### Input
- `border border-gray-300 rounded-xl px-4 py-3 text-sm`
- Focus: `focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`
