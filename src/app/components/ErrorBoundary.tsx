import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            Что-то пошло не так
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Попробуйте обновить страницу
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            На главную
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
