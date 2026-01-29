import { FC, useCallback, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartPropsSchema } from './schema';
import {
  parseChangeVariableAction,
  parseFetchApiAction,
  parseNavToLinkAction,
  parseNavToPageAction,
} from '../../../event';
import { ActionSchema, DatasourceSchema } from '@/types';
import { getVariableValue } from '../../../variable';

const Line: FC<
  ChartPropsSchema & {
    onStateChange: (state: any) => void;
    datasource: DatasourceSchema[];
    state: Record<string, any>;
  }
> = ({ props, style, state, events, onStateChange, datasource }) => {
  const transformParts = [
    `rotateX(${style?.rotateX ?? 0}deg)`,
    `rotateY(${style?.rotateY ?? 0}deg)`,
    `rotateZ(${style?.rotateZ ?? 0}deg)`,
    `skewX(${style?.skewX ?? 0}deg)`,
    `skewY(${style?.skewY ?? 0}deg)`,
    `scale(${style?.scale ?? 1})`,
  ];
  const eventsMap: Record<string, any> = useRef({});
  const datasourceRef = useRef(datasource);
  const stateRef = useRef(state);
  const eventActions = useRef(events?.find((item) => item.type === 'chartClick')?.actions);

  useEffect(() => {
    datasourceRef.current = datasource;
    stateRef.current = state;
    eventActions.current = events?.find((item) => item.type === 'chartClick')?.actions;
  }, [datasource, state, events]);
  const chartClickEvent = events?.find((item) => item.type === 'chartClick');

  if (chartClickEvent) {
    eventsMap.current['click'] = useCallback(
      (e: any) => {
        eventActions.current?.forEach((action) => {
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
      },
      [eventActions, onStateChange, stateRef, datasourceRef],
    );
  }

  const newProps = { ...props };
  const newOption = { ...newProps.option };
  if (newProps.dataType === '2' && newProps.data) {
    newOption!.dataset = {
      ...newOption.dataset,
      source: getVariableValue(newProps.data!, state),
    };
  }

  return (
    <ReactECharts
      option={newOption}
      style={{ width: style?.width, height: style?.height, transform: transformParts.join(' ') }}
      onEvents={eventsMap.current}
    />
  );
};

export default Line;
