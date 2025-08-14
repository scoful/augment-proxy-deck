import { Component, type ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">出现错误</h3>
          </div>
          <p className="mb-4 text-red-700">
            抱歉，页面加载时出现了错误。请刷新页面重试。
          </p>
          {this.state.error && (
            <details className="text-sm text-red-600">
              <summary className="cursor-pointer">错误详情</summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
