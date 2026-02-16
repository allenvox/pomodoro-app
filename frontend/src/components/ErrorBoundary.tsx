/** Catches React errors and shows a fallback UI instead of a blank screen. */
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary"
          role="alert"
        >
          <h2 className="error-boundary__title">Что-то пошло не так</h2>
          <p className="error-boundary__text">
            Произошла ошибка. Обновите страницу или попробуйте позже.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
