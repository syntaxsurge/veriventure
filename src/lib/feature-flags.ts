/**
 * Feature Flags
 * Control which features are enabled/disabled in the application
 */

export const featureFlags = {
  /** Enable/disable Notes feature (off by default to reduce noise) */
  enableNotes: process.env.NEXT_PUBLIC_ENABLE_NOTES === "true",

  /** Enable/disable Documents feature */
  enableDocuments: process.env.NEXT_PUBLIC_ENABLE_DOCUMENTS !== "false", // default: true

  /** Enable/disable Credentials feature */
  enableCredentials: process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS !== "false", // default: true
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
