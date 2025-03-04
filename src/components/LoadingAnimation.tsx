// components/LoadingAnimation.tsx
import React from 'react';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-b-4 border-blue-200 opacity-30"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading tryout details...</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;