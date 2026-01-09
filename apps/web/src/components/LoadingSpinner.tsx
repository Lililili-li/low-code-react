/**
 * 全屏加载动画
 */

import React from 'react';

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}> = ({ size = 'md', fullScreen = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'p-4'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 主旋转环 */}
        <div className={`relative ${sizeClasses[size]}`}>
          {/* 外环 - 渐变旋转 */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent 
              bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 
              animate-spin`}
            style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '2px',
            }}
          />
          {/* 内环 - 反向旋转 */}
          <div
            className={`absolute inset-2 rounded-full border-2 border-transparent 
              bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600
              animate-[spin_1s_linear_infinite_reverse]`}
            style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '2px',
            }}
          />
          {/* 中心脉冲点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`${dotSizeClasses[size]} rounded-full bg-linear-to-r from-blue-500 to-purple-500 
                animate-pulse`}
            />
          </div>
        </div>

        {/* 跳动的点 */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${dotSizeClasses[size]} rounded-full bg-linear-to-r from-blue-500 to-purple-500`}
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
