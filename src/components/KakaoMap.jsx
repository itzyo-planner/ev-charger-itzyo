import { useEffect, useRef, useCallback } from 'react'
import { fetchChargersInBounds, CHARGER_TYPES } from '../data/mockChargers'

// 상태별 마커 색상
const STATUS_COLORS = {
  available: '#3B82F6',   // 파란색 - 사용 가능
  in_use: '#22C55E',      // 초록색 - 사용 중
  unavailable: '#6B7280', // 회색 - 사용 불가
  unknown: '#F97316',     // 주황색 - 상태미확인
  restricted: '#A855F7',  // 보라색 - 이용자제한
};

// SVG 마커 이미지 생성
function createMarkerSvg(color, count) {
  const svg = `
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
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export default function KakaoMap({ center, filters, selectedStation, onSelectStation, onMapUpdate }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const overlaysRef = useRef([]);

  // 마커 필터링 함수
  const filterStations = useCallback((stations) => {
    return stations.filter((s) => {
      if (filters.chargerType.length > 0 && !filters.chargerType.includes('all')) {
        if (!filters.chargerType.includes(s.chargerType)) return false;
      }
      if (filters.operator.length > 0 && !filters.operator.includes('all')) {
        if (!filters.operator.includes(s.operator)) return false;
      }
      if (filters.category !== 'all' && s.category !== filters.category) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!s.name.toLowerCase().includes(kw) && !s.address.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  // 마커 업데이트
  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 기존 마커/오버레이 제거
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    const center = map.getCenter();
    const level = map.getLevel();
    const allStations = fetchChargersInBounds(center.getLat(), center.getLng(), level);
    const filtered = filterStations(allStations);

    onMapUpdate(filtered);

    const kakao = window.kakao;

    filtered.forEach((station) => {
      const position = new kakao.maps.LatLng(station.lat, station.lng);
      const color = STATUS_COLORS[station.status] || STATUS_COLORS.unknown;

      const markerImage = new kakao.maps.MarkerImage(
        createMarkerSvg(color, station.chargerCount),
        new kakao.maps.Size(44, 52),
        { offset: new kakao.maps.Point(22, 52) }
      );

      const marker = new kakao.maps.Marker({
        position,
        image: markerImage,
        map,
      });

      // 인포윈도우 오버레이
      const typeName = CHARGER_TYPES.find(t => t.id === station.chargerType)?.label || station.chargerType;
      const statusLabel = {
        available: '사용가능',
        in_use: '사용중',
        unavailable: '사용불가',
        unknown: '상태미확인',
        restricted: '이용자제한',
      }[station.status] || '알 수 없음';

      const overlayContent = `
        <div style="
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 14px 16px;
          min-width: 220px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
          transform: translateY(-10px);
        ">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">
            <strong style="font-size:14px; color:#1a1a2e;">${station.name}</strong>
            <span style="
              font-size:11px;
              padding: 2px 8px;
              border-radius: 10px;
              background: ${color}20;
              color: ${color};
              font-weight: 600;
            ">${statusLabel}</span>
          </div>
          <p style="font-size:12px; color:#888; margin:0 0 6px 0;">${station.address}</p>
          <div style="display:flex; gap:6px;">
            <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${typeName}</span>
            <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${station.power}kW</span>
            <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${station.chargerCount}기</span>
          </div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0; height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid white;
          "></div>
        </div>
      `;

      const overlay = new kakao.maps.CustomOverlay({
        content: overlayContent,
        position,
        yAnchor: 1.3,
        map: null,
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        overlaysRef.current.forEach((o) => o.setMap(null));
        overlay.setMap(map);
        onSelectStation(station);
      });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
    });
  }, [filterStations, onMapUpdate, onSelectStation]);

  // 지도 초기화
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao || !kakao.maps) {
      // 카카오맵 SDK 미로드 시 fallback UI (데모용)
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#e8edf3;color:#555;font-family:sans-serif;">
            <div style="font-size:48px;margin-bottom:16px;">🗺️</div>
            <p style="font-size:18px;font-weight:600;margin-bottom:8px;">카카오맵 API 키가 필요합니다</p>
            <p style="font-size:13px;color:#888;text-align:center;line-height:1.6;">
              index.html에서 <code>KAKAO_APP_KEY</code>를<br/>
              실제 카카오 JavaScript 앱 키로 교체해주세요.<br/><br/>
              <a href="https://developers.kakao.com" target="_blank" style="color:#3B82F6;">카카오 개발자 사이트에서 키 발급 →</a>
            </p>
          </div>`;
      }
      return;
    }

    kakao.maps.load(() => {
      const container = mapRef.current;
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 8,
      });

      mapInstanceRef.current = map;

      // 지도 컨트롤
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);

      // 현재 위치로 이동
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setCenter(new kakao.maps.LatLng(lat, lng));
          updateMarkers();
        }, () => {
          updateMarkers();
        });
      } else {
        updateMarkers();
      }

      // 지도 이동 완료 시 마커 갱신
      kakao.maps.event.addListener(map, 'idle', () => {
        updateMarkers();
      });

      // 빈 영역 클릭 시 오버레이 닫기
      kakao.maps.event.addListener(map, 'click', () => {
        overlaysRef.current.forEach((o) => o.setMap(null));
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 필터 변경 시 마커 재렌더링
  useEffect(() => {
    updateMarkers();
  }, [filters, updateMarkers]);

  // 선택된 충전소로 이동
  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakao = window.kakao;
    if (map && kakao?.maps && selectedStation) {
      map.setCenter(new kakao.maps.LatLng(selectedStation.lat, selectedStation.lng));
      map.setLevel(5);
    }
  }, [selectedStation]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
