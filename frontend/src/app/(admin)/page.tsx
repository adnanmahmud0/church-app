import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { WrenchIcon } from "lucide-react"

import data from "./data.json"

export default function Page() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col blur-md pointer-events-none select-none opacity-50">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-background text-foreground p-8 rounded-2xl shadow-xl border border-border flex flex-col items-center gap-4 max-w-sm mx-auto text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <WrenchIcon className="size-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Under Development</h2>
              <p className="text-muted-foreground text-sm">
                This module is currently being built. Please check back soon for updates!
              </p>
            </div>
          </div>
        </div>
  )
}
