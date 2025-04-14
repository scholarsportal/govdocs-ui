export type NEVER = never;
import type {PostgrestError, AuthError} from '@supabase/supabase-js';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createClient } from '@/utils/supabase/client';

export type SupabaseQueryArgs = {
  path: 'auth' | 'data';
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
};

type SupabaseError = PostgrestError | AuthError;
const supabase = createClient();

export const supabaseBaseQuery: BaseQueryFn<SupabaseQueryArgs, unknown, SupabaseError> = async ({
  path,
  method,
  body,
  params,
}) => {
  try {
    let result;

    if (path === 'auth') {
      if (!(method in supabase.auth)) {
        throw new Error(`Unsupported auth method: ${method}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      result = await (supabase.auth[method as keyof typeof supabase.auth] as Function)(body);
    } else if (path === 'data') {
      const [table, action] = method.split('.');
      if (!(table in supabase) || !(action in supabase[table as keyof typeof supabase])) {
        throw new Error(`Unsupported data method: ${method}`);
      }
      result = await (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        supabase[table as keyof typeof supabase][action as keyof (typeof supabase)[keyof typeof supabase]] as Function
      )(params);
    } else {
      throw new Error(`Unsupported path: ${path}`);
    }

    if (result.error) {
      return { error: result.error };
    }

    return { data: result.data };
  } catch (error) {
    return { error: error as SupabaseError };
  }
};