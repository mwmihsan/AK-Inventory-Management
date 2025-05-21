import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          {icon && <div className="mr-3">{icon}</div>}
          {title && <h3 className="font-medium text-gray-800">{title}</h3>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;