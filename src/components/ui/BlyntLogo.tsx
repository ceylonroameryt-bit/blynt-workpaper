import React from 'react';

interface BlyntLogoProps {
  variant?: 'full' | 'mark' | 'text';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  className?: string;
}

export const BlyntMark: React.FC<{ size?: number; className?: string; theme?: 'dark' | 'light' }> = ({
  size = 28,
  className = '',
  theme = 'dark',
}) => {
  // Exact geometry from the original Blynt logo canvas:
  // Top coral shape: straight left, flat bottom, rounded top-right arc
  // Bottom shape: straight left, rounded top-right, rounded bottom arc
  const bottomColor = theme === 'dark' ? '#FFFFFF' : '#102654';

  return (
    <svg
      width={size * (54 / 78)}
      height={size}
      viewBox="0 0 54 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Blynt logo mark"
    >
      {/* Top Coral Lobe */}
      <path
        d="M 0 0 L 17 0 C 27 0 35 8 35 17 C 35 26 27 34 17 34 L 0 34 Z"
        fill="#FF7D6B"
      />
      {/* Bottom Bowl */}
      <path
        d="M 0 38 L 27 38 C 42 38 54 47 54 58 C 54 69 42 78 27 78 L 9 78 C 4 78 0 74 0 69 Z"
        fill={bottomColor}
      />
    </svg>
  );
};

export const BlyntLogo: React.FC<BlyntLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  className = '',
}) => {
  const markHeight = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#102654]';
  const pillBg = theme === 'dark' ? 'bg-[#16284F]' : 'bg-[#EAF5FC]';
  const pillText = theme === 'dark' ? 'text-white' : 'text-[#1D4E89]';

  if (variant === 'mark') {
    return <BlyntMark size={markHeight} theme={theme} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original 'b' mark */}
      <BlyntMark size={markHeight} theme={theme} />

      {/* 'blynt' Wordmark */}
      <span className={`font-extrabold text-2xl tracking-tight ${textColor} font-sans leading-none`}>
        blynt
      </span>

      {/* 'WORKPAPERS' Pill Badge matching Page 17 */}
      {variant === 'full' && (
        <span
          className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full ${pillBg} ${pillText} uppercase`}
        >
          WORKPAPERS
        </span>
      )}
    </div>
  );
};

export default BlyntLogo;
