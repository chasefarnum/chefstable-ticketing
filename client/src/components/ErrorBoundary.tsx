import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background text-foreground">
          <div className="flex flex-col w-full max-w-2xl gap-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-destructive">
              <i className="bx bx-error-circle mr-1" />
              System error · unrecoverable
            </span>

            <h2 className="font-sans text-3xl font-light tracking-tight">
              An unexpected error occurred.
            </h2>

            <p className="font-serif text-base leading-relaxed text-muted-foreground">
              The application hit a condition it could not recover from. The stack trace below is for diagnostic purposes.
            </p>

            <pre className="p-4 w-full bg-muted text-muted-foreground text-xs font-mono overflow-auto whitespace-break-spaces ring-1 ring-foreground/10">
              {this.state.error?.stack}
            </pre>

            <button
              onClick={() => window.location.reload()}
              className="self-start inline-flex items-center gap-2 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest bg-accent text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 transition-opacity"
            >
              <i className="bx bx-refresh" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
