import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated trash can */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Trash can body */}
          <div className="w-full h-full bg-gradient-to-b from-trash-yellow to-yellow-600 rounded-lg border-4 border-green-800 relative overflow-hidden">
            {/* Trash can lid */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-trash-yellow rounded-full border-2 border-green-800"></div>
            
            {/* Animated trash inside */}
            <div className="absolute inset-2 bg-green-800 rounded overflow-hidden">
              <div className="w-full h-full relative">
                {/* Floating trash items */}
                <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="absolute bottom-2 left-3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          {/* Spinning effect */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-trash-yellow rounded-lg animate-spin`}></div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <p className={`${textSizes[size]} text-trash-yellow font-bold mb-2`}>
          {text}
        </p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-trash-yellow rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-trash-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-trash-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
