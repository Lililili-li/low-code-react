import { CSSProperties, FC, useEffect, useRef } from 'react';
import { TextPropsSchema } from './schema';
import { getVariableValue } from '../../../../variable';
import CountUp from 'react-countup';
import bgIcon from '../assets/text-1.png';
import { ActionSchema, DatasourceSchema, EventSchema } from '../../../../types';
import {
  parseChangeVariableAction,
  parseFetchApiAction,
  parseNavToLinkAction,
  parseNavToPageAction,
} from '../../../../event';

const Text: FC<
  TextPropsSchema & {
    onStateChange: (state: any) => void;
    datasource: DatasourceSchema[];
    state: Record<string, any>;
  }
> = ({ props, style, state, className, datasource, events, onStateChange }) => {
  const { option, dataType, variable } = props;

  const datasourceRef = useRef(datasource);
  const stateRef = useRef(state);
  const onMountedActions = useRef(events?.find((item) => item.type === 'mounted')?.actions);
  const onUnmountedActions = useRef(events?.find((item) => item.type === 'unmounted')?.actions);

  const onMountedEvent = events?.find((item) => item.type === 'mounted');
  const onUnmountedEvent = events?.find((item) => item.type === 'unmounted');

  const handleEventActions = (actions?: EventSchema['actions'], e?: any) => {
    actions?.forEach((action) => {
      if (action.type === 'changeVariable') {
        const changeVariableFunc = parseChangeVariableAction(
          action.value as ActionSchema['changeVariable'],
        );
        const copyState = { ...stateRef.current };
        changeVariableFunc?.(e, copyState);
        onStateChange?.(copyState);
      }
      if (action.type === 'navToPage') {
        parseNavToPageAction(action.value as ActionSchema['navToPage']);
      }
      if (action.type === 'navToLink') {
        parseNavToLinkAction(action.value as ActionSchema['navToLink']);
      }
      if (action.type === 'fetchAPI') {
        parseFetchApiAction(
          action.value as ActionSchema['fetchAPI'],
          stateRef.current,
          datasourceRef.current,
          onStateChange,
        );
      }
    });
  };

  useEffect(() => {
    if (onMountedEvent) {
      handleEventActions(onMountedActions.current);
    }
    return () => {
      if (onUnmountedEvent) {
        handleEventActions(onUnmountedActions.current);
      }
    };
  }, [onMountedEvent, onUnmountedEvent]);

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
      className={className}
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
          gap: 4,
        }}
      >
        <CountUp
          start={0}
          end={getValue()}
          decimals={Number(option?.textFont.decimals)}
          separator={option?.textFont.isMonyFormat ? ',' : ''}
        />
        <span style={{ lineHeight: 1, ...unitStyles }}>{option?.unit.content}</span>
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
