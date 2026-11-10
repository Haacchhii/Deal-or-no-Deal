(() => {
const SAMPLE_ROUNDS = `Name something you bring to the beach.
Towel | 30
Swimsuit | 25
Sunscreen | 20
Food | 15
Slippers | 10

Name a food served at a Filipino celebration.
Lechon | 35
Spaghetti | 25
Lumpia | 20
Pancit | 12
Cake | 8

Name something people do during a brownout.
Use a flashlight | 30
Fan themselves | 25
Sleep | 20
Go outside | 15
Light a candle | 10

Name something you find in a jeepney.
Passengers | 35
Driver | 25
Coins | 20
Handrails | 12
Signboard | 8`;

function parseRounds(text) {
  const blocks = text.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  if (!blocks.length || blocks.length > 20) throw new Error('Enter 1–20 rounds, separated by blank lines.');
  return blocks.map((block, index) => {
    const [question, ...lines] = block.split(/\r?\n/).map(line => line.trim());
    const fail = message => { throw new Error(`Round ${index + 1}: ${message}`); };
    if (!question || question.length > 180) fail('use a question of 1–180 characters.');
    if (lines.length < 2 || lines.length > 8) fail('enter 2–8 answers.');
    const answers = lines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length !== 2 || !parts[0] || parts[0].length > 80 || !/^\d+$/.test(parts[1])) fail('use Answer | points, with a 1–80 character answer and whole-number points.');
      const points = Number(parts[1]);
      if (points < 1 || points > 100) fail('each answer needs 1–100 points.');
      return { text: parts[0], points };
    });
    if (new Set(answers.map(answer => answer.text.toLowerCase())).size !== answers.length) fail('answers must be unique.');
    if (answers.reduce((sum, answer) => sum + answer.points, 0) > 100) fail('answer points must total 100 or less.');
    return { question, answers };
  });
}

const multiplier = round => Math.min(3, Math.max(1, round));
const bank = game => game.rounds[game.round].answers.reduce((sum, answer, index) => sum + (game.revealed.includes(index) ? answer.points : 0), 0) * multiplier(game.round);
function createGame(rounds, teams) {
  return { rounds, teams, scores: [0, 0], round: 0, revealed: [], strikes: 0, control: null, phase: 'faceoff', winner: null, awarded: 0 };
}
function award(game, winner) {
  const points = bank(game);
  return { ...game, scores: game.scores.map((score, index) => score + (index === winner ? points : 0)), phase: 'result', winner, awarded: points };
}
function advance(game, action, value) {
  if (action === 'control' && game.phase === 'faceoff' && [0, 1].includes(value)) return { ...game, control: value, phase: 'play' };
  if (action === 'reveal' && ['play', 'steal'].includes(game.phase) && Number.isInteger(value) && game.rounds[game.round].answers[value] && !game.revealed.includes(value)) {
    const next = { ...game, revealed: [...game.revealed, value] };
    if (game.phase === 'steal') return award(next, 1 - game.control);
    return next.revealed.length === game.rounds[game.round].answers.length ? award(next, game.control) : next;
  }
  if (action === 'strike' && game.phase === 'play') {
    const strikes = game.strikes + 1;
    return { ...game, strikes, phase: strikes === 3 ? 'steal' : 'play' };
  }
  if (action === 'miss' && game.phase === 'steal') return award(game, game.control);
  if (action === 'next' && game.phase === 'result') {
    if (game.round + 1 === game.rounds.length) return { ...game, phase: 'finished' };
    return { ...game, round: game.round + 1, revealed: [], strikes: 0, control: null, phase: 'faceoff', winner: null, awarded: 0 };
  }
  return game;
}

globalThis.FeudGame = Object.freeze({ SAMPLE_ROUNDS, parseRounds, createGame, advance, bank, multiplier });
})();
