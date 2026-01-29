import materialCmp, { MaterialType } from '@repo/core/material';
import { handleAnimationStyle, handleAnimationClass } from '@repo/core/compiler/animation';
import { ComponentSchema } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignStateStore, useDesignStore } from '@/store';
import { getVariableValue } from '@repo/core/variable';
import { useDesignDatasourceStore } from '@/store/design/datasource';

const eventsMap: Record<string, any> = {};
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

  const shouldVisible = (item: ComponentSchema) => {
    if (item.visibleProp?.type === 'normal') {
      return item.visibleProp?.value;
    } else {
      const visibleValue = getVariableValue(item.visibleProp?.value as string, state);
      return visibleValue;
    }
  };

  return components.map((item) => {
    if (item.group) {
      return (
        shouldVisible(item) && (
          <div
            className="canvas-render-container"
            key={item.id}
            data-cmp-id={item.id}
            style={{
              ...item.style,
            }}
            onMouseEnter={() => {
              setHoverId(item.id);
            }}
            onMouseLeave={() => {
              setHoverId('');
            }}
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
        )
      );
    }

    const Component = materialCmp[item.type as MaterialType].component;
    const animationClass = handleAnimationClass(item.animation);
    return (
      shouldVisible(item) && (
        <div
          className={`${animationClass} canvas-render-container`}
          key={item.id}
          data-cmp-id={item.id}
          style={{
            ...item.style,
            ...handleAnimationStyle(item.animation),
          }}
          onMouseEnter={() => {
            setHoverId(item.id);
          }}
          onMouseLeave={() => {
            setHoverId('');
          }}
        >
          <div className='cmp-container'  {...eventsMap}>
            <Component
              {...(item as any)}
              state={state}
              onStateChange={(value) => {
                setState(value);
              }}
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
      )
    );
  });
};

export default RenderCmp;
