/**
 * React Error Boundary component
 * Catches React errors and displays a fallback UI
 */

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
	/** Fallback UI to render when an error occurs */
	fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console for debugging
		console.error('React Error Boundary caught an error:', error, errorInfo);
	}

	resetError = () => {
		this.setState({
			hasError: false,
			error: null,
		});
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// Custom fallback UI if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.resetError);
			}

			// Default fallback UI
			return (
				<div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
					<div className="card w-full max-w-2xl bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-error">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								Something went wrong
							</h2>

							<p className="text-base-content/70">
								The application encountered an unexpected error. This is likely a bug in the application.
							</p>

							<div className="alert alert-warning mt-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 shrink-0 stroke-current"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<div className="flex-1">
									<p className="text-sm font-medium">{this.state.error.message}</p>
								</div>
							</div>

							<details className="mt-4">
								<summary className="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
									Technical Details
								</summary>
								<pre className="mt-2 max-h-60 overflow-auto rounded bg-base-200 p-4 text-xs">
									{this.state.error.stack || this.state.error.toString()}
								</pre>
							</details>

							<div className="card-actions justify-end mt-6">
								<button
									className="btn btn-outline"
									onClick={() => window.location.reload()}
								>
									Reload Page
								</button>
								<button
									className="btn btn-primary"
									onClick={this.resetError}
								>
									Try Again
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
