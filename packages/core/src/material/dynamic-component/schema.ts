import { ComponentSchema, DataType, PageSchema } from '../../types';
import PageRouterProps from './Props'
import PageRouter from './index'

export interface PageRouterPropsSchema extends ComponentSchema {
  props: {
    pageSchema: Pick<PageSchema, 'components' | 'datasource' | 'state' | 'globalCss'>;
    pageId: string
    dataType: DataType
  };
}

export const defaultPageRouterOption = {
  pageSchema: {
    components: [],
    state: {},
    datasource: [],
    globalCss: ''
  },
  pageId: "0076c28a-18c2-438a-9e93-9c36c4bca923",
  dataType: DataType.Normal
}

export const PageRouterMeta = {
  component: PageRouter,
  propsPanel: PageRouterProps,
  schema: {
    style: {
      width: 1920,
      height: 800,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      skewX: 0,
      skewY: 0,
      scale: 1,
    },
    visibleProp: {
      type: 'normal',
      value: true,
    },
    lock: false,
    animation: undefined,
    props: {
      ...defaultPageRouterOption,
    },
    className: '',
  } as Pick<PageRouterPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}