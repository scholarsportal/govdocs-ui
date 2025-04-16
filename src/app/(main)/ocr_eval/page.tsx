'use client'
import { DataTable, OCRJobsDataTable } from "@/components/data-table"
import { useGetAllOcrJobsQuery } from "@/state-management/ocr_jobs/ocr"

export default function OCREvalPage() {
  const { data: ocrJobs, isLoading, error } = useGetAllOcrJobsQuery();
  console.log("ocrJobs", ocrJobs)
  if (error) {
    return <div>Error loading OCR jobs</div>
  }

  if(isLoading) {
    return <div>Loading...</div>}


  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <OCRJobsDataTable data={ocrJobs!} />
      </div>
    </div>
  )

}