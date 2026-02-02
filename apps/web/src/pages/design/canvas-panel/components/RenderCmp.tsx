import materialCmp, { MaterialType } from '@repo/core/material';
import { handleAnimationStyle, handleAnimationClass } from '@repo/core/compiler/animation';
import { ComponentSchema } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignStateStore, useDesignStore } from '@/store';
import { getVariableValue } from '@repo/core/variable';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import { memo } from 'react';

const eventsMap: Record<string, any> = {};

const shouldVisible = (item: ComponentSchema, state: any) => {
  if (item.visibleProp?.type === 'normal') {
    return item.visibleProp?.value;
  } else {
    const visibleValue = getVariableValue(item.visibleProp?.value as string, state);
    return visibleValue;
  }
};

interface SingleComponentProps {
  item: ComponentSchema;
  currentCmpId: string;
  selectedCmpIds: string[];
  hoverId: string;
  state: any;
  datasource: any;
  mutually: boolean;
  setHoverId: (id: string) => void;
  setState: (value: any) => void;
}

const SingleComponent = memo(({ 
  item, 
  currentCmpId, 
  selectedCmpIds, 
  hoverId, 
  state, 
  datasource, 
  mutually,
  setHoverId,
  setState 
}: SingleComponentProps) => {
  if (!shouldVisible(item, state)) return null;

  if (item.group) {
    return (
      <div
        className="canvas-render-container"
        key={item.id}
        data-cmp-id={item.id}
        style={{
          ...item.style,
          position: 'absolute',
        }}
        onMouseEnter={() => setHoverId(item.id)}
        onMouseLeave={() => setHoverId('')}
      >
        {item.children && (
          <>
            {item.children.map((child) => {
              const ChildComponent = materialCmp[child.type as MaterialType].component;
              const animationClass = handleAnimationClass(child.animation);
              return (
                <div
                  style={{
                    ...child.style,
                    position: 'absolute',
                    ...handleAnimationStyle(child.animation),
                  }}
                  className={animationClass}
                  key={child.id}
                >
                  <ChildComponent {...(child as any)} state={state} />
                </div>
              );
            })}
          </>
        )}
        <div
          className={`cmp-mask ${(currentCmpId === item.id || selectedCmpIds.includes(item.id)) && !item.lock ? 'cmp-mask-active' : ''} ${hoverId === item.id ? 'cmp-mask-hover' : ''}`}
          id={`cmp-mask-id-${item.id}`}
          data-lock={item.lock}
          style={{
            left: 0,
            top: 0,
            width: item.style?.width,
            height: item.style?.height,
          }}
        />
      </div>
    );
  }

  const Component = materialCmp[item.type as MaterialType].component;
  const animationClass = handleAnimationClass(item.animation);
  
  return (
    <div
      className={`${animationClass} canvas-render-container`}
      key={item.id}
      data-cmp-id={item.id}
      style={{
        ...item.style,
        ...handleAnimationStyle(item.animation),
        position: 'absolute'
      }}
      onMouseEnter={() => setHoverId(item.id)}
      onMouseLeave={() => setHoverId('')}
    >
      <div className="cmp-container h-full" {...eventsMap}>
        <Component
          {...(item as any)}
          state={state}
          onStateChange={setState}
          datasource={datasource}
        />
      </div>
      {!mutually && (
        <div
          className={`cmp-mask ${(currentCmpId === item.id || selectedCmpIds.includes(item.id)) && !item.lock ? 'cmp-mask-active' : ''} ${hoverId === item.id ? 'cmp-mask-hover' : ''}`}
          id={`cmp-mask-id-${item.id}`}
          data-lock={item.lock}
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {currentCmpId === item.id && selectedCmpIds.length === 1 && !item.lock && (
            <>
              <div className="l-t-move move-corner scale" id="left-top-corner"></div>
              <div className="r-t-move move-corner scale" id="right-top-corner"></div>
              <div className="r-b-move move-corner scale" id="right-bottom-corner"></div>
              <div className="l-b-move move-corner scale" id="left-bottom-corner"></div>
              <div className="t-move move-rect scale" id="top-rect"></div>
              <div className="b-move move-rect scale" id="bottom-rect"></div>
              <div className="l-move move-rect scale" id="left-rect"></div>
              <div className="r-move move-rect scale" id="right-rect"></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 只在真正影响渲染的 props 变化时才重新渲染
  const isCurrentOrSelected = 
    prevProps.currentCmpId === prevProps.item.id || 
    prevProps.selectedCmpIds.includes(prevProps.item.id) ||
    nextProps.currentCmpId === nextProps.item.id || 
    nextProps.selectedCmpIds.includes(nextProps.item.id);
  
  const isHovered = 
    prevProps.hoverId === prevProps.item.id || 
    nextProps.hoverId === nextProps.item.id;

  // 如果组件被选中、hover 或者是当前组件，需要更新
  if (isCurrentOrSelected || isHovered) {
    return (
      prevProps.item === nextProps.item &&
      prevProps.currentCmpId === nextProps.currentCmpId &&
      prevProps.hoverId === nextProps.hoverId &&
      prevProps.selectedCmpIds === nextProps.selectedCmpIds
    );
  }

  // 其他组件只在自身数据变化时更新
  return prevProps.item === nextProps.item;
});

SingleComponent.displayName = 'SingleComponent';

const RenderCmp = () => {
  const components = useDesignComponentsStore((state) => state.components);
  const setHoverId = useDesignComponentsStore((state) => state.setHoverId);
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);
  const hoverId = useDesignComponentsStore((state) => state.hoverId);
  const state = useDesignStateStore((state) => state.state);
  const setState = useDesignStateStore((state) => state.setState);
  const datasource = useDesignDatasourceStore((state) => state.datasource);
  const mutually = useDesignStore((state) => state.panelConfig.mutually);

  return components.map((item) => (
    <SingleComponent
      key={item.id}
      item={item}
      currentCmpId={currentCmpId}
      selectedCmpIds={selectedCmpIds}
      hoverId={hoverId}
      state={state}
      datasource={datasource}
      mutually={mutually}
      setHoverId={setHoverId}
      setState={setState}
    />
  ));
};

export default RenderCmp;
