import { createApi , fakeBaseQuery} from '@reduxjs/toolkit/query/react';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/database.types';

const supabase = createClient();

export const documentsApi = createApi({
    reducerPath: 'documentsApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['documents'],
    endpoints: (builder) => ({
        getAllDocuments: builder.query<Database['public']['Tables']['documents']['Row'][], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('documents')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    return { error };
                }
                
                return { data };
            },
            providesTags: ['documents'],
        }),
        getDocumentById: builder.query<Database['public']['Tables']['documents']['Row'], string>({
            queryFn: async (id) => {
                const { data, error } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) {
                    return { error };
                }
                
                return { data };
            }
        }),
        getDocumentImageUrl: builder.query<string, { barcode: string; pageNumber: number }>({
          queryFn: async ({ barcode, pageNumber }) => {
            const { data } = supabase
              .storage
              .from('ia_bucket')
              .getPublicUrl(`${barcode}/${pageNumber}.png`);
            
            return { data: data.publicUrl };
          }
        })
    })
});


export const { useGetAllDocumentsQuery, useGetDocumentByIdQuery, useGetDocumentImageUrlQuery} = documentsApi;