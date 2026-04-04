
Design a dark-theme locomotive telemetry dashboard for a real train driver's cab display (KZ8A electric locomotive, Kazakhstan). The UI must feel like real industrial software — calm, non-distracting, high information density without clutter.

--- VISUAL STYLE ---
Background: #0d0f12
Card surfaces: #141820, border 0.5px #2a3040
Inner metric cells: #1a1e26
Font: Inter or system-ui, weights 400 and 500 only
No gradients, no shadows, no glow
Border radius: 10px cards, 8px cells, 6px buttons
Normal: #22c55e | Warning: #f59e0b | Critical: #ef4444
Accent/interactive: #2a6db5
Text primary: #e2e8f0 | Muted: #9aa3b2 | Labels: #7a8499

--- TOP BAR ---
Left: green status dot + "KZ8A-0044" bold + "· Астана — Қарағанды" muted
Center: toggle [KZ8A] [ТЭ33А] — active tab blue bg #2a6db5
Right: "14:32:08 · обновл. 1с" muted

--- MAIN LAYOUT (4-column grid) ---

[NEW] COLUMN 1 — Health Index card (spans rows 1–2):
  • Circular ring gauge 0–100, colored arc (green/amber/red zones)
  • Large score "80" in center, green colored
  • Status pill "Норма" below ring
  • Section label "Топ факторы влияния"
  • 5 factor rows: [label] [thin bar] [delta score]
    - Температура ТЭД     ████░░  −8  green
    - Напряжение КС       ███░░░  −5  green
    - Ток ТЭД             ██░░░░  −4  amber
    - Давление тормозов   █░░░░░  −3  green
    - Темп. трансформатора ░░░░░░ −2  green

[NEW] COLUMN 2 — Speedometer card (top):
  • Arc gauge, style matching real KZ8A cab display
  • Green zone 0–85 km/h, amber 85–100, red 100–120
  • Current speed "74" large in center, unit "км/ч" small
  • Below arc: two metric cells side by side
    - Сила тяги: 612 кН
    - Рекуперация: 4200 кВт (green, active) [FIXED — was just on/off]
  • Sparkline trend last 5 min below metrics

COLUMN 3 — Electrics card (top):
  • 2 metric cells: Напряжение КС 25.1 кВ | Ток ТЭД avg 487 А (amber)
  • Sparkline: amber line
  • Below: Температура трансформатора 74°C (separate metric cell) [FIXED — was missing]
  • Температура инверторов 68°C [FIXED — was missing]

[NEW] COLUMN 4 — Route map card (spans rows 1–2):
  • Simplified vertical or horizontal route line
  • Stations as dots: Астана ● ─── ◉ ─── ● Қарағанды
  • Current position: filled blue dot ◉ at ~40% of route
  • Speed limit zones: colored segments on the line
    - green = normal speed
    - amber = restriction zone
    - red = stop/danger zone
  • Below map: "км 187 из 460" progress text
  • Card label: "Маршрут"

COLUMNS 2–3 (bottom span) — Motor Temps card:
  • Label "Температуры и токи ТЭД (°C / А)" [FIXED — added current per motor]
  • 8 cells in flex-wrap row, each cell shows:
    - Motor label "ТЭД 1"
    - Temp value large "92°C" (colored by status)
    - Current value small below "480 А" (muted)
  • ТЭД 3: temp 108°C amber, current 530 А amber
  • All others: green normal values

--- AI EXPLANATION PANEL --- [NEW — full width below main grid]

Card background: #0d1117, border: #1a3a5c (blue tint, not red — this is AI, not just alert)
Layout: 3 columns inside the card

LEFT (icon + status):
  • Large "AI" text badge, purple: bg #1e1635, border #4c3d8f, text #a78bfa
  • Below: animated "думает..." dots OR static text when response ready
  • Small label "Claude Diagnostics"

CENTER (main AI text — widest column):
  • Title in amber: "Повышенная температура ТЭД №3"
  • Body text 13px, line-height 1.6, color #e2e8f0:
    "Температура третьего тягового двигателя достигла 108°C и продолжает расти.
     Вероятная причина — затяжной подъём на текущем участке маршрута при
     высокой нагрузке тяги. Рекомендую снизить тягу на 10–15% и дать режим
     выбега на 2–3 минуты для охлаждения."
  • Text must look like a message from an expert colleague, not a system log

RIGHT (action buttons):
  • Button 1: "Снизить тягу" — blue outlined, 12px
  • Button 2: "Подробнее" — ghost, 12px
  • Separator line
  • Small muted text: "Обновлено 14:32:06 · индекс: 80→74"

--- ALERT CARD (separate, below AI panel) ---

(Keep the traditional alert card too — AI panel explains WHY, alert card shows WHAT)
Background: #160f0a, border: #7c2d12
Left: orange warning icon in #7c2d12 square (32×32)
Title: "ALERT · ТЭД №3 · 108°C > порог 100°C" in #fb923c, monospace font
Right side: timestamp + "Активен 4 мин" counter

--- BOTTOM ROW ---

Card 1: Тормозная система
  • Давление тормоз. магистрали: 6.2 бар ● green
  • Давление питательной: 8.1 бар ● green
  • Рекуперативное торможение: Активно ● green

Card 2: Прочие параметры
  • Темп. внешнего воздуха: +22°C ● green
  • Автоведение: Вкл. ● green
  • Масса состава: 6200 т

--- REPLAY BAR (full width, bottom) ---
"Просмотр истории" label | Blue fill track 65% | "−9 мин" | "Экспорт CSV" button

--- ТЭ33А MODE (when toggle = ТЭ33А) ---
Replace electrics column with:
  • Уровень топлива: 68% (gauge bar, alert <15%)
  • Уровень воды охлаждения: 82% (alert <20%)
  • Уровень масла: 74% (alert <10%)
  • Обороты дизеля: 980 об/мин (arc gauge 335–1050)
  • Мощность дизеля: 2800 кВт bar
  • Температура воды: 82°C | Температура масла: 71°C
  • Давление масла: 4.2 бар ● green
Replace ТЭД grid with 6 cells (not 8)
Remove КС voltage section entirely
Route map stays identical

--- COMPONENT STRUCTURE ---
Make all repeating elements as components:
  • MetricCell (value, unit, label, status: ok/warn/crit)
  • MotorCell (label, temp, current, status)
  • FactorRow (name, barWidth, delta, status)
  • ParamRow (name, value, unit, status dot)
  • AIPanel (loading: bool, title, bodyText, updatedAt)
  • RouteMap (stationList, currentKm, totalKm)
Use auto-layout everywhere. All spacing in multiples of 4px.