"use client";

import { OnboardingChecklist } from "./onboarding-checklist";
import { FirstRunTour } from "../onboarding/first-run-tour";
import { QuickStartChecklist } from "./quick-start-checklist";
import { FirstRunOnboardingTour } from "../onboarding/first-run-onboarding-tour";

export function DashboardClient() {
  return (
    <>
      <FirstRunOnboardingTour />
      <div className="mb-8">
        <QuickStartChecklist />
      </div>
      {/* Keep the old checklist for backwards compatibility, but it will likely not show */}
      <div className="mb-8">
        <OnboardingChecklist />
      </div>
      {/* Keep the old tour for backwards compatibility */}
      <FirstRunTour />
    </>
  );
}
