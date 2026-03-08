import { useRef, useState } from 'react';
import {
  Viewer,
  Entity,
  CameraFlyTo,
} from 'resium';
import {
  Ion,
  Cartesian3,
  Color,
  VerticalOrigin,
  HorizontalOrigin,
  Cartesian2,
  ConstantPositionProperty,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDI3ZTZjNC1iZThhLTRkOWQtOTdhYy05ZmU1MmM2Yjg5MTYiLCJpZCI6MjAxMjE3LCJpYXQiOjE3NzIxODY3MDB9.w_I39Fl5MjUqbrZF3s6aCkOw8qvw7uU4LWmPZ0Dtoag';

const BEIJING_CENTER = Cartesian3.fromDegrees(116.3912757, 39.906217, 3000000);

const MARKERS = [
  {
    id: 'tiananmen',
    name: '天安门',
    description: '中华人民共和国首都北京的标志性建筑',
    lon: 116.3912757,
    lat: 39.906217,
    color: Color.RED,
  },
  {
    id: 'forbidden-city',
    name: '故宫',
    description: '世界上保存最完整的古代皇家宫殿建筑群',
    lon: 116.3974600,
    lat: 39.9163447,
    color: Color.ORANGE,
  },
  {
    id: 'bird-nest',
    name: '鸟巢（国家体育场）',
    description: '2008年北京奥运会主场馆',
    lon: 116.3912800,
    lat: 40.0090700,
    color: Color.CYAN,
  },
  {
    id: 'temple-heaven',
    name: '天坛',
    description: '明清两代皇帝祭天、祈谷的场所',
    lon: 116.4073600,
    lat: 39.8822300,
    color: Color.YELLOW,
  },
  {
    id: 'summer-palace',
    name: '颐和园',
    description: '中国现存规模最大、保存最完整的皇家园林',
    lon: 116.2754600,
    lat: 39.9999800,
    color: Color.LIME,
  },
];

const Demo = ({ state }: { state?: any }) => {
  const viewerRef = useRef<any>(null);
  const [selected, setSelected] = useState<typeof MARKERS[0] | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Viewer
        ref={viewerRef}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
        fullscreenButton={false}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraFlyTo
          destination={BEIJING_CENTER}
          duration={2}
        />

        {MARKERS.map((marker) => (
          <Entity
            key={marker.id}
            name={marker.name}
            description={marker.description}
            position={new ConstantPositionProperty(
              Cartesian3.fromDegrees(marker.lon, marker.lat)
            )}
            point={{
              pixelSize: 14,
              color: marker.color,
              outlineColor: Color.WHITE,
              outlineWidth: 2,
              heightReference: 0,
            }}
            label={{
              text: marker.name,
              font: '14px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: 2,
              verticalOrigin: VerticalOrigin.BOTTOM,
              horizontalOrigin: HorizontalOrigin.CENTER,
              pixelOffset: new Cartesian2(0, -20),
              showBackground: true,
              backgroundColor: Color.fromCssColorString('#00000088'),
            }}
            onClick={() => setSelected(marker)}
          />
        ))}
      </Viewer>

      {selected && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            borderRadius: 8,
            padding: '12px 24px',
            minWidth: 280,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 16 }}>{selected.name}</strong>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}
            >
              ✕
            </button>
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: '#ccc' }}>{selected.description}</p>
          <p style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
            经度: {selected.lon} / 纬度: {selected.lat}
          </p>
        </div>
      )}
    </div>
  );
};

export default Demo;
