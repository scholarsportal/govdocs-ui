"use client";

import { useGetAllDocumentsQuery } from "@/state-management/documents/api";
//import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DocumentType } from "@/types/ocr.types";
// import Link from "next/link";
// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Skeleton } from "@/components/ui/skeleton";
// import Image from "next/image";

// export default function DocumentsPage() {
//   const { data: documents, isLoading, error } = useGetAllDocumentsQuery();
//   const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);

//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-8">
//         <h1 className="text-2xl font-bold mb-6">Documents</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: 6 }).map((_, index) => (
//             <Card key={index} className="h-64">
//               <CardHeader>
//                 <Skeleton className="h-8 w-3/4" />
//               </CardHeader>
//               <CardContent>
//                 <Skeleton className="h-6 w-1/2 mb-2" />
//                 <Skeleton className="h-6 w-full mb-2" />
//                 <Skeleton className="h-8 w-1/3 mt-4" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto py-8">
//         <h1 className="text-2xl font-bold mb-6">Documents</h1>
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <p>Failed to load documents. Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   if (!documents?.length) {
//     return (
//       <div className="container mx-auto py-8">
//         <h1 className="text-2xl font-bold mb-6">Documents</h1>
//         <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
//           <p>No documents found.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-6">Government Documents</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {documents.map(document => (
//           <Card key={document.id} className="h-full">
//             <CardHeader>
//               <CardTitle className="truncate">{document.title}</CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col h-full">
//               <p className="text-sm text-gray-500 mb-2">
//                 Barcode: {document.barcode}
//               </p>
//               <p className="text-sm text-gray-500 mb-4 truncate">
//                 <a 
//                   href={document.ia_link} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="text-blue-500 hover:underline"
//                 >
//                   Internet Archive Link
//                 </a>
//               </p>
//               <div className="mt-auto flex space-x-2">
//                 <Button onClick={() => setSelectedDocument(document)} variant="outline">
//                   Preview
//                 </Button>
//                 <Button asChild>
//                   <Link href={`/new_ocr_job/${document.id}`}>
//                     Evaluate OCR Models
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <DocumentPreviewDialog 
//         document={selectedDocument} 
//         open={!!selectedDocument} 
//         onClose={() => setSelectedDocument(null)} 
//       />
//     </div>
//   );
// }

// interface DocumentPreviewDialogProps {
//   document: DocumentType | null;
//   open: boolean;
//   onClose: () => void;
// }

// function DocumentPreviewDialog({ document, open, onClose }: DocumentPreviewDialogProps) {
//   const [currentPage, setCurrentPage] = useState(1);
  
//   if (!document) return null;

//   return (
//     <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>{document.title}</DialogTitle>
//         </DialogHeader>
//         <div className="py-4">
//           <div className="bg-gray-100 rounded-md overflow-hidden">
//             <Image 
//               src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ia_bucket/${document.id}/${currentPage}.png`}
//               alt={`Page ${currentPage} of ${document.title}`}
//               width={800}
//               height={1200}
//               className="mx-auto object-contain"
//             />
//           </div>
//           <div className="flex justify-between mt-4">
//             <Button 
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               variant="outline"
//             >
//               Previous Page
//             </Button>
//             <span className="self-center">Page {currentPage}</span>
//             <Button 
//               onClick={() => setCurrentPage(p => p + 1)}
//               variant="outline"
//             >
//               Next Page
//             </Button>
//           </div>
//           <div className="mt-6 flex justify-center">
//             <Button asChild>
//               <Link href={`/new_ocr_job/${document.id}`}>
//                 Evaluate OCR Models
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { Suspense } from 'react';
// import { createClient } from "@/utils/supabase/server";
import { IconLoader2, } from "@tabler/icons-react";

import { DataTable } from "@/components/documents/data-table";
import { DocumentsHeader } from '@/components/documents/document-header';
import { DocumentsEmptyState } from '@/components/documents/document-empty-state';
import { columns } from "@/components/documents/columns";

export default function DocumentsPage() {
  const { data: documents, error } = useGetAllDocumentsQuery();
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