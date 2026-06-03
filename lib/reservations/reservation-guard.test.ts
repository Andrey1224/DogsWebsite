import { afterEach, describe, expect, it } from 'vitest';

import {
  assertReservationsEnabled,
  isReservationsDisabled,
  ReservationsDisabledError,
} from './reservation-guard';

const ORIGINAL_ENV = { ...process.env };

function resetReservationFlags() {
  process.env.RESERVATIONS_DISABLED = ORIGINAL_ENV.RESERVATIONS_DISABLED;
  process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED = ORIGINAL_ENV.NEXT_PUBLIC_RESERVATIONS_DISABLED;

  if (ORIGINAL_ENV.RESERVATIONS_DISABLED === undefined) {
    delete process.env.RESERVATIONS_DISABLED;
  }

  if (ORIGINAL_ENV.NEXT_PUBLIC_RESERVATIONS_DISABLED === undefined) {
    delete process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED;
  }
}

describe('reservation guard', () => {
  afterEach(() => {
    resetReservationFlags();
  });

  it('allows reservations when both flags are unset or false', () => {
    process.env.RESERVATIONS_DISABLED = 'false';
    process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED = 'false';

    expect(isReservationsDisabled()).toBe(false);
    expect(() => assertReservationsEnabled()).not.toThrow();
  });

  it('disables reservations when server flag is true', () => {
    process.env.RESERVATIONS_DISABLED = 'true';
    process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED = 'false';

    expect(isReservationsDisabled()).toBe(true);
    expect(() => assertReservationsEnabled()).toThrow(ReservationsDisabledError);
  });

  it('disables reservations when public flag is true', () => {
    process.env.RESERVATIONS_DISABLED = 'false';
    process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED = 'true';

    expect(isReservationsDisabled()).toBe(true);
    expect(() => assertReservationsEnabled()).toThrow('Reservations are currently disabled.');
  });
});
