import React, { useEffect, useRef } from 'react';
import { Plugin, MaterialDefinition, MaterialPlugin, PropsPanelProps } from '../../types';
import { ComponentSchema } from '../../../types';

// ==================== 地图组件实现 ====================

interface GaodeMapProps {
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
}

const GaodeMap: React.FC<GaodeMapProps> = ({ 
  center = [116.397428, 39.90923], 
  zoom = 11,
  style 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 实际实现中加载高德地图 SDK
    console.log('Loading Gaode Map with center:', center, 'zoom:', zoom);
    
    // 模拟地图加载
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #1976d2;
          font-size: 14px;
        ">
          🗺️ 高德地图<br/>
          中心: ${center.join(', ')}<br/>
          缩放: ${zoom}
        </div>
      `;
    }
  }, [center, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        ...style 
      }} 
    />
  );
};

// ==================== 属性面板 ====================

const MapPropsPanel: React.FC<PropsPanelProps> = ({ component, onChange }) => {
  const { props = {} } = component as ComponentSchema & { props: GaodeMapProps };
  const { center = [116.397428, 39.90923], zoom = 11 } = props;

  const handleCenterChange = (index: number, value: string) => {
    const newCenter = [...center] as [number, number];
    newCenter[index] = parseFloat(value) || 0;
    onChange({ 
      props: { 
        ...props, 
        center: newCenter 
      } 
    });
  };

  const handleZoomChange = (value: string) => {
    onChange({ 
      props: { 
        ...props, 
        zoom: parseInt(value) || 11 
      } 
    });
  };

  return (
    <div className="map-props-panel space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">地图中心经度</label>
        <input
          type="number"
          step="0.000001"
          value={center[0]}
          onChange={(e) => handleCenterChange(0, e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">地图中心纬度</label>
        <input
          type="number"
          step="0.000001"
          value={center[1]}
          onChange={(e) => handleCenterChange(1, e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">缩放级别 (3-20)</label>
        <input
          type="number"
          min={3}
          max={20}
          value={zoom}
          onChange={(e) => handleZoomChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        提示：可以在预览模式下拖拽地图调整位置
      </div>
    </div>
  );
};

// ==================== Schema 定义 ====================

const mapSchema: Partial<ComponentSchema> = {
  type: 'gaode-map',
  name: '高德地图',
  style: {
    width: 400,
    height: 300,
  },
};

// ==================== 插件定义 ====================

export const gaodeMapComponent: MaterialDefinition = {
  id: 'gaode-map',
  categoryId: 'map',
  name: '高德地图',
  description: '集成高德地图，支持标记、路径等功能',
  icon: '🗺️',
  cover: 'https://placeholder.com/map-cover.png',
  
  component: GaodeMap,
  propsPanel: MapPropsPanel,
  schema: mapSchema,
  
  defaultProps: {
    center: [116.397428, 39.90923],
    zoom: 11,
  },
  
  resizable: true,
  defaultSize: {
    width: 400,
    height: 300,
  },
};

// ==================== 插件导出 ====================

const MapPlugin: MaterialPlugin = {
  meta: {
    id: 'map-plugin',
    name: '地图组件插件',
    version: '1.0.0',
    author: 'Mini Team',
    description: '提供高德地图、百度地图等地图组件',
    keywords: ['map', 'gaode', 'baidu', 'location'],
  },

  type: 'material',

  activate(context: import('../../types').PluginContext) {
    // 注册地图分类
    context.registerMaterial(gaodeMapComponent);

    // 可以注册更多地图组件...
    // context.registerMaterial(baiduMapComponent);
    // context.registerMaterial(tencentMapComponent);

    console.log('[MapPlugin] Activated successfully');
  },

  deactivate() {
    console.log('[MapPlugin] Deactivated');
  },
};

export default MapPlugin;
