import { describe, expect, it } from 'vitest';
import { IMemoryDb, newDb } from 'pg-mem';

type PuppyRow = {
  id: string;
  status: string;
  sold_at: Date | null;
  is_archived: boolean;
  updated_at: Date;
};

const FIXED_NOW = new Date('2025-02-01T00:00:00.000Z');

function createDb(): IMemoryDb {
  const db = newDb();

  db.public.none(`
    CREATE TABLE puppies (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      sold_at TIMESTAMPTZ,
      is_archived BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION archive_sold_puppies_after_30_days()
    RETURNS INTEGER AS $$
    WITH updated AS (
      UPDATE puppies
      SET is_archived = true,
          updated_at = TIMESTAMPTZ '${FIXED_NOW.toISOString()}'
      WHERE status = 'sold'
        AND sold_at IS NOT NULL
        AND sold_at <= TIMESTAMPTZ '${FIXED_NOW.toISOString()}' - INTERVAL '30 days'
        AND is_archived = false
      RETURNING 1
    )
    SELECT COUNT(*)::INTEGER FROM updated;
    $$ LANGUAGE sql;
  `);

  return db;
}

function daysAgo(days: number): Date {
  return new Date(FIXED_NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function insertPuppy(
  db: IMemoryDb,
  options: {
    id: string;
    status: string;
    soldAt?: Date | null;
    isArchived?: boolean;
    updatedAt?: Date;
  },
): void {
  const soldAtSql = options.soldAt ? `TIMESTAMPTZ '${options.soldAt.toISOString()}'` : 'NULL';
  const updatedAtSql = options.updatedAt
    ? `TIMESTAMPTZ '${options.updatedAt.toISOString()}'`
    : 'NOW()';

  db.public.none(`
    INSERT INTO puppies (id, status, sold_at, is_archived, updated_at)
    VALUES (
      '${options.id}',
      '${options.status}',
      ${soldAtSql},
      ${options.isArchived ? 'TRUE' : 'FALSE'},
      ${updatedAtSql}
    );
  `);
}

function fetchPuppies(db: IMemoryDb): PuppyRow[] {
  return db.public.many(`
    SELECT id, status, sold_at, is_archived, updated_at
    FROM puppies
    ORDER BY id
  `) as PuppyRow[];
}

describe('archive_sold_puppies_after_30_days', () => {
  it('archives puppies sold at least 30 days ago and returns affected count', () => {
    const db = createDb();

    insertPuppy(db, {
      id: 'sold-31-days',
      status: 'sold',
      soldAt: daysAgo(31),
      updatedAt: new Date('2024-12-10T00:00:00.000Z'),
    });
    insertPuppy(db, {
      id: 'sold-30-days',
      status: 'sold',
      soldAt: daysAgo(30),
      updatedAt: new Date('2024-12-12T00:00:00.000Z'),
    });
    insertPuppy(db, {
      id: 'sold-29-days',
      status: 'sold',
      soldAt: daysAgo(29),
      updatedAt: new Date('2024-12-15T00:00:00.000Z'),
    });
    insertPuppy(db, {
      id: 'available',
      status: 'available',
      soldAt: null,
      updatedAt: new Date('2024-12-18T00:00:00.000Z'),
    });

    const { archived_count } = db.public.one(
      'SELECT archive_sold_puppies_after_30_days() AS archived_count;',
    ) as { archived_count: number };

    expect(archived_count).toBe(2);

    const puppies = fetchPuppies(db);
    const byId = Object.fromEntries(puppies.map((puppy) => [puppy.id, puppy]));

    expect(byId['sold-31-days'].is_archived).toBe(true);
    expect(byId['sold-31-days'].updated_at.toISOString()).toBe(FIXED_NOW.toISOString());

    expect(byId['sold-30-days'].is_archived).toBe(true);
    expect(byId['sold-30-days'].updated_at.toISOString()).toBe(FIXED_NOW.toISOString());

    expect(byId['sold-29-days'].is_archived).toBe(false);
    expect(byId['sold-29-days'].updated_at.toISOString()).toBe('2024-12-15T00:00:00.000Z');

    expect(byId['available'].is_archived).toBe(false);
  });

  it('ignores puppies that are already archived', () => {
    const db = createDb();

    insertPuppy(db, {
      id: 'already-archived',
      status: 'sold',
      soldAt: daysAgo(45),
      isArchived: true,
      updatedAt: new Date('2024-12-01T00:00:00.000Z'),
    });
    insertPuppy(db, {
      id: 'eligible-to-archive',
      status: 'sold',
      soldAt: daysAgo(40),
      isArchived: false,
      updatedAt: new Date('2024-12-05T00:00:00.000Z'),
    });

    const { archived_count } = db.public.one(
      'SELECT archive_sold_puppies_after_30_days() AS archived_count;',
    ) as { archived_count: number };

    expect(archived_count).toBe(1);

    const puppies = fetchPuppies(db);
    const alreadyArchived = puppies.find((puppy) => puppy.id === 'already-archived');
    const newlyArchived = puppies.find((puppy) => puppy.id === 'eligible-to-archive');

    expect(alreadyArchived?.is_archived).toBe(true);
    expect(alreadyArchived?.updated_at.toISOString()).toBe('2024-12-01T00:00:00.000Z');

    expect(newlyArchived?.is_archived).toBe(true);
    expect(newlyArchived?.updated_at.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it('returns zero when no sold puppies qualify for archiving', () => {
    const db = createDb();

    insertPuppy(db, {
      id: 'recent-sale',
      status: 'sold',
      soldAt: daysAgo(5),
    });
    insertPuppy(db, {
      id: 'available-puppy',
      status: 'available',
      soldAt: null,
    });

    const { archived_count } = db.public.one(
      'SELECT archive_sold_puppies_after_30_days() AS archived_count;',
    ) as { archived_count: number };

    expect(archived_count).toBe(0);

    const puppies = fetchPuppies(db);
    expect(
      puppies.every((puppy) => puppy.is_archived === false && puppy.status !== 'archived'),
    ).toBe(true);
  });
});
