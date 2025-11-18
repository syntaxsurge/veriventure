import { notFound, redirect } from "next/navigation";
import {
  ShieldCheck,
  Globe,
  AtSign,
  Info,
  CheckCircle2,
  ExternalLink,
  Award,
  FileText,
  Calendar,
  Hash,
  Link2,
  User,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrustPanel } from "@/features/verify/trust-panel";
import { fetchPublicProfile } from "@/lib/server/profile-store";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { getAddress, isAddress } from "viem";

type VerifyPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function VerifyHandlePage({ params }: VerifyPageProps) {
  const { handle } = await params;
  if (!handle) {
    notFound();
  }

  const normalizedHandle = handle.trim();
  const slug = normalizedHandle.toLowerCase();

  try {
    const candidateAddresses = new Set<string>();
    candidateAddresses.add(normalizedHandle);
    if (isAddress(normalizedHandle)) {
      const checksummed = getAddress(normalizedHandle);
      candidateAddresses.add(checksummed);
    }

    const handleRecord = await fetchQuery(api.handles.getHandleByHandle, {
      handle: slug,
    });

    if (!handleRecord) {
      let ownerHandle = null;
      for (const ownerAddress of candidateAddresses) {
        ownerHandle = await fetchQuery(api.handles.getHandleByAddress, {
          ownerAddress,
        });
        if (ownerHandle) {
          break;
        }
      }

      if (ownerHandle && ownerHandle.handle !== slug) {
        redirect(`/verify/${ownerHandle.handle}`);
      }
    }
  } catch (error) {
    console.error("Failed to resolve handle redirect", error);
  }

  const profile = await fetchPublicProfile(normalizedHandle);
  if (!profile.address && profile.achievements.length === 0) {
    notFound();
  }

  const resolvedHandle = profile.handle || normalizedHandle;
  const hasData = profile.achievements.length > 0 || profile.notes.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-app section-spacing animate-in py-16">
        {/* Modern Header Section */}
        <div className="mb-12 text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-full border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Verified Trust Profile</span>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {profile.display || "Anonymous Profile"}
            </h1>

            {resolvedHandle && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                <AtSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {resolvedHandle}
                </span>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {profile.achievements.length} Achievement{profile.achievements.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {profile.notes.length} Community Note{profile.notes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio Card */}
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="h-1 bg-linear-to-r from-primary via-purple-500 to-blue-500" />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio ? (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">About</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No bio provided
                  </p>
                )}

                {profile.website && (
                  <div className="pt-3">
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-200"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {profile.address && (
                  <div className="pt-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">
                      Wallet Address
                    </p>
                    <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded break-all">
                      {profile.address}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Alert className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-slate-700 dark:text-slate-300">
                <strong className="font-semibold">Privacy Protected</strong>
                <br />
                Only verified proofs are public. All data is anchored on the OriginTrail DKG and Polkadot networks.
              </AlertDescription>
            </Alert>
          </div>

          {/* Trust Panel - Right Column */}
          <div className="lg:col-span-2">
            {hasData ? (
              <TrustPanel profile={profile} />
            ) : (
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Info className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No Verified Data Yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      This profile hasn't published any achievements or community notes yet.
                      Check back later for updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-12 text-center">
          <Card className="border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Verification Gateway
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                This is a procurement-friendly verification page with cryptographic proofs.
                All achievements are permanently recorded on-chain and can be independently verified
                through the blockchain explorer links provided above.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}