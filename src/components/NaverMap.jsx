import { useEffect, useRef, useCallback } from 'react'
import { CHARGER_TYPES } from '../data/mockChargers'
import { fetchChargersInMapBounds } from '../data/api'

// 상태별 마커 색상 — 사용가능: 파란색, 사용중: 빨간색
const STATUS_COLORS = {
  available: '#3B82F6',   // 파란색
  in_use: '#EF4444',      // 빨간색
  unavailable: '#6B7280', // 회색
  unknown: '#F97316',     // 주황색
  restricted: '#A855F7',  // 보라색
};

// SVG 마커 이미지 생성
function createMarkerSvg(color, count) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M22 48 C22 48 40 30 40 18 C40 8 32 0 22 0 C12 0 4 8 4 18 C4 30 22 48 22 48Z"
        fill="${color}" filter="url(#shadow)" stroke="white" stroke-width="2"/>
      <text x="22" y="22" text-anchor="middle" fill="white" font-size="${count > 99 ? 10 : 12}" font-weight="bold" font-family="Arial">${count}</text>
    </svg>`;
}

export default function NaverMap({ center, filters, selectedStation, onSelectStation, onMapUpdate, onLoadingChange, onErrorChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const fetchControllerRef = useRef(null);  // AbortController 대용 (중복 요청 방지)
  const lastZscodeRef = useRef(null);       // 마지막으로 조회한 지역코드
  const cachedStationsRef = useRef([]);     // 캐시된 충전소 데이터

  // 마커 필터링 함수
  const filterStations = useCallback((stations) => {
    return stations.filter((s) => {
      if (filters.chargerType.length > 0 && !filters.chargerType.includes('all')) {
        if (!filters.chargerType.includes(s.chargerType)) return false;
      }
      if (filters.operator.length > 0 && !filters.operator.includes('all')) {
        const opFilter = filters.operator;
        const matchById = opFilter.includes(s.operatorId);
        const matchByField = opFilter.includes(s.operator);
        if (!matchById && !matchByField) return false;
      }
      if (filters.category !== 'all' && s.category !== filters.category) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!s.name.toLowerCase().includes(kw) && !s.address.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  // 현재 바운드 내 스테이션을 마커로 렌더링
  const renderMarkers = useCallback((stations) => {
    const map = mapInstanceRef.current;
    const naver = window.naver;
    if (!map || !naver) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const filtered = filterStations(stations);
    onMapUpdate(filtered);

    filtered.forEach((station) => {
      const position = new naver.maps.LatLng(station.lat, station.lng);
      const color = STATUS_COLORS[station.status] || STATUS_COLORS.unknown;

      const marker = new naver.maps.Marker({
        position,
        map,
        icon: {
          content: `<div style="cursor:pointer;">${createMarkerSvg(color, station.chargerCount)}</div>`,
          size: new naver.maps.Size(44, 52),
          anchor: new naver.maps.Point(22, 52),
        },
      });

      // 인포윈도우 내용
      const typeName = CHARGER_TYPES.find(t => t.id === station.chargerType)?.label || station.chargerType;
      const statusLabel = {
        available: '사용가능',
        in_use: '사용중',
        unavailable: '사용불가',
        unknown: '상태미확인',
        restricted: '이용자제한',
      }[station.status] || '알 수 없음';
      const operatorLabel = station.operator || '정보없음';

      const contentHtml = `
        <div style="
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 14px 16px;
          min-width: 240px;
          max-width: 300px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">
            <strong style="font-size:14px; color:#1a1a2e; flex:1; margin-right:8px;">${station.name}</strong>
            <span style="
              font-size:11px;
              padding: 2px 8px;
              border-radius: 10px;
              background: ${color}20;
              color: ${color};
              font-weight: 600;
              white-space: nowrap;
            ">${statusLabel}</span>
          </div>
          <p style="font-size:12px; color:#888; margin:0 0 6px 0;">${station.address}</p>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${typeName}</span>
            ${station.power ? `<span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${station.power}kW</span>` : ''}
            <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${station.chargerCount}기</span>
            <span style="font-size:11px; background:#dbeafe; padding:2px 8px; border-radius:4px; color:#1d4ed8;">${operatorLabel}</span>
          </div>
        </div>
      `;

      const infoWindow = new naver.maps.InfoWindow({
        content: contentHtml,
        borderWidth: 0,
        backgroundColor: 'transparent',
        disableAnchor: true,
        pixelOffset: new naver.maps.Point(0, -10),
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
        onSelectStation(station);
      });

      markersRef.current.push(marker);
    });
  }, [filterStations, onMapUpdate, onSelectStation]);

  // 지도 바운드 기반 API 호출 + 마커 렌더링
  const fetchAndRender = useCallback(async () => {
    const map = mapInstanceRef.current;
    const naver = window.naver;
    if (!map || !naver) return;

    const mapCenter = map.getCenter();
    const mapBounds = map.getBounds();
    const sw = mapBounds.getSW();
    const ne = mapBounds.getNE();

    const bounds = {
      sw: { lat: sw.lat(), lng: sw.lng() },
      ne: { lat: ne.lat(), lng: ne.lng() },
    };

    // 요청 ID로 중복/stale 응답 방지
    const requestId = Date.now();
    fetchControllerRef.current = requestId;

    onLoadingChange(true);
    onErrorChange(null);

    try {
      const result = await fetchChargersInMapBounds({
        centerLat: mapCenter.lat(),
        centerLng: mapCenter.lng(),
        bounds,
        numOfRows: 100,
      });

      // stale 응답 무시
      if (fetchControllerRef.current !== requestId) return;

      lastZscodeRef.current = result.zscode;
      cachedStationsRef.current = result.stations;
      renderMarkers(result.stations);
    } catch (err) {
      if (fetchControllerRef.current !== requestId) return;
      console.error('충전소 API 조회 실패:', err);
      onErrorChange('충전소 데이터를 불러오지 못했습니다.');
      // 캐시가 있으면 캐시로 렌더링
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
    const naver = window.naver;
    if (!naver || !naver.maps) {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#e8edf3;color:#555;font-family:sans-serif;">
            <div style="font-size:48px;margin-bottom:16px;">🗺️</div>
            <p style="font-size:18px;font-weight:600;margin-bottom:8px;">네이버 지도 API 키가 필요합니다</p>
            <p style="font-size:13px;color:#888;text-align:center;line-height:1.6;">
              index.html에서 네이버 지도 SDK가 올바르게 로드되었는지 확인해주세요.
            </p>
          </div>`;
      }
      return;
    }

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom: 13,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    });

    mapInstanceRef.current = map;

    // 현재 위치로 이동 후 API 호출
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        map.setCenter(new naver.maps.LatLng(lat, lng));
        fetchAndRender();
      }, () => {
        // 위치 권한 거부 시 기본 센터로 API 호출
        fetchAndRender();
      });
    } else {
      fetchAndRender();
    }

    // 지도 이동/줌 완료 시 → API fetch + 마커 갱신
    naver.maps.Event.addListener(map, 'idle', () => {
      fetchAndRender();
    });

    // 빈 영역 클릭 시 인포윈도우 닫기
    naver.maps.Event.addListener(map, 'click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 필터 변경 시 → 캐시된 데이터로 마커 재렌더링 (API 재호출 불필요)
  useEffect(() => {
    if (cachedStationsRef.current.length > 0) {
      renderMarkers(cachedStationsRef.current);
    }
  }, [filters, renderMarkers]);

  // 선택된 충전소로 이동
  useEffect(() => {
    const map = mapInstanceRef.current;
    const naver = window.naver;
    if (map && naver?.maps && selectedStation) {
      map.setCenter(new naver.maps.LatLng(selectedStation.lat, selectedStation.lng));
      map.setZoom(15);
    }
  }, [selectedStation]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
