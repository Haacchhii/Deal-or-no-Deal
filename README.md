# Larong Pinoy

A browser-based Filipino party-game hub featuring three games:

- **Deal or No Deal** — configure 2–40 briefcases and enter a custom peso value for every case.
- **Pinoy Henyo** — enter a custom secret-word list, select a 30–120 second timer, then play timed guessing rounds with score tracking.
- **Family Feud** — host a two-team match with custom questions, answer reveals, three strikes, steals, round multipliers, and Undo.

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

The opening menu lets players choose a game. Every game screen includes a **Game menu** control for returning home.

Deal or No Deal validates that the number of entered prize values exactly matches the selected number of briefcases. Pinoy Henyo accepts words separated by new lines, commas, or semicolons and automatically reshuffles the list after every complete cycle.

### Family Feud

Enter two distinct team names and 1–20 question blocks. Each block starts with a question, followed by 2–8 `Answer | points` lines. Separate blocks with a blank line. Points must be positive whole numbers, totaling at most 100 per round. The starter pack is fictional practice content, not survey data.

The host conducts the face-off verbally, selects which team plays (including a pass decision), and reveals any matching face-off answers. Reveal answers by number; the optional host answer key must stay hidden from players. Three strikes give the other team one guess. A correct steal awards the revealed bank plus the steal answer; a missed steal awards the bank to the original team. A cleared board awards the bank automatically. Unclaimed answers shown after scoring add no points.

Rounds 1–2 use ×1 points, round 3 uses ×2, and later rounds use ×3. The highest total after the final round wins; equal totals produce a tie. **Undo last action** restores the previous board and scores, including after an award or round change. Match state stays in memory and is lost on reload or leaving the game. Fast Money and separate host/player screens are not included.
