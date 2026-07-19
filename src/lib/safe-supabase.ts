import type { SupabaseClient } from '@supabase/supabase-js'
import { safeAsync, classifyError } from './errors/ErrorHandler'
import type { SafeResult } from './errors/ErrorHandler'
import { errorLogger } from './errors/ErrorLogger'

export type SafeSupabaseResult<T> = SafeResult<T>

type QueryResult<T> = { data: T | null; error: unknown }

async function safeQuery<T>(
  queryFn: () => Promise<QueryResult<T>>,
  context?: string,
): Promise<SafeSupabaseResult<T>> {
  return safeAsync(async () => {
    const { data, error } = await queryFn()
    if (error) {
      const classified = classifyError(error)
      errorLogger.error(`Supabase query error [${context ?? 'unknown'}]`, classified)
      throw classified
    }
    if (data === null || data === undefined) {
      throw new Error('No data returned')
    }
    return data as T
  }, { route: context })
}

export function safeSupabase(client: SupabaseClient) {
  return {
    from: (table: string) => ({
      select: <T = unknown>(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => ({
        eq: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).eq(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.eq`,
        ),
        neq: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).neq(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.neq`,
        ),
        in: (column: string, values: unknown[]) => safeQuery<T>(
          () => client.from(table).select(columns, options).in(column, values as string[]) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.in`,
        ),
        contains: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).contains(column, value as Record<string, unknown>) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.contains`,
        ),
        gte: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).gte(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.gte`,
        ),
        lte: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).lte(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.lte`,
        ),
        lt: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).lt(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.lt`,
        ),
        gt: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).select(columns, options).gt(column, value as string) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.gt`,
        ),
        order: (column: string, opts?: { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }) => ({
          ...safeSupabase(client).from(table).select(columns),
          range: (from: number, to: number) => safeQuery<T>(
            () => client.from(table).select(columns as string | undefined, { count: 'exact' }).order(column, opts).range(from, to) as unknown as Promise<QueryResult<T>>,
            `from.${table}.select.order.range`,
          ),
          limit: (count: number) => safeQuery<T>(
            () => client.from(table).select(columns as string | undefined, { count: 'exact' }).order(column, opts).limit(count) as unknown as Promise<QueryResult<T>>,
            `from.${table}.select.order.limit`,
          ),
        }),
        single: () => safeQuery<T>(
          () => client.from(table).select(columns as string | undefined, options).single() as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.single`,
        ),
        maybeSingle: () => safeQuery<T | null>(
          () => client.from(table).select(columns as string | undefined, options).maybeSingle() as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.maybeSingle`,
        ),
        limit: (count: number) => safeQuery<T>(
          () => client.from(table).select(columns as string | undefined, options).limit(count) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.limit`,
        ),
        range: (from: number, to: number) => safeQuery<T>(
          () => client.from(table).select(columns as string | undefined, options).range(from, to) as unknown as Promise<QueryResult<T>>,
          `from.${table}.select.range`,
        ),
        throwOnError: () => client.from(table).select(columns as string | undefined, options),
      }),

      insert: <T = unknown>(values: Record<string, unknown> | Record<string, unknown>[]) => safeQuery<T>(
        () => client.from(table).insert(values).select() as unknown as Promise<QueryResult<T>>,
        `from.${table}.insert`,
      ),

      update: <T = unknown>(values: Record<string, unknown>) => ({
        eq: (column: string, value: unknown) => safeQuery<T>(
          () => client.from(table).update(values).eq(column, value).select() as unknown as Promise<QueryResult<T>>,
          `from.${table}.update.eq`,
        ),
        match: (criteria: Record<string, unknown>) => safeQuery<T>(
          () => client.from(table).update(values).match(criteria).select() as unknown as Promise<QueryResult<T>>,
          `from.${table}.update.match`,
        ),
      }),

      delete: () => ({
        eq: (column: string, value: unknown) => safeQuery<null>(
          () => client.from(table).delete().eq(column, value) as unknown as Promise<QueryResult<null>>,
          `from.${table}.delete.eq`,
        ),
        match: (criteria: Record<string, unknown>) => safeQuery<null>(
          () => client.from(table).delete().match(criteria) as unknown as Promise<QueryResult<null>>,
          `from.${table}.delete.match`,
        ),
        in: (column: string, values: unknown[]) => safeQuery<null>(
          () => client.from(table).delete().in(column, values) as unknown as Promise<QueryResult<null>>,
          `from.${table}.delete.in`,
        ),
      }),
    }),

    auth: {
      getUser: () => safeAsync(async () => {
        const { data, error } = await client.auth.getUser()
        if (error) throw classifyError(error)
        return data.user
      }, { route: 'auth.getUser' }),

      getSession: () => safeAsync(async () => {
        const { data, error } = await client.auth.getSession()
        if (error) throw classifyError(error)
        return data.session
      }, { route: 'auth.getSession' }),

      signInWithPassword: (credentials: { email: string; password: string }) =>
        safeAsync(async () => {
          const { data, error } = await client.auth.signInWithPassword(credentials)
          if (error) throw classifyError(error)
          return data
        }, { route: 'auth.signInWithPassword' }),

      signUp: (credentials: { email: string; password: string; options?: Record<string, unknown> }) =>
        safeAsync(async () => {
          const { data, error } = await client.auth.signUp(credentials)
          if (error) throw classifyError(error)
          return data
        }, { route: 'auth.signUp' }),

      signOut: () => safeAsync(async () => {
        const { error } = await client.auth.signOut()
        if (error) throw classifyError(error)
      }, { route: 'auth.signOut' }),

      resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) =>
        safeAsync(async () => {
          const { data, error } = await client.auth.resetPasswordForEmail(email, options)
          if (error) throw classifyError(error)
          return data
        }, { route: 'auth.resetPasswordForEmail' }),

      updateUser: (attributes: Record<string, unknown>) =>
        safeAsync(async () => {
          const { data, error } = await client.auth.updateUser(attributes)
          if (error) throw classifyError(error)
          return data
        }, { route: 'auth.updateUser' }),

      onAuthStateChange: (callback: (event: string, session: unknown) => void) =>
        client.auth.onAuthStateChange(callback),
    },

    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: File | Blob | ArrayBuffer, options?: Record<string, unknown>) =>
          safeAsync(async () => {
            const { data, error } = await client.storage.from(bucket).upload(path, file, options)
            if (error) throw classifyError(error)
            return data
          }, { route: `storage.${bucket}.upload` }),

        download: (path: string) =>
          safeAsync(async () => {
            const { data, error } = await client.storage.from(bucket).download(path)
            if (error) throw classifyError(error)
            return data
          }, { route: `storage.${bucket}.download` }),

        getPublicUrl: (path: string) =>
          client.storage.from(bucket).getPublicUrl(path),

        list: (prefix?: string, options?: Record<string, unknown>) =>
          safeAsync(async () => {
            const { data, error } = await client.storage.from(bucket).list(prefix, options)
            if (error) throw classifyError(error)
            return data
          }, { route: `storage.${bucket}.list` }),

        remove: (paths: string | string[]) =>
          safeAsync(async () => {
            const { data, error } = await client.storage.from(bucket).remove(Array.isArray(paths) ? paths : [paths])
            if (error) throw classifyError(error)
            return data
          }, { route: `storage.${bucket}.remove` }),
      }),
    },

    rpc: <T = unknown>(fn: string, params?: Record<string, unknown>) =>
      safeAsync<T>(async () => {
        const { data, error } = await client.rpc(fn, params)
        if (error) throw classifyError(error)
        return data as T
      }, { route: `rpc.${fn}` }),
  }
}
