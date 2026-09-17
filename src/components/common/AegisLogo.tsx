import React from 'react';

interface AegisLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
  subtitle?: string;
}

export const AegisLogo: React.FC<AegisLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
  subtitle
}) => {
  const dimensions = {
    xs: { icon: 'w-6 h-6', text: 'text-xs', sub: 'text-[8px]', box: 'w-6 h-6' },
    sm: { icon: 'w-8 h-8', text: 'text-sm', sub: 'text-[9px]', box: 'w-8 h-8' },
    md: { icon: 'w-10 h-10', text: 'text-base', sub: 'text-[10px]', box: 'w-10 h-10' },
    lg: { icon: 'w-14 h-14', text: 'text-xl', sub: 'text-xs', box: 'w-14 h-14' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm', box: 'w-20 h-20' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech Holographic Aegis Cyber Shield Emblem */}
      <div className={`relative ${dimensions.box} shrink-0 group`}>
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-subtle" />

        {/* Outer Shield Frame */}
        <div className="relative w-full h-full bg-[#060912] border border-cyan-400/60 rounded-2xl p-1.5 flex items-center justify-center shadow-xl shadow-cyan-950 overflow-hidden group-hover:border-cyan-300 transition-colors">
          
          {/* SVG Vector 3D Aegis Shield Icon */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transform transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="aegisGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="aegisGradCore" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hexagonal Outer Cyber Shield Boundary */}
            <polygon
              points="50,6 90,26 90,70 50,94 10,70 10,26"
              fill="url(#aegisGradPrimary)"
              fillOpacity="0.12"
              stroke="url(#aegisGradPrimary)"
              strokeWidth="4"
              strokeLinejoin="round"
              filter="url(#neonGlow)"
            />

            {/* Inner Concentric Cyber Grid Lines */}
            <polygon
              points="50,18 80,33 80,65 50,82 20,65 20,33"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />

            {/* Central Aegis 3D Node Core */}
            <path
              d="M50 28 L70 40 L70 60 L50 72 L30 60 L30 40 Z"
              fill="url(#aegisGradCore)"
              stroke="#60a5fa"
              strokeWidth="2"
            />

            {/* Crosshair Threat Radar Targets */}
            <circle cx="50" cy="50" r="10" fill="#04060b" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="#22d3ee" className={animated ? "animate-ping" : ""} />

            {/* Radar Scan Lines */}
            <line x1="50" y1="6" x2="50" y2="94" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Cyber Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`${dimensions.text} font-black tracking-tight text-white flex items-center gap-1 font-sans`}>
              <span className="text-cyan-400 font-black">THREAT</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 font-black">
                CATCHER
              </span>
            </span>

            <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/50 shadow-sm">
              AEGIS 3D
            </span>
          </div>

          <p className={`${dimensions.sub} font-mono text-slate-400 leading-none mt-0.5 tracking-wide`}>
            {subtitle || 'Continuous Cyber Risk Intelligence'}
          </p>
        </div>
      )}
    </div>
  );
};
