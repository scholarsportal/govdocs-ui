import { createApi , fakeBaseQuery} from '@reduxjs/toolkit/query/react';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/database.types';

const supabase = createClient();

export const ocrJobsApi = createApi({
    reducerPath: 'ocrJobsApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['ocrJobs'],
    endpoints: (builder) => ({
        getAllOcrJobs: builder.query<Database['public']['Tables']['ocr_jobs']['Row'][], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('ocr_jobs')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    return { error };
                }
                
                return { data };
            },
            providesTags: ['ocrJobs'],
        }),
    })
});


export const { useGetAllOcrJobsQuery } = ocrJobsApi;