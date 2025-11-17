"use client";

import { OnboardingChecklist } from "./onboarding-checklist";
import { QuickStartChecklist } from "./quick-start-checklist";

export function DashboardClient() {
  return (
    <>
      <div className="mb-8">
        <QuickStartChecklist />
      </div>
      {/* Keep the old checklist for backwards compatibility, but it will likely not show */}
      <div className="mb-8">
        <OnboardingChecklist />
      </div>
    </>
  );
}
