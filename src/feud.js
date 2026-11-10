(() => {
const { SAMPLE_ROUNDS, parseRounds, createGame, advance, bank, multiplier } = globalThis.FeudGame;


const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let draft = { teams: ['Team A', 'Team B'], questions: SAMPLE_ROUNDS };
let game = null;
let history = [];
let error = '';
let showKey = false;
let hostApp;
let goHome;
const focus = selector => requestAnimationFrame(() => hostApp.querySelector(selector)?.focus());
const button = (action, label, extra = '') => `<button type="button" class="secondary" data-feud="${action}" ${extra}>${label}</button>`;

function startFeud(app, onHome) {
  hostApp = app;
  goHome = onHome;
  game = null;
  history = [];
  error = '';
  showKey = false;
  render();
  focus('#team-a');
}

function setup() {
  return `<main class="feud-setup" id="main">
    <section class="feud-intro"><h1>Family<br><em>Feud.</em></h1><p>Dalawang teams.<br>Isang top answer.</p>
      <ol><li>The host runs the face-off aloud, then selects the team that plays.</li><li>Reveal a matching answer. Three wrong guesses give the other team one chance to steal.</li><li>A correct steal wins the revealed bank, including the steal answer. A miss awards it to the playing team.</li></ol>
      <p>Rounds 1–2: ×1 · Round 3: ×2 · Round 4 onward: ×3.<br>Highest score after the last round wins.</p>
    </section>
    <form id="feud-setup" class="feud-form"><h2>Set up the showdown</h2>
      <div class="feud-team-inputs"><div><label for="team-a">First team</label><input id="team-a" name="teamA" maxlength="30" value="${escape(draft.teams[0])}" required></div><div><label for="team-b">Second team</label><input id="team-b" name="teamB" maxlength="30" value="${escape(draft.teams[1])}" required></div></div>
      <label for="feud-questions">Questions & answers</label>
      <p id="feud-format">Question first, then one <b>Answer | points</b> per line. Separate rounds with a blank line. Use 2–8 answers per round, totaling 100 points or less.</p>
      <textarea id="feud-questions" name="questions" rows="15" aria-describedby="feud-format feud-error" required>${escape(draft.questions)}</textarea>
      <p class="feud-note">The starter pack uses fictional practice points, not real survey results. Edit it for your event. Keep setup hidden from players.</p>
      <p id="feud-error" class="is-error" role="alert">${escape(error)}</p><button class="primary" type="submit">Start Family Feud</button>
    </form></main>`;
}

function message() {
  if (game.phase === 'faceoff') return 'Run the face-off aloud. Who will play? Select the team below, then reveal any matching face-off answers.';
  if (game.phase === 'play') return `${game.teams[game.control]} is playing. Reveal a matching answer or add a strike.`;
  if (game.phase === 'steal') return `${game.teams[1 - game.control]} gets one guess to steal! Reveal a match, or choose “Steal missed”.`;
  return `${game.teams[game.winner]} wins ${game.awarded} points! The remaining answers are now shown.`;
}

function controls() {
  if (game.phase === 'faceoff') return game.teams.map((team, index) => button('control', `${escape(team)} plays`, `data-value="${index}"`)).join('');
  if (game.phase === 'play') return button('strike', 'Wrong answer · Add strike');
  if (game.phase === 'steal') return button('miss', 'Steal missed');
  return button('next', game.round + 1 === game.rounds.length ? 'See final scores' : 'Next round');
}

function board() {
  const round = game.rounds[game.round];
  return `<main class="feud-stage" id="main">
    ${scores()}
    <div class="feud-round"><span>Round ${game.round + 1} of ${game.rounds.length} · ×${multiplier(game.round)} points</span><strong>Round bank <b>${bank(game)}</b></strong></div>
    <h1 tabindex="-1">${escape(round.question)}</h1>
    <ol class="feud-board">${round.answers.map((answer, index) => {
      const revealed = game.revealed.includes(index);
      const visible = revealed || game.phase === 'result';
      return `<li><button type="button" data-feud="reveal" data-value="${index}" class="feud-answer ${visible ? 'is-revealed' : ''} ${visible && !revealed ? 'unclaimed' : ''}" ${revealed || !['play', 'steal'].includes(game.phase) ? 'disabled' : ''} aria-label="${visible ? escape(`${answer.text}, ${answer.points} points`) : `Reveal answer ${index + 1}`}"><span class="feud-number">${index + 1}</span><span>${visible ? escape(answer.text) : '••••••'}</span><strong>${visible ? answer.points : '—'}</strong></button></li>`;
    }).join('')}</ol>
    <section class="feud-host" aria-label="Host controls"><div class="feud-strikes" aria-label="${game.strikes} of 3 strikes">${[1, 2, 3].map(n => `<span class="${n <= game.strikes ? 'struck' : ''}" aria-hidden="true">X</span>`).join('')}<small>${game.strikes} / 3 strikes</small></div>
    <p role="status">${escape(message())}</p><div class="feud-actions">${controls()}${button('undo', 'Undo last action', history.length ? '' : 'disabled')}</div>
    ${game.phase !== 'result' ? `<details class="feud-key" ${showKey ? 'open' : ''}><summary>Host answer key · hides answers from the board only</summary><p>Do not open while sharing your screen with players.</p><ol>${round.answers.map(answer => `<li>${escape(answer.text)} — ${answer.points}</li>`).join('')}</ol></details>` : ''}</section>
  </main>`;
}

function scores() {
  return `<section class="feud-scores" aria-label="Team scores">${game.teams.map((team, index) => `<div class="${game.control === index && ['play', 'steal'].includes(game.phase) ? 'has-control' : ''}"><span>${escape(team)}${game.control === index && game.phase === 'play' ? ' · Playing' : game.control !== index && game.phase === 'steal' ? ' · Stealing' : ''}</span><strong>${game.scores[index]}</strong></div>`).join('')}</section>`;
}

function finished() {
  const winner = game.scores[0] === game.scores[1] ? 'It’s a tie!' : `${game.teams[game.scores[0] > game.scores[1] ? 0 : 1]} wins!`;
  return `<main class="feud-stage feud-finished" id="main"><h1 tabindex="-1">${escape(winner)}</h1><p>All ${game.rounds.length} rounds complete. Salamat sa paglalaro!</p>${scores()}<div class="feud-actions">${button('restart', 'Play again / Edit setup')}${button('undo', 'Back to last round')}</div></main>`;
}

function render() {
  hostApp.innerHTML = `<header class="hub-header"><button class="hub-home" data-feud="home">← Game menu</button><strong>Family Feud</strong><span>Larong Pinoy</span></header>${!game ? setup() : game.phase === 'finished' ? finished() : board()}`;
  hostApp.querySelector('#feud-setup')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    draft = { teams: [data.get('teamA').trim(), data.get('teamB').trim()], questions: data.get('questions') };
    try {
      if (draft.teams.some(team => !team || team.length > 30)) throw new Error('Give each team a name of 1–30 characters.');
      if (draft.teams[0].toLowerCase() === draft.teams[1].toLowerCase()) throw new Error('Use different names for the two teams.');
      game = createGame(parseRounds(draft.questions), draft.teams);
      error = '';
    } catch (err) { error = err.message; }
    render();
    focus(game ? 'h1' : '#feud-questions');
  });
  hostApp.querySelector('.feud-key')?.addEventListener('toggle', event => { showKey = event.currentTarget.open; });
  hostApp.querySelectorAll('[data-feud]').forEach(control => control.addEventListener('click', () => {
    const action = control.dataset.feud;
    if (action === 'home') {
      if (game && game.phase !== 'finished' && !window.confirm('Leave Family Feud and discard this match?')) return;
      goHome();
      return;
    }
    if (action === 'restart') { game = null; history = []; error = ''; }
    else if (action === 'undo') game = history.pop() || game;
    else {
      const next = advance(game, action, Number(control.dataset.value));
      if (next === game) return;
      history.push(game);
      game = next;
    }
    showKey = false;
    render();
    focus(game ? 'h1' : '#team-a');
  }));
}

globalThis.startFeud = startFeud;
})();
