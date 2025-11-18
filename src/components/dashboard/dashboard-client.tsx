"use client";

import { OnboardingChecklist } from "./onboarding-checklist";
import { QuickStartChecklist } from "./quick-start-checklist";

export function DashboardClient() {
  return (
    <div className="flex flex-col gap-6">
      <QuickStartChecklist />
      {/* Keep the old checklist around for wallets that still rely on it */}
      <OnboardingChecklist />
    </div>
  );
}
