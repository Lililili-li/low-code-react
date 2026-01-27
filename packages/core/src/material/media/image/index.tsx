import { FC } from 'react';
import { ImagePropsSchema } from './schema';

const Image: FC<ImagePropsSchema> = ({ props, style, state, className }) => {
  const { option, dataType, variable } = props;
  const transformParts = [
    `rotateX(${style?.rotateX ?? 0}deg)`,
    `rotateY(${style?.rotateY ?? 0}deg)`,
    `rotateZ(${style?.rotateZ ?? 0}deg)`,
    `skewX(${style?.skewX ?? 0}deg)`,
    `skewY(${style?.skewY ?? 0}deg)`,
    `scale(${style?.scale ?? 1})`,
  ];

  return (
    <div
      style={{
        width: style?.width,
        height: style?.height,
        transform: transformParts.join(' '),
        position: 'relative',
        animationTimingFunction: 'linear',
        animationDuration: option?.duration + 's',
        animationName: option?.open ? option?.animationName : 'none',
        animationIterationCount: option?.time === '-1' ? 'infinite' : option?.time,
      }}
      className={`${className ? className : ''}`}
    >
      <img
        src={option?.url}
        alt=""
        style={{ width: '100%', height: '100%' }}
        className={`object-${option?.fitCover}`}
      />
    </div>
  );
};

export default Image;
