import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface CheckedLottieProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const CheckedLottie: React.FC<CheckedLottieProps> = ({ 
  width = 100, 
  height = 100,
  className = ''
}) => {
  return (
    <div style={{ width, height }} className={className}>
      <DotLottieReact
        src="https://lottie.host/04fb8a77-31bb-4493-b5e1-77d452937b9c/FIjmJOKkKx.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default CheckedLottie;
