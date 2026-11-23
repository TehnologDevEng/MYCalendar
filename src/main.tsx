import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Неизвестная ошибка интерфейса',
    };
  }

  handleReset = () => {
    try {
      window.localStorage.clear();
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black text-[#F7F8F8]">
          <div className="max-w-sm w-full bg-[#0E0E0F] border border-[#222226] rounded-2xl p-6 space-y-4">
            <h1 className="text-lg font-bold">Не удалось загрузить календарь</h1>
            <p className="text-sm text-[#8A8F98]">{this.state.message}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full h-11 rounded-xl bg-[#00BCC5] text-black text-sm font-semibold cursor-pointer"
            >
              Сбросить данные и перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
