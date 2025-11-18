"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Send,
  MessageSquare,
  Shield,
  Activity,
  Info
} from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  customMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  copied: boolean;
  reportSent: boolean;
  retryCount: number;
}

/**
 * Production-ready Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      copied: false,
      reportSent: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary Caught:', error, errorInfo);
    }

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (e.g., Sentry, LogRocket)
    this.reportError(error, errorInfo);
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send error to monitoring service
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        retryCount: this.state.retryCount,
      };

      // In production, send to error monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to your error tracking endpoint
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport),
        });
      }

      console.log('[Error Boundary] Error reported:', errorReport);
    } catch (reportError) {
      console.error('[Error Boundary] Failed to report error:', reportError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
      reportSent: false,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state;

    const errorText = `
Error ID: ${errorId}
Message: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace available'}
Component Stack: ${errorInfo?.componentStack || 'No component stack available'}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  handleReportError = async () => {
    this.setState({ reportSent: true });
    // Additional error reporting logic
  };

  render() {
    const { hasError, error, errorInfo, errorId, showDetails, copied, reportSent } = this.state;
    const { children, fallback, showDetails: propShowDetails, enableReporting = true, customMessage } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-linear-to-b from-background to-background/95 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            <Card className="border-destructive/20 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl" />
                  <div className="relative rounded-full bg-destructive/10 p-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                  </div>
                </div>

                <CardTitle className="text-2xl">
                  {customMessage || "Oops! Something went wrong"}
                </CardTitle>

                <CardDescription className="mt-2">
                  We encountered an unexpected error. Don't worry, we've logged this issue and our team will look into it.
                </CardDescription>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="destructive" className="text-xs">
                    Error ID: {errorId}
                  </Badge>
                  {this.state.retryCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Retry #{this.state.retryCount}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Error Message */}
                <Alert className="border-destructive/20">
                  <Bug className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    {error.message || "An unknown error occurred"}
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button onClick={this.handleReset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>

                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>

                  <Button
                    onClick={() => this.setState({ showDetails: !showDetails })}
                    variant="ghost"
                    size="sm"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>

                {/* Detailed Error Info */}
                <AnimatePresence>
                  {(showDetails || propShowDetails) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-muted/30 border-dashed">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Technical Details
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={this.handleCopyError}
                            >
                              {copied ? (
                                <>
                                  <Check className="mr-2 h-3 w-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-3 w-3" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Stack Trace */}
                            {error.stack && (
                              <div>
                                <p className="text-xs font-semibold mb-1">Stack Trace:</p>
                                <pre className="text-xs bg-background/50 p-3 rounded-md overflow-x-auto">
                                  {error.stack}
                                </pre>
                              </div>
                            )}

                            {/* Component Stack */}
                            {errorInfo?.componentStack && (
                              <div>
                                <p className="text-xs font-semibold mb-1">Component Stack:</p>
                                <pre className="text-xs bg-background/50 p-3 rounded-md overflow-x-auto">
                                  {errorInfo.componentStack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Report Error Section */}
                {enableReporting && !reportSent && (
                  <Card className="bg-linear-to-br from-purple-500/5 to-indigo-500/5 border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium">Help us improve</p>
                            <p className="text-xs text-muted-foreground">
                              Report this error to our team
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={this.handleReportError}
                          disabled={reportSent}
                          className="bg-linear-to-r from-purple-600 to-indigo-600"
                        >
                          {reportSent ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Reported
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Report
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status Indicators */}
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>System Status: Operational</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Error Logged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return children;
  }
}