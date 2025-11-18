import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in space-y-8">
        {/* Page Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Quick Start + Invoice Widgets */}
        <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card className="border-2">
            <CardHeader className="pb-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full md:col-span-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Latest Badge Skeleton */}
        <Card className="overflow-hidden border-2">
          <div className="h-2 bg-linear-to-r from-primary/50 via-primary/30 to-primary/20" />
          <CardHeader>
            <Skeleton className="h-5 w-16 mb-3" />
            <Skeleton className="h-7 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>

        {/* Activity Timeline Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-10 w-full mt-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
