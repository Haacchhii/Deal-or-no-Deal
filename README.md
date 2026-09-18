# Larong Pinoy

A browser-based Filipino party-game hub featuring two complete games:

- **Deal or No Deal** — configure 2–40 briefcases and enter a custom peso value for every case.
- **Pinoy Henyo** — enter a custom secret-word list, select a 30–120 second timer, then play timed guessing rounds with score tracking.

## Run locally

Requires Node.js 22.12+.

```sh
npm install
npm run dev
```

## Verify and build

```sh
npm test
npm run build
```

The site is a static Vite application. Deploy the generated `dist/` directory to GitHub Pages, Vercel, or another static host.

## Game controls

The opening menu lets players choose either game. Every game screen includes a **Game menu** control for returning home.

Deal or No Deal validates that the number of entered prize values exactly matches the selected number of briefcases. Pinoy Henyo accepts words separated by new lines, commas, or semicolons and automatically reshuffles the list after every complete cycle.
