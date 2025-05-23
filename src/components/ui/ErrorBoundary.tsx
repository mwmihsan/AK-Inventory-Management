import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {error}
        </p>
        {onRetry && (
          <Button 
            variant="primary" 
            icon={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;