import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches rendering exceptions in Studio stages (e.g., Preview Deck, Stem Mixer, Exports)
 * preventing unexpected layout/data mismatches from crashing the entire application page.
 */
export class StudioErrorBoundary extends Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  constructor(props: StudioErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Accompaniment Studio stage render error caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-[2px] border border-amber-600/40 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-950/20 md:p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                {this.props.fallbackTitle ?? "Studio stage display notice"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A non-fatal display error occurred while rendering this studio panel.
                Your generated audio files, MIDI stems, and project analyses remain intact on the backend.
              </p>
              {this.state.error?.message && (
                <p className="font-mono text-[11px] text-muted-foreground/90 bg-background/80 p-2 rounded-[2px] border border-border">
                  {this.state.error.message}
                </p>
              )}
              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={this.handleReset}
                  className="gap-1.5"
                >
                  <RefreshCw className="size-3.5" aria-hidden />
                  Reload panel
                </Button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
