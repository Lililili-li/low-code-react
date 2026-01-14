import { CSSProperties, FC } from 'react';
import { TextPropsSchema } from './schema';
import { getVariableValue } from '../../../../variable';
import CountUp from 'react-countup';
import bgIcon from '../assets/text-1.png';

const Text: FC<TextPropsSchema> = ({ props, style, state }) => {
  const { option, dataType, variable } = props;
  const transformParts = [
    `rotateX(${style?.rotateX ?? 0}deg)`,
    `rotateY(${style?.rotateY ?? 0}deg)`,
    `rotateZ(${style?.rotateZ ?? 0}deg)`,
    `skewX(${style?.skewX ?? 0}deg)`,
    `skewY(${style?.skewY ?? 0}deg)`,
    `scale(${style?.scale ?? 1})`,
  ];
  const titleStyles = {
    fontSize: option?.titleFont.fontSize,
    color: option?.titleFont.color,
    fontWeight: option?.titleFont.fontWeight,
    fontFamily: option?.titleFont.fontFamily,
    lineHeight: option?.titleFont.lineHeight,
  } as CSSProperties;
  const textStyles = {
    fontSize: option?.textFont.fontSize,
    color: option?.textFont.color,
    fontWeight: option?.textFont.fontWeight,
  } as CSSProperties;
   const unitStyles = {
    fontSize: option?.unit.fontSize,
    color: option?.unit.color,
    fontWeight: option?.unit.fontWeight,
  } as CSSProperties;
  const getValue = () => {
    if (dataType === '1') {
      return Number(option?.text) || 0;
    } else {
      const variableValue = getVariableValue(variable!, state);
      if (!variableValue || typeof variableValue === 'object') return 0;
      return Number(variableValue) || 0;
    }
  };
  return (
    <div
      style={{
        width: style?.width,
        height: style?.height,
        transform: transformParts.join(' '),
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '9%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          ...textStyles,
          display: 'flex',
          alignItems: 'end',
          lineHeight: 1,
          gap: 4
        }}
      >
        <CountUp
          start={0}
          end={getValue()}
          decimals={Number(option?.textFont.decimals)}
          separator={option?.textFont.isMonyFormat ? ',' : ''}
        />
        <span style={{lineHeight: 1, ...unitStyles}}>
          {option?.unit.content}
        </span>
      </div>
      <div
        className="title"
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          ...titleStyles,
        }}
      >
        {option?.title}
      </div>
      <img
        src={bgIcon}
        alt=""
        style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
      />
    </div>
  );
};

export default Text;
