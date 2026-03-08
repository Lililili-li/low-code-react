import { MaterialType, DynamicComponentLoader } from '@repo/core/material';
import { handleAnimationStyle, handleAnimationClass } from '@repo/core/compiler/animation';
import { ComponentSchema, DataType } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignStateStore } from '@/store';
import { getVariableValue } from '@repo/core/variable';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import { useRef, useMemo, memo, useCallback, useEffect, useState } from 'react';
import { handleEventActions } from '@repo/core/event';
import { useRequest } from 'ahooks';
import pageApi from '@/api/page';
import { PageRouterPropsSchema } from '@repo/core/material/dynamic-component/schema';

const shouldVisible = (item: ComponentSchema, state: any) => {
  if (item.visibleProp?.type === 'normal') {
    return item.visibleProp?.value;
  }
  const visibleValue = getVariableValue(item.visibleProp?.value as string, state);
  return visibleValue;
};

interface EditorMaskProps {
  item: ComponentSchema;
  currentCmpId: string;
  selectedCmpIds: string[];
  hoverId: string;
}

const EditorMask = memo(function EditorMask({
  item,
  currentCmpId,
  selectedCmpIds,
  hoverId,
}: EditorMaskProps) {
  const isSelected = currentCmpId === item.id || selectedCmpIds.includes(item.id);
  const isHovered = hoverId === item.id;
  const showResizeHandles = currentCmpId === item.id && selectedCmpIds.length === 1 && !item.lock;

  return (
    <div
      className={`cmp-mask ${isSelected && !item.lock ? 'cmp-mask-active' : ''} ${isHovered ? 'cmp-mask-hover' : ''}`}
      id={`cmp-mask-id-${item.id}`}
      data-lock={item.lock}
      style={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {showResizeHandles && (
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
  );
});

EditorMask.displayName = 'EditorMask';

interface ComponentRendererProps {
  item: ComponentSchema;
  state: Record<string, any>;
  setState: (state: Record<string, any>) => void;
  datasource: any[];
}

const ComponentRenderer = memo(function ComponentRenderer({
  item,
  state,
  setState,
  datasource,
}: ComponentRendererProps) {
  const stateRef = useRef(state);
  const datasourceRef = useRef(datasource);

  stateRef.current = state;
  datasourceRef.current = datasource;

  const eventHandlers = useMemo(() => {
    const handlers: Record<string, any> = {};
    item.events?.forEach((event) => {
      if (!['mounted', 'unmounted'].includes(event.type)) {
        handlers[event.type] = (e: any) => {
          handleEventActions(
            {
              actions: event.actions,
              state: stateRef.current,
              datasource: datasourceRef.current,
              onStateChange: setState,
            },
            e,
          );
        };
      }
    });
    return handlers;
  }, [item.events, setState]);

  const [componentSchema, setComponentSchema] = useState(item);
  const isDynamic = item.type === 'page-router';
  const { run: getPageById } = useRequest((id: string) => pageApi.getPageById(id), {
    manual: true,
    onSuccess: (data) => {
      setComponentSchema({
        ...componentSchema,
        props: { ...componentSchema.props, pageSchema: data.schema },
      });
    },
  });

  useEffect(() => {
    setComponentSchema(item)
    if (isDynamic) {
      let pageId = undefined;
      if ((item as PageRouterPropsSchema).props?.dataType === DataType.Normal) {
        pageId = (item as PageRouterPropsSchema).props?.pageId;
      } else {
        pageId = getVariableValue((item as PageRouterPropsSchema).props?.pageId, state);
      }
      getPageById(pageId as string);
    }
  }, [item, state]);
  return (
    <div className="cmp-container h-full" {...eventHandlers}>
      <DynamicComponentLoader
        type={componentSchema.type as MaterialType}
        enableLazy={true}
        {...(componentSchema as any)}
        state={state}
        onStateChange={setState}
        datasource={datasource}
      />
    </div>
  );
});

interface SingleComponentProps {
  item: ComponentSchema;
  currentCmpId: string;
  selectedCmpIds: string[];
  hoverId: string;
  preview?: boolean;
  setHoverId: (id: string) => void;
}

const SingleComponent = memo(function SingleComponent({
  item,
  currentCmpId,
  selectedCmpIds,
  hoverId,
  setHoverId,
  preview,
}: SingleComponentProps) {
  
  const state = useDesignStateStore((state) => state.state);
  const setState = useDesignStateStore((state) => state.setState);
  const datasource = useDesignDatasourceStore((state) => state.datasource);

  const handleMouseEnter = useCallback(() => setHoverId(item.id), [item.id, setHoverId]);
  const handleMouseLeave = useCallback(() => setHoverId(''), [setHoverId]);

  if (!shouldVisible(item, state)) return null;

  if (item.group) {
    const eventHandlers = useMemo(() => {
      const handlers: Record<string, any> = {};
      item.events?.forEach((event) => {
        if (!['mounted', 'unmounted'].includes(event.type)) {
          handlers[event.type] = (e: any) => {
            handleEventActions(
              {
                actions: event.actions,
                state: state,
                datasource: datasource,
                onStateChange: setState,
              },
              e,
            );
          };
        }
      });
      return handlers;
    }, [item.events, setState]);
    return (
      <div
        className="canvas-render-container"
        key={item.id}
        data-cmp-id={item.id}
        style={{
          ...item.style,
          position: 'absolute',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`cmp-group-container h-full ${item.className}`} {...eventHandlers}>
          {item.children?.map((child) => (
            <SingleComponent
              item={child}
              currentCmpId={currentCmpId}
              selectedCmpIds={selectedCmpIds}
              hoverId={hoverId}
              setHoverId={setHoverId}
              preview={preview}
              key={child.id}
            />
          ))}
        </div>
        {!preview && (
          <EditorMask
            item={item}
            currentCmpId={currentCmpId}
            selectedCmpIds={selectedCmpIds}
            hoverId={hoverId}
          />
        )}
      </div>
    );
  }

  const animationClass = handleAnimationClass(item.animation);

  return (
    <div
      className={`${animationClass} canvas-render-container`}
      key={item.id}
      data-cmp-id={item.id}
      style={{
        ...item.style,
        ...handleAnimationStyle(item.animation),
        position: 'absolute',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ComponentRenderer item={item} state={state} setState={setState} datasource={datasource} />
      {!preview && (
        <EditorMask
          item={item}
          currentCmpId={currentCmpId}
          selectedCmpIds={selectedCmpIds}
          hoverId={hoverId}
        />
      )}
    </div>
  );
});

const RenderCmp = memo(function RenderCmp({ preview = false }: { preview?: boolean }) {
  const components = useDesignComponentsStore((state) => state.components);
  const setHoverId = useDesignComponentsStore((state) => state.setHoverId);
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);
  const hoverId = useDesignComponentsStore((state) => state.hoverId);

  return (
    <>
      {components.map((item) => (
        <SingleComponent
          key={item.id}
          item={item}
          currentCmpId={currentCmpId}
          selectedCmpIds={selectedCmpIds}
          hoverId={hoverId}
          setHoverId={setHoverId}
          preview={preview}
        />
      ))}
    </>
  );
});

export default RenderCmp;
