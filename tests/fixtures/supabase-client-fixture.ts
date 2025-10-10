type Row = Record<string, unknown>;

interface QueryResult<T = unknown> {
  data: T | null;
  error: { message: string } | null;
  status?: number;
}

type TableStore = Record<string, Row[]>;

type RpcHandlerUntyped = (params?: unknown) => Promise<QueryResult<unknown>>;

interface RpcHandler<TParams = unknown, TResult = unknown> {
  (params?: TParams): Promise<QueryResult<TResult>>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function createSupabaseFixture(initial: { tables?: TableStore } = {}) {
  const initialState = clone(initial.tables || {});
  const db: TableStore = clone(initialState);
  const rpcHandlers: Record<string, RpcHandlerUntyped> = {};

  const registerRpc = <TParams, TResult>(
    name: string,
    handler: RpcHandler<TParams, TResult>,
  ) => {
    rpcHandlers[name] = handler as RpcHandlerUntyped;
  };

  const from = (table: string) => ({
    insert: async (rows: Row | Row[]) => {
      const toInsert = Array.isArray(rows) ? rows : [rows];
      db[table] = db[table] || [];
      db[table].push(...clone(toInsert));
      return { data: clone(toInsert), error: null } as QueryResult;
    },
    update: async (changes: Partial<Row>) => {
      db[table] = db[table] || [];
      db[table] = db[table].map((row) => ({ ...row, ...changes }));
      return { data: clone(db[table]), error: null } as QueryResult;
    },
    select: async () => {
      const data = db[table] ? clone(db[table]) : [];
      return { data, error: null } as QueryResult;
    },
    delete: async () => {
      const snapshot = db[table] ? clone(db[table]) : [];
      db[table] = [];
      return { data: snapshot, error: null } as QueryResult;
    },
  });

  const rpc = async (fn: string, params?: unknown) => {
    const handler = rpcHandlers[fn];
    if (!handler) {
      return {
        data: null,
        error: { message: `rpc ${fn} not implemented in fixture` },
      } as QueryResult;
    }

    try {
      return await handler(params);
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : String(error),
        },
      } as QueryResult;
    }
  };

  const createClientView = () => ({
    from,
    rpc,
    registerRpc,
    __setTable: (table: string, rows: Row[]) => {
      db[table] = clone(rows);
    },
    __getTable: (table: string) => clone(db[table] || []),
  });

  const transaction = async <T>(
    callback: (client: ReturnType<typeof createClientView>) => Promise<T>,
  ) => {
    const snapshot = clone(db);
    const client = createClientView();
    try {
      const data = await callback(client);
      return { data, error: null };
    } catch (error) {
      Object.keys(db).forEach((key) => delete db[key]);
      Object.assign(db, snapshot);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'transaction_error',
        },
      };
    }
  };

  return {
    from,
    rpc,
    transaction,
    registerRpc,
    createClientView,
    __getDb: () => db,
    reset: (tables?: TableStore) => {
      Object.keys(db).forEach((key) => delete db[key]);
      const source = tables ? tables : initialState;
      Object.assign(db, clone(source));
      Object.keys(rpcHandlers).forEach((key) => delete rpcHandlers[key]);
    },
  };
}

export type SupabaseFixture = ReturnType<typeof createSupabaseFixture>;
