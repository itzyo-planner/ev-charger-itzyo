import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CHARGER_TYPES } from '../data/mockChargers'
import { fetchChargersInMapBounds, getRegionCenter } from '../data/api'
import { getPricing, formatPrice } from '../data/pricing'

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

// 원형 마커 아이콘 생성 (스크린샷처럼 원형 + 숫자)
function createMarkerIcon(color, count) {
  const size = count > 99 ? 40 : 34;
  const fontSize = count > 99 ? 11 : 13;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2.5" opacity="0.9"/>
      <text x="${size/2}" y="${size/2 + fontSize * 0.35}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="Arial">${count}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function LeafletMap({ center, filters, selectedStation, onSelectStation, onMapUpdate, onLoadingChange, onErrorChange, searchTrigger }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const myLocationRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const cachedStationsRef = useRef([]);
  const debounceTimerRef = useRef(null);
  const fetchAndRenderRef = useRef(null);

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

      const pricing = getPricing(station.operator);
      const priceHtml = pricing
        ? `<div style="display:flex;gap:8px;margin-top:6px;padding:4px 8px;background:#fefce8;border-radius:6px;font-size:11px;">
            <span style="color:#a16207;">회원 <b>${formatPrice(pricing.member)}/kWh</b></span>
            <span style="color:#d97706;">비회원 <b>${formatPrice(pricing.nonMember)}/kWh</b></span>
          </div>`
        : '';

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
          ${priceHtml}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, closeButton: true });
      marker.on('click', () => onSelectStation(station));
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

  // ref를 항상 최신 fetchAndRender로 즉시 동기화
  fetchAndRenderRef.current = fetchAndRender;

  // 내 위치 빨간 점 추가
  const addMyLocationMarker = useCallback((map, lat, lng) => {
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.remove();
    }
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
    myLocationRef.current = { lat, lng };
  }, []);

  // 현위치로 이동
  const goToMyLocation = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 14);
          addMyLocationMarker(map, lat, lng);
        },
        () => {
          // 위치 권한 거부 시 기존 위치로
          if (myLocationRef.current) {
            map.setView([myLocationRef.current.lat, myLocationRef.current.lng], 14);
          }
        }
      );
    }
  }, [addMyLocationMarker]);

  // 지도 초기화
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 10,
      zoomControl: false,
      tap: true,
      tapTolerance: 15,
      touchZoom: true,
      dragging: true,
      bounceAtZoomLimits: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const callFetch = () => {
      if (fetchAndRenderRef.current) fetchAndRenderRef.current();
    };

    // 현재 위치로 이동 + 빨간 점
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 13);
          addMyLocationMarker(map, lat, lng);
          // setView → moveend → callFetch
        },
        () => {
          callFetch();
        }
      );
    } else {
      callFetch();
    }

    // 디바운스된 moveend 이벤트
    map.on('moveend', () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        callFetch();
      }, 500);
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
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

  // 검색 트리거
  useEffect(() => {
    if (!searchTrigger) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const regionCenter = getRegionCenter(filters.region);
    if (regionCenter) {
      map.setView([regionCenter.lat, regionCenter.lng], 11);
    } else {
      if (fetchAndRenderRef.current) fetchAndRenderRef.current();
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
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {/* 현위치 버튼 */}
      <button
        onClick={goToMyLocation}
        className="touch-btn absolute z-[1000] bg-white rounded-lg shadow-lg p-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={{ right: '10px', bottom: 'calc(60px + var(--sab))' }}
        title="내 위치로 이동"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </button>
    </div>
  );
}
