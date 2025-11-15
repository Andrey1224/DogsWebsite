import type { Database } from './database.types';

export type Parent = Database['public']['Tables']['parents']['Row'];
export type Litter = Database['public']['Tables']['litters']['Row'];
export type Puppy = Database['public']['Tables']['puppies']['Row'];
export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type Inquiry = Database['public']['Tables']['inquiries']['Row'];

export type PuppyStatus = Puppy['status'];

export type PuppyWithRelations = Puppy & {
  litter: Litter | null;
  parents: {
    sire: Parent | null;
    dam: Parent | null;
  } | null;
};
