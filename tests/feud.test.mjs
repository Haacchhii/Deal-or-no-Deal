import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/feud-game.js';
const { SAMPLE_ROUNDS, parseRounds, createGame, advance, bank, multiplier } = globalThis.FeudGame;

const start = () => createGame(parseRounds(SAMPLE_ROUNDS), ['Alpha', 'Beta']);
const play = () => advance(start(), 'control', 0);
const strikeOut = game => [1, 2, 3].reduce(current => advance(current, 'strike'), game);

test('sample rounds and CRLF custom content parse with strict point validation', () => {
  assert.equal(parseRounds(SAMPLE_ROUNDS).length, 4);
  assert.equal(parseRounds('Question?\r\nOne | 55\r\nTwo | 45')[0].answers[0].points, 55);
  for (const text of ['', 'Question?\nOnly | 10', 'Q?\nA | 60\nB | 60', 'Q?\nA | -1\nB | 10', 'Q?\nA | 1.2\nB | 10', 'Q?\nA | 0\nB | 10', 'Q?\nA | 20\na | 10', 'Q?\nA | \nB | 10']) {
    assert.throws(() => parseRounds(text));
  }
});

test('hidden board cannot reveal before selecting control; duplicate reveals do not score', () => {
  const game = start();
  assert.equal(advance(game, 'reveal', 0), game);
  const revealed = advance(advance(game, 'control', 1), 'reveal', 0);
  assert.equal(bank(revealed), 30);
  assert.equal(advance(revealed, 'reveal', 0), revealed);
  assert.equal(advance(revealed, 'reveal', -1), revealed);
  assert.equal(advance(revealed, 'next'), revealed);
  assert.deepEqual(game.revealed, []);
});

test('clearing the board awards once and preserves previous snapshots for undo', () => {
  const original = play();
  const cleared = [0, 1, 2, 3, 4].reduce((game, index) => advance(game, 'reveal', index), original);
  assert.equal(cleared.phase, 'result');
  assert.deepEqual(cleared.scores, [100, 0]);
  assert.equal(advance(cleared, 'reveal', 0), cleared);
  assert.equal(advance(cleared, 'strike'), cleared);
  assert.deepEqual(original.scores, [0, 0]);
  assert.deepEqual(original.revealed, []);
});

test('three strikes allow exactly one steal; matching answer adds its points', () => {
  const steal = strikeOut(advance(play(), 'reveal', 0));
  assert.equal(steal.phase, 'steal');
  assert.equal(steal.strikes, 3);
  assert.equal(advance(steal, 'strike'), steal);
  const won = advance(steal, 'reveal', 1);
  assert.deepEqual(won.scores, [0, 55]);
  assert.equal(won.winner, 1);
  assert.equal(advance(won, 'miss'), won);
  assert.deepEqual(steal.scores, [0, 0]);
});

test('failed steals award only revealed points to the original team', () => {
  const won = advance(strikeOut(advance(play(), 'reveal', 0)), 'miss');
  assert.deepEqual(won.scores, [30, 0]);
  const empty = advance(strikeOut(play()), 'miss');
  assert.deepEqual(empty.scores, [0, 0]);
  assert.equal(empty.phase, 'result');
});

test('all rounds advance with 1/1/2/3 multipliers, reset the board, then finish', () => {
  let game = start();
  assert.deepEqual([0, 1, 2, 3, 4].map(multiplier), [1, 1, 2, 3, 3]);
  for (let round = 0; round < 4; round++) {
    assert.equal(game.round, round);
    assert.equal(game.phase, 'faceoff');
    assert.deepEqual(game.revealed, []);
    assert.equal(game.strikes, 0);
    game = advance(game, 'control', 0);
    for (let answer = 0; answer < 5; answer++) game = advance(game, 'reveal', answer);
    game = advance(game, 'next');
  }
  assert.equal(game.phase, 'finished');
  assert.deepEqual(game.scores, [700, 0]);
  assert.equal(advance(game, 'next'), game);
});
