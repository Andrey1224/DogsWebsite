/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'pg' {
  export type QueryResult<Row = any> = {
    rows: Row[];
    rowCount: number | null;
  };

  export interface PoolConfig {
    connectionString?: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<Row = any>(text: string, params?: unknown[]): Promise<QueryResult<Row>>;
    end(): Promise<void>;
  }
}
