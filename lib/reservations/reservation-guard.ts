import 'server-only';

export const RESERVATIONS_DISABLED_MESSAGE = 'Reservations are currently disabled.';

export class ReservationsDisabledError extends Error {
  constructor(message = RESERVATIONS_DISABLED_MESSAGE) {
    super(message);
    this.name = 'ReservationsDisabledError';
  }
}

export function isReservationsDisabled(): boolean {
  const serverDisabled = process.env.RESERVATIONS_DISABLED === 'true';
  const publicDisabled = process.env.NEXT_PUBLIC_RESERVATIONS_DISABLED === 'true';

  return serverDisabled || publicDisabled;
}

export function assertReservationsEnabled(): void {
  if (isReservationsDisabled()) {
    throw new ReservationsDisabledError();
  }
}
