import { useDesignStore } from '@/store/modules/design';
import materialCmp, { MaterialType } from '@repo/core/material';
import { handleAnimationStyle, handleAnimationClass } from '@repo/core/compiler/animation';

const RenderCmp = () => {
  const pageSchema = useDesignStore((state) => state.pageSchema);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const selectedCmpIds = useDesignStore((state) => state.selectedCmpIds);

  return pageSchema.components.map((item) => {
    if (item.group) {
      return (
        item.visible && (
          <div
            className="canvas-render-container"
            key={item.id}
            data-cmp-id={item.id}
            style={{
              ...item.style,
            }}
          >
            {item.children && (
              <>
                {item.children.map((child) => {
                  const ChildComponent = materialCmp[child.type as MaterialType].component;
                  const animationClass = handleAnimationClass(child.animation);
                  return (
                    <div
                      style={{ ...child.style, position: 'absolute', ...handleAnimationStyle(child.animation) }}
                      className={animationClass}
                      key={child.id}
                    >
                      <ChildComponent {...(child as any)} />
                    </div>
                  );
                })}
              </>
            )}
            <div
              className={`cmp-mask ${(currentCmpId === item.id || selectedCmpIds.includes(item.id)) && !item.lock ? 'cmp-mask-active' : ''}`}
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
      item.visible && (
        <div
          className={`${animationClass} canvas-render-container`}
          key={item.id}
          data-cmp-id={item.id}
          style={{
            ...item.style,
            ...handleAnimationStyle(item.animation),
          }}
        >
          <Component {...(item as any)} />
          <div
            className={`cmp-mask ${(currentCmpId === item.id || selectedCmpIds.includes(item.id)) && !item.lock ? 'cmp-mask-active' : ''}`}
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
        </div>
      )
    );
  });
};

export default RenderCmp;
