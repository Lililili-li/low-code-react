import { FC, useEffect, useRef, useState, useCallback } from 'react';
import { PageRouterPropsSchema } from './schema';
import { materialCmp, MaterialType } from '../index';
import { DatasourceSchema, ComponentSchema } from '../../types';
import { handleEventActions } from '../../event';
import { Empty } from '@repo/ui/components/empty';
import { handleAnimationClass, handleAnimationStyle } from '../../compiler/animation';

const GroupComponent = ({
  data,
  state,
  onStateChange,
  datasource,
}: {
  data: ComponentSchema;
  state: Record<string, any>;
  onStateChange: (state: Record<string, any>) => void;
  datasource: DatasourceSchema[];
}) => {
  return (
    <div className={`cmp-group-container ${data.className}`}>
      {data.children &&
        data.children?.length! > 0 &&
        data.children?.map((item) => {
          return (
            <div
              key={item.id}
              style={{
                ...item.style,
                position: 'absolute',
                ...handleAnimationStyle(item.animation || {}),
              }}
              className={`${handleAnimationClass(item.animation || {})} canvas-render-container ${item.className}`}
            >
              <SingleComponent
                data={item}
                state={state}
                onStateChange={onStateChange}
                datasource={datasource}
              />
            </div>
          );
        })}
    </div>
  );
};

const SingleComponent = ({
  data,
  state,
  onStateChange,
  datasource,
}: {
  data: ComponentSchema;
  state: Record<string, any>;
  onStateChange: (state: Record<string, any>) => void;
  datasource: DatasourceSchema[];
}) => {
  const Component = materialCmp[data.type as MaterialType]?.component;
  if (!Component) return null;
  const eventsMap = useRef<Record<string, any>>({});

  data.events?.forEach((event) => {
    if (!['mounted', 'unmounted'].includes(event.type)) {
      eventsMap.current[event.type] = (e: any) => {
        handleEventActions(
          {
            actions: event.actions,
            state: state,
            datasource: datasource,
            onStateChange: onStateChange,
          },
          e,
        );
      };
    }
  });
  return (
    <div className={`cmp-single-container h-full`} {...eventsMap.current}>
      <Component
        {...(data as any)}
        state={state}
        onStateChange={onStateChange}
        datasource={datasource}
      />
    </div>
  );
};

// 为动态组件创建独立的状态管理
const DynamicComponentContainer: FC<{
  components: ComponentSchema[];
  datasource: DatasourceSchema[];
  initialState?: Record<string, any>;
}> = ({ components, datasource, initialState = {} }) => {
  // 独立的状态管理
  const [componentState, setComponentState] = useState<Record<string, any>>(initialState);
  // 独立的数据源管理
  const [componentDatasource, setComponentDatasource] = useState<DatasourceSchema[]>(datasource);

  // 递归渲染组件
  const renderComponents = useCallback(
    (components: ComponentSchema[]) => {
      return components?.map((item) => {
        return (
          <div
            key={item.id}
            style={{
              ...item.style,
              position: 'absolute',
            }}
            className={`${handleAnimationClass(item.animation || {})} canvas-render-container`}
          >
            {item.group ? (
              <GroupComponent
                data={item}
                state={componentState}
                onStateChange={setComponentState}
                datasource={componentDatasource}
              />
            ) : (
              <SingleComponent
                data={item}
                state={componentState}
                onStateChange={setComponentState}
                datasource={componentDatasource}
              />
            )}
          </div>
        );
      });
    },
    [componentState, componentDatasource],
  );

  return <>{renderComponents(components)}</>;
};

const PageRouter: FC<
  PageRouterPropsSchema & {
    onStateChange: (state: any) => void;
    datasource: DatasourceSchema[];
    state: Record<string, any>;
  }
> = ({ props, style, state, className, datasource, events, onStateChange }) => {
  const { pageSchema } = props;

  const datasourceRef = useRef(datasource);
  const stateRef = useRef(state);
  const onMountedActions = useRef(events?.find((item: any) => item.type === 'mounted')?.actions);
  const onUnmountedActions = useRef(
    events?.find((item: any) => item.type === 'unmounted')?.actions,
  );

  const onMountedEvent = events?.find((item: any) => item.type === 'mounted');
  const onUnmountedEvent = events?.find((item: any) => item.type === 'unmounted');

  useEffect(() => {
    if (onMountedEvent) {
      handleEventActions({
        actions: onMountedActions.current,
        state: stateRef.current,
        datasource: datasourceRef.current,
        onStateChange,
      });
    }
    return () => {
      if (onUnmountedEvent) {
        handleEventActions({
          actions: onUnmountedActions.current,
          state: stateRef.current,
          datasource: datasourceRef.current,
          onStateChange,
        });
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

  return (
    <div
      style={{
        width: style?.width,
        height: style?.height,
        transform: transformParts.join(' '),
        position: 'relative',
        overflow: 'hidden',
      }}
      className={className}
    >
      <style>
        {(() => {
          try {
            if (!pageSchema?.globalCss || typeof pageSchema?.globalCss !== 'string')
              return '/* No global CSS */';
            if (pageSchema?.globalCss.trim() === '') return '/* Empty global CSS */';
            // Basic CSS validation - check for balanced braces
            const openBraces = (pageSchema?.globalCss.match(/{/g) || []).length;
            const closeBraces = (pageSchema?.globalCss.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
              console.warn('Global CSS has unbalanced braces, using fallback');
              return '/* Invalid global CSS - unbalanced braces */';
            }
            return pageSchema?.globalCss;
          } catch (error) {
            console.error('Error processing global CSS:', error);
            return '/* Error processing global CSS */';
          }
        })()}
      </style>
      {pageSchema?.components && pageSchema.components.length > 0 ? (
        <div className="w-full h-full">
          <DynamicComponentContainer
            components={pageSchema.components}
            datasource={pageSchema.datasource} // 动态组件使用独立的数据源
            initialState={pageSchema.state} // 动态组件使用独立的初始状态
          />
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default PageRouter;
