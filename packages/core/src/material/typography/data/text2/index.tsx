import { CSSProperties, FC } from 'react';
import { TextPropsSchema } from './schema';
import { getVariableValue } from '../../../../variable';

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
  const ellipsisStyle: CSSProperties = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };
  const styles = {
    fontSize: option?.font.fontSize,
    color: option?.font.color,
    fontWeight: option?.font.fontWeight,
    fontFamily: option?.font.fontFamily,
    lineHeight: option?.font.lineHeight,
    opacity: option?.font.opacity,
    textAlign: option?.font.textAlign,
    ...(option?.isEllipsis ? ellipsisStyle : {}),
  } as CSSProperties;
  const getValue = () => {
    if (dataType === '1') {
      return option?.text;
    } else {
      const variableValue = getVariableValue(variable!, state);
      if (!variableValue || typeof variableValue === 'object' ) return '';
      return variableValue || '';
    }
  };
  return (
    <div
      style={{
        width: style?.width,
        height: style?.height,
        transform: transformParts.join(' '),
        ...styles,
      }}
    >
      {getValue()}
    </div>
  );
};

export default Text;
