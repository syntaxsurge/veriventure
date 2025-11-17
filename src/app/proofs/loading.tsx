import { AppShellClient } from "@/components/layout/app-shell.client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProofsLoading() {
  return (
    <AppShellClient sidebar maxWidth="7xl">
      <div className="section-spacing animate-in space-y-8">
        {/* Page Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          {/* Proof Cards Skeleton */}
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <div className="border-t bg-muted/20 p-4">
                  <Skeleton className="h-9 w-40" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShellClient>
  );
}
