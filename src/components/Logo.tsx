import React from 'react';
import balalaLogo from '../assets/images/logo_balala_1780571379441.png';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', imgClassName = 'w-full h-full object-cover', ...props }) => {
  return (
    <div 
      className={`rounded-xl overflow-hidden bg-slate-100 border border-teal-500/10 shadow-sm transition-all duration-300 ${className}`} 
      {...props}
    >
      <img 
        src={balalaLogo} 
        alt="Balala AR Logo" 
        className={imgClassName} 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
