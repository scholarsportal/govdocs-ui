import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { SectionCards } from '@/components/section-cards'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from "@/components/data-table"

import data from "./data.json"

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data : user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect('/login')
  }

  return <>
  {/* <p>Hello {user.user.email}</p> */}
  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
  </>
}