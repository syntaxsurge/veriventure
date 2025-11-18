"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  RefreshCw,
  TrendingUp,
  Zap,
  Shield,
  AlertTriangle,
  BarChart,
  HelpCircle
} from "lucide-react";

interface RateLimitStatus {
  tier: string;
  limit: number;
  remaining: number;
  reset: string;
  resetIn: number;
  blocked: boolean;
  percentage: number;
  formatted: string;
  tierConfig: {
    name: string;
    requestsPerMinute: number;
    blockDurationSeconds: number;
  };
  endpoints: Array<{
    endpoint: string;
    limit: number;
    duration: number;
  }>;
}

export function RateLimitDashboard() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRateLimitStatus = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/rate-limit', {
        headers: {
          'x-include-rate-limit-info': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate limit status');
      }

      const data = await response.json();
      setStatus(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRateLimitStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusColor = () => {
    if (status.blocked) return 'destructive';
    if (status.percentage < 20) return 'destructive';
    if (status.percentage < 50) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (status.blocked) return <AlertTriangle className="h-4 w-4" />;
    if (status.percentage < 20) return <AlertCircle className="h-4 w-4" />;
    if (status.percentage < 50) return <Info className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getTierBadgeVariant = () => {
    switch (status.tier) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      case 'starter': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Rate Limits</h2>
          <p className="text-muted-foreground">Monitor your API usage and rate limit status</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRateLimitStatus}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Alert */}
      {status.blocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rate Limit Exceeded</AlertTitle>
          <AlertDescription>
            Your API access is temporarily blocked. Please wait {status.resetIn} seconds before making new requests.
          </AlertDescription>
        </Alert>
      )}

      {status.percentage < 20 && !status.blocked && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Rate Limit Warning</AlertTitle>
          <AlertDescription>
            You have used {100 - status.percentage}% of your rate limit. Consider upgrading your plan for more requests.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={getTierBadgeVariant()} className="capitalize">
                  {status.tier}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {status.tierConfig.requestsPerMinute} req/min
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Block duration: {status.tierConfig.blockDurationSeconds}s
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-2xl font-bold">
                  {status.remaining}/{status.limit}
                </span>
              </div>
              <Progress
                value={status.percentage}
                className="mt-2"
                // @ts-ignore - custom color prop
                indicatorColor={`bg-${getStatusColor()}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {status.percentage}% remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reset Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status.resetIn}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Resets at {new Date(status.reset).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Endpoint Limits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Endpoint Limits
          </CardTitle>
          <CardDescription>
            Rate limits for specific API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status.endpoints.map((endpoint) => (
                <TableRow key={endpoint.endpoint}>
                  <TableCell className="font-mono text-sm">
                    {endpoint.endpoint}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{endpoint.limit}</Badge>
                  </TableCell>
                  <TableCell>{endpoint.duration}s</TableCell>
                  <TableCell>
                    {(endpoint.limit / endpoint.duration * 60).toFixed(1)} req/min
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-linear-to-br from-purple-500/5 to-indigo-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Rate Limit Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Batch Operations</p>
                <p className="text-xs text-muted-foreground">
                  Combine multiple operations in a single request when possible
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <BarChart className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Implement Caching</p>
                <p className="text-xs text-muted-foreground">
                  Cache responses to reduce unnecessary API calls
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Use Webhooks</p>
                <p className="text-xs text-muted-foreground">
                  Subscribe to webhooks instead of polling for updates
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {(status.tier === 'anonymous' || status.tier === 'free') && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold">Need More API Requests?</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to a higher plan for increased rate limits and priority support
              </p>
            </div>
            <Button className="bg-linear-to-r from-purple-600 to-indigo-600">
              Upgrade Plan
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}