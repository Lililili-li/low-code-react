import { FC } from 'react';
import { VideoPropsSchema } from './schema';

const Video: FC<VideoPropsSchema> = ({ props, style, className }) => {
  const { option } = props;
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
      }}
      className={`${className ? className : ''}`}
    >
      <video
        src={option?.url}
        style={{ width: '100%', height: '100%' }}
        className={`object-${option?.fitCover}`}
        autoPlay={option?.autoPlay}
        loop={option?.loop}
        muted={option?.muted}
        controls={option?.controls}
        playsInline
      />
    </div>
  );
};

export default Video;
