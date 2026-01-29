import { CSSProperties, FC, useEffect, useState } from 'react';
import { TimeTextPropsSchema } from './schema';
import dayjs from 'dayjs';

const validateJsonFormat = (jsonString: string | undefined) => {
  if (!jsonString) return;
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const TimeText: FC<TimeTextPropsSchema> = ({ props, style, className }) => {
  const { option } = props;
  const transformParts = [
    `rotateX(${style?.rotateX ?? 0}deg)`,
    `rotateY(${style?.rotateY ?? 0}deg)`,
    `rotateZ(${style?.rotateZ ?? 0}deg)`,
    `skewX(${style?.skewX ?? 0}deg)`,
    `skewY(${style?.skewY ?? 0}deg)`,
    `scale(${style?.scale ?? 1})`,
  ];
  const styles = {
    fontSize: option?.font.fontSize,
    color: option?.font.color,
    fontWeight: option?.font.fontWeight,
  } as CSSProperties;
  
  const [currentTime, setCurrentTime] = useState(dayjs().format(option?.format));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format(option?.format));
    }, 1000);
    return () => clearInterval(timer);
  }, [option?.format]);

  return (
    <div
      style={{
        width: style?.width,
        height: style?.height,
        transform: transformParts.join(' '),
        ...styles,
      }}
      className={className}
    >
      {currentTime}
    </div>
  );
};

export default TimeText;
