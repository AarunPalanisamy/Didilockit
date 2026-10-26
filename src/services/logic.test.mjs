// Run: npm run test:logic  (Node ≥ 22.6, strips TS types natively)
import assert from 'node:assert/strict';
import test from 'node:test';

import { isExpired, nextExpiryAt, resetExpired } from './expiry.ts';
import { allEnabledDone, dayKey, previousDayKey, updateStreak, visibleStreak } from './streak.ts';

const H = 60 * 60 * 1000;
const TTL = 24 * H;
const NOW = new Date(2026, 9, 22, 21, 0, 0).getTime();

const check = (id, ageMs, method = 'photo', enabled = true) => ({
  id,
  label: id,
  art: 'custom',
  enabled,
  custom: false,
  verification:
    ageMs === null
      ? null
      : { method, mediaUri: method === 'manual' ? null : `file:///proofs/${id}.jpg`, verifiedAt: NOW - ageMs },
});

// ── expiry ────────────────────────────────────────────────────────────────
test('fresh proof kept, 24h proof expires, future timestamp expires', () => {
  assert.equal(isExpired(check('a', 23 * H).verification, NOW, TTL), false);
  assert.equal(isExpired(check('a', TTL).verification, NOW, TTL), true);
  assert.equal(isExpired(check('a', -2 * H).verification, NOW, TTL), true);
});

test('resetExpired resets old rows, collects files, keeps fresh, never mutates', () => {
  const input = [check('old', 25 * H), check('fresh', H), check('none', null)];
  const r = resetExpired(input, NOW, TTL);
  assert.equal(r.changed, true);
  assert.deepEqual(r.expiredUris, ['file:///proofs/old.jpg']);
  assert.equal(r.checks[0].verification, null);
  assert.notEqual(r.checks[1].verification, null);
  assert.notEqual(input[0].verification, null);
});

test('manual ticks expire on time and have no file to delete', () => {
  const r = resetExpired([check('m', 25 * H, 'manual')], NOW, TTL, () => false);
  assert.equal(r.changed, true);
  assert.deepEqual(r.expiredUris, []);
});

test('fresh manual tick is not reset by the missing-file check', () => {
  const r = resetExpired([check('m', H, 'manual')], NOW, TTL, () => false);
  assert.equal(r.changed, false);
});

test('missing media file resets a scanned row without deleting', () => {
  const r = resetExpired([check('gone', H)], NOW, TTL, () => false);
  assert.equal(r.checks[0].verification, null);
  assert.deepEqual(r.expiredUris, []);
});

test('nextExpiryAt returns the earliest expiry', () => {
  assert.equal(nextExpiryAt([check('a', 2 * H), check('b', 10 * H), check('c', null)], TTL), NOW - 10 * H + TTL);
  assert.equal(nextExpiryAt([check('c', null)], TTL), null);
});

// ── streak ────────────────────────────────────────────────────────────────
test('day keys and previous day across a month boundary', () => {
  assert.equal(dayKey(NOW), '2026-10-22');
  assert.equal(previousDayKey('2026-11-01'), '2026-10-31');
  assert.equal(previousDayKey('2026-01-01'), '2025-12-31');
});

test('allEnabledDone ignores hidden checks and needs at least one', () => {
  assert.equal(allEnabledDone([check('a', H), check('b', null, 'photo', false)]), true);
  assert.equal(allEnabledDone([check('a', H), check('b', null)]), false);
  assert.equal(allEnabledDone([check('b', null, 'photo', false)]), false);
});

test('streak starts, continues next day, resets after a gap, counts once per day', () => {
  const done = [check('a', H, 'manual')];
  const s1 = updateStreak({ count: 0, lastDay: null }, done, NOW);
  assert.deepEqual(s1, { count: 1, lastDay: '2026-10-22' });
  assert.equal(updateStreak(s1, done, NOW + H), s1);
  const s2 = updateStreak(s1, done, NOW + 24 * H);
  assert.equal(s2.count, 2);
  const s3 = updateStreak(s2, done, NOW + 24 * H * 4);
  assert.equal(s3.count, 1);
});

test('visible streak survives through the next day, then shows 0', () => {
  const s = { count: 5, lastDay: '2026-10-22' };
  assert.equal(visibleStreak(s, NOW), 5);
  assert.equal(visibleStreak(s, NOW + 24 * H), 5);
  assert.equal(visibleStreak(s, NOW + 48 * H), 0);
});
