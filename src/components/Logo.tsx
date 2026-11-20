import React from 'react';
import balalaLogo from '../assets/images/logo_balala_1780571379441.png';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', imgClassName = 'w-full h-full object-cover', ...props }) => {
  return (
    <div 
      className={`rounded-2xl overflow-hidden bg-[#FAF8F3]/85 backdrop-blur-md border border-[#D7B463]/35 shadow-sm transition-all duration-200 ${className}`} 
      {...props}
    >
      <img 
        src={balalaLogo} 
        alt="Balla AR Logo" 
        className={imgClassName} 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
