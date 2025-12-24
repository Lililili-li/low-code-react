import { useDesignStore } from '@/store/modules/design';
import materialCmp, { MaterialType } from '@repo/core/material';

const RenderCmp = () => {
  const pageSchema = useDesignStore((state) => state.pageSchema);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);

  return pageSchema.components.map((item) => {
    const Component = materialCmp[item.type as MaterialType].component;
    return (
      item.visible && (
        <div 
          className="canvas-render-container" 
          key={item.id} 
          data-cmp-id={item.id}
          style={{...item.style}}
        >
          <Component {...item as any}/>
          <div
            className="cmp-mask"
            id={`cmp-mask-id-${item.id}`}
            style={{
              ...item.style,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              border: currentCmpId === item.id ? '1px solid #274be3' : 'none',
            }}
          >
            {currentCmpId === item.id && (
              <>
                <div className="l-t-move move-corner scale" id='left-top-corner'></div>
                <div className="r-t-move move-corner scale" id='right-top-corner'></div>
                <div className="r-b-move move-corner scale" id='right-bottom-corner'></div>
                <div className="l-b-move move-corner scale" id='left-bottom-corner'></div>
                <div className="t-move move-rect scale" id='top-rect'></div>
                <div className="b-move move-rect scale" id='bottom-rect'></div>
                <div className="l-move move-rect scale" id='left-rect'></div>
                <div className="r-move move-rect scale" id='right-rect'></div>
              </>
            )}
          </div>
        </div>
      )
    );
  });
};

export default RenderCmp;
