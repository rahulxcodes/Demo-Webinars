import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
  className?: string;
}

export function IconButton({ 
  icon, 
  label, 
  onClick, 
  isActive = false,
  variant = 'default',
  disabled = false,
  className = ''
}: IconButtonProps) {
  const baseClasses = `
    w-12 h-12 rounded-full border-none cursor-pointer
    flex items-center justify-center
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
  `;
  
  const variantClasses = {
    default: isActive 
      ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' 
      : 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500',
    primary: isActive 
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
      : 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:transform-none' 
    : 'hover:scale-105';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
    </button>
  );
}