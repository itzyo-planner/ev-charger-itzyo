import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CHARGER_TYPES } from '../data/mockChargers'
import { fetchChargersInMapBounds, getRegionCenter } from '../data/api'

// 내 위치 펄스 애니메이션 CSS 주입
if (typeof document !== 'undefined' && !document.getElementById('my-loc-pulse')) {
  const style = document.createElement('style');
  style.id = 'my-loc-pulse';
  style.textContent = `
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }`;
  document.head.appendChild(style);
}

// 상태별 마커 색상
const STATUS_COLORS = {
  available: '#3B82F6',
  in_use: '#EF4444',
  unavailable: '#6B7280',
  unknown: '#F97316',
  restricted: '#A855F7',
};

// SVG 마커 아이콘 생성
function createMarkerIcon(color, count) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 37 C16 37 30 23 30 14 C30 6.3 23.7 0 16 0 C8.3 0 2 6.3 2 14 C2 23 16 37 16 37Z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="17" text-anchor="middle" fill="white" font-size="${count > 99 ? 8 : 10}" font-weight="bold" font-family="Arial">${count}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

export default function LeafletMap({ center, filters, selectedStation, onSelectStation, onMapUpdate, onLoadingChange, onErrorChange, searchTrigger }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const cachedStationsRef = useRef([]);

  // 필터링
  const filterStations = useCallback((stations) => {
    return stations.filter((s) => {
      if (filters.chargerType.length > 0 && !filters.chargerType.includes('all')) {
        if (!filters.chargerType.includes(s.chargerType)) return false;
      }
      if (filters.operator.length > 0 && !filters.operator.includes('all')) {
        const opFilter = filters.operator;
        if (!opFilter.includes(s.operatorId) && !opFilter.includes(s.operator)) return false;
      }
      if (filters.category !== 'all' && s.category !== filters.category) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!s.name.toLowerCase().includes(kw) && !s.address.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  // 마커 렌더링
  const renderMarkers = useCallback((stations) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 기존 마커 제거
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const filtered = filterStations(stations);
    onMapUpdate(filtered);

    filtered.forEach((station) => {
      const color = STATUS_COLORS[station.status] || STATUS_COLORS.unknown;
      const icon = createMarkerIcon(color, station.chargerCount);

      const marker = L.marker([station.lat, station.lng], { icon });

      const typeName = CHARGER_TYPES.find(t => t.id === station.chargerType)?.label || station.chargerType;
      const statusLabel = {
        available: '사용가능',
        in_use: '사용중',
        unavailable: '사용불가',
        unknown: '상태미확인',
        restricted: '이용자제한',
      }[station.status] || '알 수 없음';
      const operatorLabel = station.operator || '정보없음';

      const popupContent = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-width:200px;max-width:280px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">
            <strong style="font-size:14px;color:#1a1a2e;flex:1;margin-right:8px;">${station.name}</strong>
            <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${color}20;color:${color};font-weight:600;white-space:nowrap;">${statusLabel}</span>
          </div>
          <p style="font-size:12px;color:#888;margin:0 0 6px 0;">${station.address}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="font-size:11px;background:#f1f5f9;padding:2px 8px;border-radius:4px;color:#475569;">${typeName}</span>
            ${station.power ? `<span style="font-size:11px;background:#f1f5f9;padding:2px 8px;border-radius:4px;color:#475569;">${station.power}kW</span>` : ''}
            <span style="font-size:11px;background:#f1f5f9;padding:2px 8px;border-radius:4px;color:#475569;">${station.chargerCount}기</span>
            <span style="font-size:11px;background:#dbeafe;padding:2px 8px;border-radius:4px;color:#1d4ed8;">${operatorLabel}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, closeButton: true });
      marker.on('click', () => {
        onSelectStation(station);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [filterStations, onMapUpdate, onSelectStation]);

  // API 호출 + 마커 렌더링
  const fetchAndRender = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const mapCenter = map.getCenter();
    const mapBounds = map.getBounds();
    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();

    const bounds = {
      sw: { lat: sw.lat, lng: sw.lng },
      ne: { lat: ne.lat, lng: ne.lng },
    };

    const requestId = Date.now();
    fetchControllerRef.current = requestId;

    onLoadingChange(true);
    onErrorChange(null);

    try {
      const result = await fetchChargersInMapBounds({
        centerLat: mapCenter.lat,
        centerLng: mapCenter.lng,
        bounds,
        numOfRows: 100,
      });

      if (fetchControllerRef.current !== requestId) return;

      cachedStationsRef.current = result.stations;
      renderMarkers(result.stations);
    } catch (err) {
      if (fetchControllerRef.current !== requestId) return;
      console.error('충전소 API 조회 실패:', err);
      onErrorChange('충전소 데이터를 불러오지 못했습니다.');
      if (cachedStationsRef.current.length > 0) {
        renderMarkers(cachedStationsRef.current);
      }
    } finally {
      if (fetchControllerRef.current === requestId) {
        onLoadingChange(false);
      }
    }
  }, [renderMarkers, onLoadingChange, onErrorChange]);

  // 지도 초기화
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 10,
      zoomControl: false,
    });

    // 줌 컨트롤 우측 배치
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap 타일
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // 마커 레이어 그룹
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // 현재 위치로 이동 + 빨간 점 표시
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 13);

          // 내 위치 빨간 점 마커 (크게)
          const myLocIcon = L.divIcon({
            html: `
              <div style="position:relative;width:30px;height:30px;">
                <div style="position:absolute;inset:0;background:rgba(239,68,68,0.2);border-radius:50%;animation:pulse-ring 1.5s ease-out infinite;"></div>
                <div style="position:absolute;top:7px;left:7px;width:16px;height:16px;background:#EF4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
              </div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          myLocationMarkerRef.current = L.marker([lat, lng], { icon: myLocIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup('내 위치');
        },
        () => {
          fetchAndRender();
        }
      );
    } else {
      fetchAndRender();
    }

    // 지도 이동/줌 완료 시 API 호출
    map.on('moveend', () => {
      fetchAndRender();
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 필터 변경 시 캐시된 데이터로 재렌더링
  useEffect(() => {
    if (cachedStationsRef.current.length > 0) {
      renderMarkers(cachedStationsRef.current);
    }
  }, [filters, renderMarkers]);

  // 검색 트리거: 지역 선택 시 해당 지역으로 이동 → moveend에서 자동 fetch
  useEffect(() => {
    if (!searchTrigger) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const regionCenter = getRegionCenter(filters.region);
    if (regionCenter) {
      map.setView([regionCenter.lat, regionCenter.lng], 11);
    } else {
      // 지역 미선택 시 현재 위치에서 다시 fetch
      fetchAndRender();
    }
  }, [searchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // 선택된 충전소로 이동
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedStation) {
      map.setView([selectedStation.lat, selectedStation.lng], 15);
    }
  }, [selectedStation]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
