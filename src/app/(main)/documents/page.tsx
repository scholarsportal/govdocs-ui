import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from "@/utils/supabase/server";
import { IconLoader2, IconExternalLink, IconFileText, IconSearch, IconEye } from "@tabler/icons-react";

import { DataTable } from "@/components/documents/data-table";
import { DocumentsHeader } from '@/components/documents/document-header';
import { DocumentsEmptyState } from '@/components/documents/document-empty-state';
import { columns } from "@/components/documents/columns";

export default async function DocumentsPage() {
  const supabase = await createClient();
  
  // Fetch documents data from Supabase
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching documents:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <DocumentsHeader />
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <IconLoader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }>
        {documents && documents.length > 0 ? (
          <DataTable data={documents} columns={columns} />
        ) : (
          <DocumentsEmptyState error={error} />
        )}
      </Suspense>
    </div>
  );
}