import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingLottieProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const LoadingLottie: React.FC<LoadingLottieProps> = ({ 
  width = 100, 
  height = 100,
  className = ''
}) => {
  return (
    <div style={{ width, height }} className={className}>
      <DotLottieReact
        src="https://lottie.host/422a9bd8-3be0-4820-8d96-3c0a6f8115c3/6BPycbyWDt.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default LoadingLottie;
