import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Optimized skeleton loader for better performance
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
);

// Optimized loading overlay
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  children: React.ReactNode;
  text?: string;
}> = ({ isLoading, children, text = 'Cargando...' }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-muted rounded w-full mb-1"></div>
      <div className="h-3 bg-muted rounded w-2/3"></div>
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-muted rounded w-full mb-1"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
} 