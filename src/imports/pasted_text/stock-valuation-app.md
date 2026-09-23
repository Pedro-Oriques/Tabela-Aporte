Design a stock valuation web app using Neumorphism design style, inspired by modern fintech 
interfaces like Stripe. The UI should feel tactile, elevated, and refined — soft shadows create 
the illusion of elements extruding from or pressing into the surface.

---

VISUAL LANGUAGE — NEUMORPHISM:
- Base background: #E0E5EC (soft blue-gray)
- All cards and surfaces use the same base color as the background
- Light shadow: #FFFFFF (top-left), Dark shadow: #A3B1C6 (bottom-right)
- Raised elements: box-shadow: 6px 6px 12px #A3B1C6, -6px -6px 12px #FFFFFF
- Inset/pressed elements: box-shadow: inset 4px 4px 8px #A3B1C6, inset -4px -4px 8px #FFFFFF
- Border-radius: 16px for cards, 12px for inputs and buttons, 50% for icon buttons
- No hard borders — depth is created entirely through shadows
- Typography: Inter or SF Pro, dark gray (#2D3748) for primary text, medium gray (#718096) for labels
- Accent gradient: purple-to-blue (#7C3AED → #3B82F6), used for CTAs, active states, and chart lines
- Positive values: #10B981 (emerald green), Negative values: #EF4444 (red)
- Subtle background gradient on hero area: radial gradient from #C9D6FF to #E2E2E2

---

ANIMATIONS (describe as motion specs):
- Page load: cards fade in and slide up 12px with staggered delay (0.1s between each)
- Summary counters: animate from 0 to final value on load (count-up animation, 1.2s ease-out)
- Table rows: stagger fade-in from top to bottom, 40ms delay per row
- Chart lines on dashboard: draw-on animation left to right, 1s ease-in-out
- Hover on cards: subtle lift — shadow increases, element translates -2px Y, 200ms ease
- Hover on buttons: pressed neumorphic effect (switches from raised to inset shadow), 150ms
- Badge on classification: pulse glow animation on "APORTE FORTE" (green glow, 2s loop)
- Search dropdown: slides down with fade, 180ms ease-out
- Loading state: neumorphic skeleton shimmer (light sweep animation across surface)

---

PAGE 1 — DASHBOARD

Hero top bar (full width, neumorphic raised panel):
- Left: App title "E agora? Será que eu aporto?" in bold 24px dark gray, 
  subtitle "Modelo Graham & Bazin" in 13px medium gray
- Right: neumorphic inset search input with magnifier icon, 
  and a ghost text link "Gerenciar Ações" with arrow icon

Summary strip (4 neumorphic raised cards in a row, equal width):
- Each card shows a large animated count-up number (32px bold) and label below
- "Aporte Forte" → accent green number
- "Aporte" → blue number  
- "Aporte Pequeno" → amber number
- "Não Comprar" → red number
- Cards have a thin colored top border matching their respective color

Animated mini chart widget (neumorphic card, full width):
- Shows a smooth area chart of portfolio distribution or price trend
- Chart line uses purple-to-blue gradient stroke
- Animated draw-on effect on load
- Axis labels in small gray, no grid lines — clean fintech aesthetic
- Inspired by the Stripe dashboard chart in the reference image

Main data table (neumorphic raised container):
- Table header: slightly darker surface (#D1D9E6), uppercase labels 11px, medium gray
- Columns: ATIVO, ATUAL (R$), MÉD. 5A, LPA, VPA, REND. (%), TETO (R$), GRAHAM, 
  P. JUSTO (R$), RISCO (%), JUSTO AJ. (R$), M. SEG. (%), M. AJ. (%), 
  DIST. TETO, POTENCIAL, CLASSIFICAÇÃO
- Rows: alternating between base color and slightly lighter (#E8EDF5)
- Positive % values in #10B981, negative in #EF4444
- ATIVO column: bold, accent blue-purple gradient text
- Sortable headers: show ▲▼ with smooth rotation animation on click
- Row hover: neumorphic inset effect on the row, 200ms transition
- Remove button: small neumorphic circle button with × icon, red on hover

Classification badges (neumorphic pill style):
- "Aporte Forte": raised badge, green gradient fill, white text, subtle glow
- "Aporte": raised badge, blue-gray fill, white text
- "Aporte Pequeno": raised badge, amber fill, dark text
- "Não Comprar": raised badge, red fill, white text, subtle red glow

---

PAGE 2 — STOCKS (Gerenciar Ações)

Header (neumorphic raised panel):
- Title "Selecionar Ações" bold 24px, subtitle "X ativo(s) na sua watchlist"
- Right: neumorphic raised button "Ver Dashboard" with purple-blue gradient fill

Search input: full-width neumorphic inset field, search icon left, uppercase placeholder

Sector filters: horizontal scrollable row of neumorphic raised pill buttons; 
active state switches to inset + gradient fill

Stock cards grid (2 columns):
- Each card: neumorphic raised rectangle, 16px radius
- Left: ticker bold 16px in gradient text, company name 14px, sector 12px gray
- Right: neumorphic raised button "Adicionar" (gradient fill) or "Remover" (red fill)
- Selected card: inset shadow + thin left accent bar in gradient color
- Card hover: lift animation, shadow expands

---

LAYOUT:
- Max width 1800px, 32px side padding
- 12-column grid, 24px gutters
- All interactive elements have neumorphic raised/inset state transitions
- Consistent 16px border-radius throughout
- Inspired by the tactile, elevated fintech aesthetic of Stripe's dashboard UI