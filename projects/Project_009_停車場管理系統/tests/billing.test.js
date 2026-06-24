import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateFee } from '../server/billing.js';

const rateSetting = {
  freeMinutes: 30,
  hourlyRate: 40,
  dailyMaxFee: 300
};

test('calculateFee returns zero inside free minutes', () => {
  const entry = new Date('2026-06-23T08:00:00.000Z');
  const exit = new Date('2026-06-23T08:30:00.000Z');

  assert.deepEqual(calculateFee('TEMPORARY', entry, exit, rateSetting), {
    minutes: 30,
    billableHours: 0,
    days: 0,
    fee: 0
  });
});

test('calculateFee rounds remaining minutes up to an hour', () => {
  const entry = new Date('2026-06-23T08:00:00.000Z');
  const exit = new Date('2026-06-23T08:31:00.000Z');

  assert.deepEqual(calculateFee('TEMPORARY', entry, exit, rateSetting), {
    minutes: 31,
    billableHours: 1,
    days: 0,
    fee: 40
  });
});

test('calculateFee applies daily maximum fee', () => {
  const entry = new Date('2026-06-23T08:00:00.000Z');
  const exit = new Date('2026-06-23T18:00:00.000Z');

  assert.equal(calculateFee('TEMPORARY', entry, exit, rateSetting).fee, 300);
});

test('calculateFee does not charge monthly and VIP vehicles', () => {
  const entry = new Date('2026-06-23T08:00:00.000Z');
  const exit = new Date('2026-06-24T08:00:00.000Z');

  assert.equal(calculateFee('MONTHLY', entry, exit, rateSetting).fee, 0);
  assert.equal(calculateFee('VIP', entry, exit, rateSetting).fee, 0);
});
