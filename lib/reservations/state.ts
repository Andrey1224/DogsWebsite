import { getPuppyBySlug } from '@/lib/supabase/queries';
import { ReservationQueries } from './queries';

export interface PuppyReservationState {
  puppy: Awaited<ReturnType<typeof getPuppyBySlug>>;
  canReserve: boolean;
  reservationBlocked: boolean;
}

export async function getPuppyReservationState(
  slug: string,
): Promise<PuppyReservationState | null> {
  const puppy = await getPuppyBySlug(slug);
  if (!puppy || !puppy.id) {
    return null;
  }

  const hasActiveReservation = await ReservationQueries.hasActiveReservation(puppy.id);
  const canReserve = puppy.status === 'available' && !puppy.is_archived && !hasActiveReservation;

  return {
    puppy,
    canReserve,
    reservationBlocked: hasActiveReservation,
  };
}
