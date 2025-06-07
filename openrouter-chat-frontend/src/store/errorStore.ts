import { create } from 'zustand';

export interface AppError {
  id: string;
  message: string;
  title?: string;
  details?: string;
  timestamp: number;
}

interface ErrorState {
  errors: AppError[];
  maxErrors: number;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasError: () => boolean;
  getLastError: () => AppError | null;
}

const MAX_ERRORS = 5; // Maximum number of errors to show at once
const DUPLICATE_THRESHOLD = 5000; // 5 seconds to consider errors as duplicates

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],
  maxErrors: MAX_ERRORS,
  
  addError: (errorData) => {
    const currentErrors = get().errors;
    const now = Date.now();
    
    // Check for duplicate errors within threshold
    const isDuplicate = currentErrors.some(existingError => 
      existingError.message === errorData.message &&
      (now - existingError.timestamp) < DUPLICATE_THRESHOLD
    );
    
    if (isDuplicate) {
      // Return the existing error ID instead of creating a new one
      const existingError = currentErrors.find(e => 
        e.message === errorData.message
      );
      return existingError?.id || '';
    }
    
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const error: AppError = {
      ...errorData,
      id,
      timestamp: now,
    };
    
    set((state) => {
      let newErrors = [...state.errors, error];
      
      // Remove oldest errors if we exceed the limit
      if (newErrors.length > MAX_ERRORS) {
        newErrors = newErrors.slice(-MAX_ERRORS);
      }
      
      return { errors: newErrors };
    });
    
    // Auto-remove after 5 seconds (fixed duration)
    setTimeout(() => {
      get().removeError(id);
    }, 5000);
    
    return id;
  },
  
  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter(error => error.id !== id)
    }));
  },
  
  clearErrors: () => {
    set({ errors: [] });
  },
  
  hasError: () => {
    const errors = get().errors;
    return errors.length > 0;
  },
  
  getLastError: () => {
    const errors = get().errors;
    return errors.length > 0 ? errors[errors.length - 1] : null;
  },
}));
