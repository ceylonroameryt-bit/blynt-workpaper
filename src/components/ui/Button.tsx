import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Guidelines: Buttons are at least 44px high with 10px radius.
  // Visible focus ring: 2px #1E4FD8 with 2px offset.
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2';

  const sizeStyles = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-[10px] gap-1.5',
    md: 'min-h-[44px] px-4 py-2.5 text-sm rounded-[10px] gap-2',
    lg: 'min-h-[48px] px-5 py-3 text-base rounded-[10px] gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#1E4FD8] text-white hover:bg-[#163BA3] border border-[#1E4FD8] active:bg-[#122e80]',
    secondary:
      'bg-[#E8EEFD] text-[#1E4FD8] hover:bg-[#d8e4fb] border border-transparent font-semibold',
    outline:
      'bg-white text-[#1B2430] border border-[#D5D9E0] hover:bg-[#F4F5F7]',
    ghost:
      'bg-transparent text-[#5B6676] hover:text-[#1B2430] hover:bg-[#E8EBF0] border border-transparent',
    danger:
      'bg-[#FFF1DC] text-[#9A4A00] border border-[#E3E6EB] hover:bg-[#ffe5c2]',
    ai:
      'bg-[#F3F0FE] text-[#3F2A9E] border border-[#DDD6FA] hover:bg-[#eae3fc] font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
