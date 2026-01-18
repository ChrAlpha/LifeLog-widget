# LifeLog Widget

A minimal, visually-focused time perception widget designed to help you stay aware of time passing. Built with ADHD-friendly design principles in mind.

## Features

### Time Awareness at Every Scale

- **Today** - Visualize hours passing in a 6×4 grid with minute-level progress indicators
- **Week** - See your current day within the week and week within the year
- **Month** - Track days in the current month with a calendar-style grid
- **Year** - Watch days accumulate across the entire year (365/366 dots)
- **Life** - A sobering life timeline showing years lived vs. remaining

### ADHD-Friendly Design

- **Visual over numerical** - Dot grids provide instant understanding without cognitive load
- **Glanceable** - Get time context in under a second
- **Low cognitive overhead** - No complex interfaces or settings to manage
- **Ambient awareness** - Designed to sit in your peripheral vision
- **Time blindness support** - Makes the abstract concept of time concrete and visible

### Minimalist Aesthetic

- Dark theme reduces eye strain
- High contrast dots (white = past, orange = now, gray = future)
- Pulsing animation on current time unit draws attention without distraction
- Clean typography with generous spacing

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Usage

### Navigation

Click on any tab (Today, Week, Month, Year, Life) to switch views.

### Life Page Setup

The Life page requires initial configuration:

1. Enter your birthday
2. Enter your life expectancy (in years)
3. Click Save

Your data is stored locally in your browser - nothing is sent to any server.
<!-- 
## Why This Exists

Many people, especially those with ADHD, struggle with **time blindness** - difficulty perceiving how time passes or estimating durations. This widget provides:

- **Concrete visualization** of abstract time concepts
- **Multiple timescales** to build temporal awareness
- **Passive reminder** that time is passing (without being annoying)
- **Perspective** on where you are in various time cycles

## Design Philosophy

1. **Show, don't tell** - Visual patterns over numbers
2. **Instant comprehension** - No learning curve required
3. **Respectful of attention** - Informative without being demanding
4. **Honest about time** - The Life view is intentionally sobering -->

## Project Structure

```
src/
├── app/
│   ├── today/     # Hour & minute visualization
│   ├── week/      # Day of week & week of year
│   ├── month/     # Calendar grid & month of year
│   ├── year/      # Day of year (365/366 dots)
│   └── life/      # Life timeline with age tracking
├── components/
│   ├── status-dot.tsx      # Reusable grid dot component
│   └── main-container.tsx  # Shared layout wrapper
└── lib/
    ├── date-utils.ts       # Shared date calculations
    └── utils.ts            # Tailwind utilities
```

## License

MIT
