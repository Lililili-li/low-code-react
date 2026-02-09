import materialCmp, { MaterialType } from '@repo/core/material';
import { handleAnimationStyle, handleAnimationClass } from '@repo/core/compiler/animation';
import { ComponentSchema, DataType, PageSchema } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignStateStore, useDesignStore } from '@/store';
import { getVariableValue } from '@repo/core/variable';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import { memo, useRef, useEffect, useState } from 'react';
import { handleEventActions } from '@repo/core/event';
import { useRequest } from 'ahooks';
import pageApi from '@/api/page';
import { PageRouterPropsSchema } from '@repo/core/material/dynamic-component/schema';

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
  mutually: boolean;
  preview?: boolean;
  setHoverId: (id: string) => void;
}

const SingleComponent = ({
  item,
  currentCmpId,
  selectedCmpIds,
  hoverId,
  mutually,
  setHoverId,
  preview,
}: SingleComponentProps) => {
  const state = useDesignStateStore((state) => state.state);
  const setState = useDesignStateStore((state) => state.setState);
  const datasource = useDesignDatasourceStore((state) => state.datasource);

  const eventsMap = useRef<Record<string, any>>({});
  const stateRef = useRef(state);
  const datasourceRef = useRef(datasource);
  const setStateRef = useRef(setState);

  const [dynamicPageSchema, setDynamicPageSchema] = useState<PageSchema>({
    components: [],
    state: {},
    datasource: [],
  } as unknown as PageSchema);

  const { runAsync: getPage } = useRequest((id) => pageApi.getPageById(id), {
    manual: true,
    onSuccess: (value) => {
      setDynamicPageSchema(value.schema);
    },
  });

  // 更新 ref 值
  useEffect(() => {
    stateRef.current = state;
    datasourceRef.current = datasource;
    setStateRef.current = setState;
  }, [state, datasource, setState]);

  useEffect(() => {
    const props = item.props as PageRouterPropsSchema['props'];
    if (props?.pageId) {
      if (props.dataType === DataType.Normal) {
        getPage(props?.pageId);
      } else {
        const pageId = getVariableValue(props.pageId, state);
        getPage(pageId);
      }
    }
  }, [item.props, state]);

  if (!shouldVisible(item, state)) return null;

  item.events?.forEach((event) => {
    if (!['mounted', 'unmounted'].includes(event.type)) {
      eventsMap.current[event.type] = (e: any) => {
        handleEventActions(
          {
            actions: event.actions,
            state: stateRef.current,
            datasource: datasourceRef.current,
            onStateChange: setStateRef.current,
          },
          e,
        );
      };
    }
  });

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
        <div className="cmp-group-container h-full" {...eventsMap.current}>
          {item.children && (
            <>
              {item.children.map((child) => {
                return (
                  <SingleComponent
                    item={child}
                    currentCmpId={currentCmpId}
                    selectedCmpIds={selectedCmpIds}
                    hoverId={hoverId}
                    mutually={mutually}
                    setHoverId={setHoverId}
                    preview={preview}
                    key={child.id}
                  />
                );
              })}
            </>
          )}
        </div>
        {!preview && (
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
        )}
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
        position: 'absolute',
      }}
      onMouseEnter={() => setHoverId(item.id)}
      onMouseLeave={() => setHoverId('')}
    >
      <div className="cmp-container h-full" {...eventsMap.current}>
        <Component
          {...(item as any)}
          state={state}
          onStateChange={setState}
          datasource={datasource}
          props={{
            ...(item as any).props,
            pageSchema: dynamicPageSchema,
          }}
        />
      </div>
      {!mutually && !preview && (
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
};

const RenderCmp = ({ preview = false }: { preview?: boolean }) => {
  const components = useDesignComponentsStore((state) => state.components);
  const setHoverId = useDesignComponentsStore((state) => state.setHoverId);
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);
  const hoverId = useDesignComponentsStore((state) => state.hoverId);
  const mutually = useDesignStore((state) => state.panelConfig.mutually);

  return components.map((item) => (
    <SingleComponent
      key={item.id}
      item={item}
      currentCmpId={currentCmpId}
      selectedCmpIds={selectedCmpIds}
      hoverId={hoverId}
      mutually={mutually}
      setHoverId={setHoverId}
      preview={preview}
    />
  ));
};

export default RenderCmp;
