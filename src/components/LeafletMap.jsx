import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { fetchChargersInMapBounds, getRegionCenter, REGION_CODE_MAP } from '../data/api'

// 내 위치 펄스 애니메이션 + 클러스터 스타일 CSS 주입
if (typeof document !== 'undefined' && !document.getElementById('my-loc-pulse')) {
  const style = document.createElement('style');
  style.id = 'my-loc-pulse';
  style.textContent = `
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .marker-cluster-custom {
      background: rgba(59, 130, 246, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marker-cluster-custom div {
      background: rgba(59, 130, 246, 0.85);
      color: white;
      font-weight: bold;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .marker-cluster-small { width: 40px; height: 40px; }
    .marker-cluster-small div { width: 30px; height: 30px; font-size: 12px; }
    .marker-cluster-medium { width: 50px; height: 50px; }
    .marker-cluster-medium div { width: 38px; height: 38px; font-size: 13px; }
    .marker-cluster-large { width: 64px; height: 64px; }
    .marker-cluster-large div { width: 50px; height: 50px; font-size: 15px; }`;
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

// 반경 프리셋 옵션
const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 300];

// 원형 마커 아이콘 생성
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
  const clusterGroupRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const myLocationRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const cachedStationsRef = useRef([]);
  const debounceTimerRef = useRef(null);
  const fetchAndRenderRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // 반경 모드 (ON) vs 지도 영역 모드 (OFF)
  const [radiusMode, setRadiusMode] = useState(true);
  const radiusModeRef = useRef(radiusMode);
  radiusModeRef.current = radiusMode;

  // 반경 (km)
  const [radiusKm, setRadiusKm] = useState(10);
  const radiusKmRef = useRef(radiusKm);
  radiusKmRef.current = radiusKm;

  // 지역 검색 여부를 ref로 관리
  const isRegionSearchRef = useRef(false);

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

  // 마커 렌더링 (markercluster 사용)
  const renderMarkers = useCallback((stations) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const filtered = filterStations(stations);
    onMapUpdate(filtered);

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: (zoom) => {
        if (zoom <= 8) return 120;
        if (zoom <= 10) return 80;
        if (zoom <= 12) return 50;
        return 30;
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 15,
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-custom marker-cluster-';
        if (count < 20) className += 'small';
        else if (count < 100) className += 'medium';
        else className += 'large';
        return L.divIcon({
          html: `<div>${count}</div>`,
          className,
          iconSize: L.point(40, 40),
        });
      },
    });

    filtered.forEach((station) => {
      const color = STATUS_COLORS[station.status] || STATUS_COLORS.unknown;
      const icon = createMarkerIcon(color, station.chargerCount);
      const marker = L.marker([station.lat, station.lng], { icon });
      marker.on('click', () => onSelectStation(station));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
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

    const selectedRegion = filtersRef.current.region;
    const zscodeOverride = selectedRegion ? REGION_CODE_MAP[selectedRegion] : undefined;
    const skipBoundsFilter = isRegionSearchRef.current;
    isRegionSearchRef.current = false;

    const useRadius = radiusModeRef.current;
    const currentRadiusKm = radiusKmRef.current;

    const requestId = Date.now();
    fetchControllerRef.current = requestId;

    onLoadingChange(true);
    onErrorChange(null);

    // 반경 원 표시/제거
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }
    if (useRadius && !zscodeOverride) {
      radiusCircleRef.current = L.circle([mapCenter.lat, mapCenter.lng], {
        radius: currentRadiusKm * 1000,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '6 4',
        interactive: false,
      }).addTo(map);
    }

    try {
      const result = await fetchChargersInMapBounds({
        centerLat: mapCenter.lat,
        centerLng: mapCenter.lng,
        bounds,
        zscodeOverride,
        skipBoundsFilter,
        radiusKm: (useRadius && !zscodeOverride) ? currentRadiusKm : undefined,
      });

      if (fetchControllerRef.current !== requestId) return;

      cachedStationsRef.current = result.stations;
      renderMarkers(result.stations);
    } catch (err) {
      if (fetchControllerRef.current !== requestId) return;
      console.error('[fetchAndRender] 실패:', err);
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

  // 조회 버튼
  const searchHere = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (fetchAndRenderRef.current) fetchAndRenderRef.current();
  }, []);

  // 현위치로 이동 + 조회
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

    mapInstanceRef.current = map;

    const callFetch = () => {
      if (fetchAndRenderRef.current) fetchAndRenderRef.current();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 13);
          addMyLocationMarker(map, lat, lng);
          callFetch();
        },
        () => {
          callFetch();
        }
      );
    } else {
      callFetch();
    }

    // moveend: 반경모드 OFF일 때만 자동 fetch (디바운스)
    map.on('moveend', () => {
      // 반경 원 위치 업데이트
      const mc = map.getCenter();
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setLatLng([mc.lat, mc.lng]);
      }
      // 반경모드 OFF → 지도 이동 시 자동 fetch
      if (!radiusModeRef.current) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          callFetch();
        }, 800);
      }
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

    // 검색 트리거

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    isRegionSearchRef.current = true;

    const regionCenter = getRegionCenter(filters.region);
    if (regionCenter) {
      const currentCenter = map.getCenter();
      const dist = Math.abs(currentCenter.lat - regionCenter.lat) + Math.abs(currentCenter.lng - regionCenter.lng);

      if (dist < 0.01) {
        if (fetchAndRenderRef.current) fetchAndRenderRef.current();
      } else {
        map.once('moveend', () => {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          if (fetchAndRenderRef.current) fetchAndRenderRef.current();
        });
        map.setView([regionCenter.lat, regionCenter.lng], 11);
      }
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

  // 반경 모드 토글
  const toggleRadiusMode = useCallback(() => {
    setRadiusMode(prev => {
      const next = !prev;
      radiusModeRef.current = next;
      // 반경 끄면 원 제거하고 바로 지도 영역 기준으로 fetch
      if (!next) {
        const map = mapInstanceRef.current;
        if (radiusCircleRef.current && map) {
          map.removeLayer(radiusCircleRef.current);
          radiusCircleRef.current = null;
        }
      }
      // 토글 후 바로 fetch
      setTimeout(() => {
        if (fetchAndRenderRef.current) fetchAndRenderRef.current();
      }, 50);
      return next;
    });
  }, []);

  // 반경 선택 핸들러
  const selectRadius = useCallback((km) => {
    setRadiusKm(km);
    radiusKmRef.current = km;
    // 선택 후 바로 조회
    setTimeout(() => {
      if (fetchAndRenderRef.current) fetchAndRenderRef.current();
    }, 50);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* 좌측 하단: 반경 컨트롤 */}
      <div
        className="absolute z-[1000] flex flex-col items-center gap-1.5 bg-white rounded-xl shadow-lg px-1.5 py-2"
        style={{ left: '10px', bottom: 'calc(60px + var(--sab))' }}
      >
        {/* 반경 ON/OFF 토글 */}
        <button
          onClick={toggleRadiusMode}
          className={`w-full px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
            radiusMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          반경 {radiusMode ? 'ON' : 'OFF'}
        </button>

        {/* 반경 ON일 때: 프리셋 버튼들 */}
        {radiusMode && (
          <>
            <div className="flex flex-col gap-0.5">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  onClick={() => selectRadius(km)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                    radiusKm === km
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
            <button
              onClick={searchHere}
              className="touch-btn w-full bg-blue-600 text-white rounded-lg shadow px-2 py-1.5 text-[10px] font-bold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-0.5"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              조회
            </button>
          </>
        )}
      </div>

      {/* 우측 하단: 내 위치 버튼 */}
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
