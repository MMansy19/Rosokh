'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';

// Enhanced Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority?: 'low' | 'medium' | 'high';
  timestamp?: number;
  component?: React.ComponentType;
  metadata?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
  stage?: string;
  cancellable?: boolean;
  onCancel?: () => void;
}

export interface ErrorState {
  error: string | null;
  errorType?: 'network' | 'server' | 'validation' | 'auth' | 'general';
  errorCode?: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
}

export interface GlobalState {
  loading: LoadingState;
  notifications: Notification[];
  error: ErrorState;
  locale: string;
  messages: any;
  performance: {
    lastUpdate: number;
    renderCount: number;
    optimizationEnabled: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  connectivity: {
    isOnline: boolean;
    connectionType?: string;
    effectiveType?: string;
  };
}

// Enhanced Actions
type GlobalAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'UPDATE_LOADING_PROGRESS'; payload: { progress?: number; stage?: string } }
  | { type: 'CLEAR_LOADING' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_ERROR'; payload: ErrorState }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INCREMENT_RETRY'; payload: string }
  | { type: 'SET_LOCALE_DATA'; payload: { locale: string; messages: any } }
  | { type: 'UPDATE_ACCESSIBILITY'; payload: Partial<GlobalState['accessibility']> }
  | { type: 'UPDATE_CONNECTIVITY'; payload: Partial<GlobalState['connectivity']> }
  | { type: 'TOGGLE_OPTIMIZATION'; payload: boolean }
  | { type: 'INCREMENT_RENDER_COUNT' };

// Enhanced Initial state
const initialState: GlobalState = {
  loading: {
    isLoading: false,
    message: '',
    progress: undefined,
    stage: undefined,
    cancellable: false,
  },
  notifications: [],
  error: {
    error: null,
    errorType: undefined,
    errorCode: undefined,
    retryCount: 0,
    maxRetries: 3,
  },
  locale: 'en',
  messages: {},
  performance: {
    lastUpdate: Date.now(),
    renderCount: 0,
    optimizationEnabled: true,
  },  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 'medium',
  },
  connectivity: {
    isOnline: typeof window !== 'undefined' ? navigator?.onLine ?? true : true,
  },
};

// Enhanced Reducer with performance optimizations
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  // Performance optimization: Early return for no-op actions
  if (state.performance.optimizationEnabled) {
    switch (action.type) {
      case 'SET_LOADING':
        if (state.loading.isLoading === action.payload.isLoading && 
            state.loading.message === action.payload.message) {
          return state;
        }
        break;
      case 'UPDATE_CONNECTIVITY':
        if (state.connectivity.isOnline === action.payload.isOnline) {
          return state;
        }
        break;
    }
  }

  const newState = (() => {
    switch (action.type) {
      case 'SET_LOADING':
        return {
          ...state,
          loading: {
            ...state.loading,
            ...action.payload,
          },
        };
      
      case 'UPDATE_LOADING_PROGRESS':
        return {
          ...state,
          loading: {
            ...state.loading,
            ...action.payload,
          },
        };
      
      case 'CLEAR_LOADING':
        return {
          ...state,
          loading: {
            isLoading: false,
            message: '',
            progress: undefined,
            stage: undefined,
            cancellable: false,
          },
        };
      
      case 'ADD_NOTIFICATION':
        const notification = {
          ...action.payload,
          timestamp: Date.now(),
          priority: action.payload.priority || 'medium',
        };
        return {
          ...state,
          notifications: [...state.notifications, notification]
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return (priorityOrder[b.priority!] - priorityOrder[a.priority!]) || 
                     (b.timestamp! - a.timestamp!);
            })
            .slice(0, 10), // Limit to 10 notifications for performance
        };
      
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.filter(n => n.id !== action.payload),
        };
      
      case 'UPDATE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.map(n =>
            n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
          ),
        };
      
      case 'CLEAR_ALL_NOTIFICATIONS':
        return {
          ...state,
          notifications: [],
        };
      
      case 'SET_ERROR':
        return {
          ...state,
          error: {
            ...state.error,
            ...action.payload,
          },
        };
      
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: {
            error: null,
            errorType: undefined,
            errorCode: undefined,
            retryCount: 0,
            maxRetries: 3,
          },
        };
      
      case 'INCREMENT_RETRY':
        return {
          ...state,
          error: {
            ...state.error,
            retryCount: (state.error.retryCount || 0) + 1,
          },
        };
      
      case 'SET_LOCALE_DATA':
        return {
          ...state,
          locale: action.payload.locale,
          messages: action.payload.messages,
        };
      
      case 'UPDATE_ACCESSIBILITY':
        return {
          ...state,
          accessibility: {
            ...state.accessibility,
            ...action.payload,
          },
        };
      
      case 'UPDATE_CONNECTIVITY':
        return {
          ...state,
          connectivity: {
            ...state.connectivity,
            ...action.payload,
          },
        };
      
      case 'TOGGLE_OPTIMIZATION':
        return {
          ...state,
          performance: {
            ...state.performance,
            optimizationEnabled: action.payload,
          },
        };
      
      case 'INCREMENT_RENDER_COUNT':
        return {
          ...state,
          performance: {
            ...state.performance,
            renderCount: state.performance.renderCount + 1,
            lastUpdate: Date.now(),
          },
        };
      
      default:
        return state;
    }
  })();

  // Performance tracking
  if (state.performance.optimizationEnabled && newState !== state) {
    newState.performance.renderCount++;
    newState.performance.lastUpdate = Date.now();
  }

  return newState;
}

// Enhanced Context with performance optimizations
const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
} | null>(null);

// Enhanced Provider with connectivity and accessibility detection
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Performance optimization: Memoize context value
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  // Connectivity monitoring - Client-side only
  React.useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const updateOnlineStatus = () => {
      dispatch({
        type: 'UPDATE_CONNECTIVITY',
        payload: { isOnline: navigator.onLine },
      });
    };

    const updateConnection = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        dispatch({
          type: 'UPDATE_CONNECTIVITY',
          payload: {
            connectionType: connection.type,
            effectiveType: connection.effectiveType,
          },
        });
      }
    };

    // Initial connectivity check
    updateOnlineStatus();
    updateConnection();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Accessibility monitoring - Client-side only
  React.useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updateAccessibility = () => {
      dispatch({
        type: 'UPDATE_ACCESSIBILITY',
        payload: {
          reducedMotion: mediaQueries.reducedMotion.matches,
          highContrast: mediaQueries.highContrast.matches,
          screenReader: 'speechSynthesis' in window,
        },
      });
    };

    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateAccessibility);
    });

    updateAccessibility();

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateAccessibility);
      });
    };
  }, []);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

// Enhanced Hook
export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}

// Enhanced Loading Hook with progress support
export function useGlobalLoading() {
  const { state, dispatch } = useGlobal();
  
  const setLoading = useCallback((isLoading: boolean, message?: string, options?: {
    progress?: number;
    stage?: string;
    cancellable?: boolean;
    onCancel?: () => void;
  }) => {
    dispatch({
      type: 'SET_LOADING',
      payload: {
        isLoading,
        message: message || '',
        ...options,
      },
    });
  }, [dispatch]);

  const updateProgress = useCallback((progress?: number, stage?: string) => {
    dispatch({
      type: 'UPDATE_LOADING_PROGRESS',
      payload: { progress, stage },
    });
  }, [dispatch]);

  const clearLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_LOADING' });
  }, [dispatch]);
  
  return {
    ...state.loading,
    setLoading,
    updateProgress,
    clearLoading,
  };
}

// Enhanced Notifications Hook with priority and metadata support
export function useNotifications() {
  const { state, dispatch } = useGlobal();
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const enhancedNotification: Notification = {
      ...notification,
      id,
      priority: notification.priority || 'medium',
      timestamp: Date.now(),
    };
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: enhancedNotification,
    });
    
    // Auto remove after duration (except for errors which stay until manually dismissed)
    if (notification.duration !== 0 && notification.type !== 'error') {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, duration);
    }
    
    return id;
  }, [dispatch]);
  
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION',
      payload: { id, updates },
    });
  }, [dispatch]);
  
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, [dispatch]);

  // Helper methods for common notification types
  const notify = useMemo(() => ({
    success: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'error', title, message, duration: 0, priority: 'high', ...options }),
    warning: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'warning', title, message, priority: 'medium', ...options }),
    info: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'info', title, message, ...options }),
  }), [addNotification]);
  
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
    notify,
  };
}

// Enhanced Error Hook with retry logic
export function useGlobalError() {
  const { state, dispatch } = useGlobal();
  
  const setError = useCallback((
    error: string | null, 
    options?: {
      type?: ErrorState['errorType'];
      code?: string;
      onRetry?: () => void;
      maxRetries?: number;
    }
  ) => {
    dispatch({
      type: 'SET_ERROR',
      payload: {
        error,
        errorType: options?.type,
        errorCode: options?.code,
        onRetry: options?.onRetry,
        maxRetries: options?.maxRetries || 3,
        retryCount: 0,
      },
    });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const incrementRetry = useCallback((errorId?: string) => {
    dispatch({ type: 'INCREMENT_RETRY', payload: errorId || '' });
  }, [dispatch]);
  const canRetry = useMemo(() => {
    return (state.error.retryCount || 0) < (state.error.maxRetries || 3) && !!state.error.onRetry;
  }, [state.error.retryCount, state.error.maxRetries, state.error.onRetry]);
  
  return {
    ...state.error,
    setError,
    clearError,
    incrementRetry,
    canRetry,
  };
}

// Accessibility Hook
export function useAccessibility() {
  const { state, dispatch } = useGlobal();

  const updateAccessibility = useCallback((updates: Partial<GlobalState['accessibility']>) => {
    dispatch({
      type: 'UPDATE_ACCESSIBILITY',
      payload: updates,
    });
  }, [dispatch]);

  return {
    ...state.accessibility,
    updateAccessibility,
  };
}

// Connectivity Hook
export function useConnectivity() {
  const { state } = useGlobal();
  return state.connectivity;
}

// Performance Hook
export function usePerformance() {
  const { state, dispatch } = useGlobal();

  const toggleOptimization = useCallback((enabled: boolean) => {
    dispatch({
      type: 'TOGGLE_OPTIMIZATION',
      payload: enabled,
    });
  }, [dispatch]);

  return {
    ...state.performance,
    toggleOptimization,
  };
}
