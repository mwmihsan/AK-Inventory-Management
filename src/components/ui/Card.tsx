import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="flex items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          {icon && <div className="mr-2 sm:mr-3 flex-shrink-0">{icon}</div>}
          {title && (
            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
};

export default Card;