import React from 'react';
import balalaLogo from '../assets/images/logo_balala_opt.webp';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', imgClassName = 'w-full h-full object-cover', ...props }) => {
  return (
    <div 
      className={`rounded-2xl overflow-hidden bg-[#FAF8F3] border border-[#D7B463]/35 shadow-sm transition-colors duration-200 ${className}`} 
      {...props}
    >
      <img 
        src={balalaLogo} 
        alt="Balla AR Logo" 
        className={imgClassName} 
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
