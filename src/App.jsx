import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import LeafletMap from './components/LeafletMap'
import StatusLegend from './components/StatusLegend'

export default function App() {
  const [filters, setFilters] = useState({
    region: '',
    district: '',
    category: 'all',
    chargerType: ['all'],
    operator: ['all'],
    keyword: '',
    is24h: false,
    isSmart: false,
  });

  const [mapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [visibleStations, setVisibleStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleMapUpdate = useCallback((stations) => {
    setVisibleStations(stations);
  }, []);

  const handleLoadingChange = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const handleErrorChange = useCallback((err) => {
    setError(err);
  }, []);

  const handleSelectStation = useCallback((station) => {
    setSelectedStation(station);
    // 모바일에서 충전소 선택 시 패널 닫기
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-gray-50">
      {/* ===== 지도 영역 (항상 전체 화면) ===== */}
      <div className="absolute inset-0 z-0">
        <LeafletMap
          center={mapCenter}
          filters={filters}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
          onMapUpdate={handleMapUpdate}
          onLoadingChange={handleLoadingChange}
          onErrorChange={handleErrorChange}
        />
      </div>

      {/* ===== 상단 탭 ===== */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full shadow-lg flex overflow-hidden">
        <button className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold text-blue-600 bg-white border-b-2 border-blue-600 flex items-center gap-1">
          <span className="text-base md:text-lg">⚡</span>
          <span className="hidden sm:inline">전기차</span>충전소
        </button>
        <button className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <span className="text-base md:text-lg">💧</span>
          <span className="hidden sm:inline">수소</span>충전소
        </button>
      </div>

      {/* ===== 로딩 인디케이터 ===== */}
      {loading && (
        <div className="absolute top-14 md:top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2">
          <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs md:text-sm text-gray-600">로딩 중...</span>
        </div>
      )}

      {/* ===== 에러 메시지 ===== */}
      {error && !loading && (
        <div className="absolute top-14 md:top-16 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 rounded-lg shadow-lg px-3 py-1.5 md:px-4 md:py-2 max-w-[90vw]">
          <span className="text-xs md:text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* ===== 바운드 내 충전소 카운트 ===== */}
      {!loading && !error && visibleStations.length > 0 && (
        <div className="absolute top-14 md:top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow px-2.5 py-1 md:px-3 md:py-1.5">
          <span className="text-[11px] md:text-xs text-gray-500">
            현재 영역: <strong className="text-blue-600">{visibleStations.length}</strong>개 충전소
          </span>
        </div>
      )}

      {/* ===== 모바일: 하단 검색 버튼 ===== */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl text-sm font-semibold active:bg-blue-700 transition-all ${
          sidebarOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          충전소 검색
        </span>
      </button>

      {/* ===== 데스크톱: 사이드바 토글 버튼 ===== */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden md:block fixed top-1/2 z-30 -translate-y-1/2 bg-white shadow-lg rounded-r-md p-1 hover:bg-gray-100 transition-all"
        style={{ left: sidebarOpen ? '360px' : '0px' }}
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
      </button>

      {/* ===== 모바일: 배경 오버레이 ===== */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== 사이드바 / 모바일 바텀시트 ===== */}
      <div
        className={`
          fixed z-40 bg-white transition-all duration-300 ease-in-out

          /* 모바일: 바텀시트 */
          inset-x-0 bottom-0 rounded-t-2xl shadow-2xl
          ${sidebarOpen ? 'translate-y-0' : 'translate-y-full'}
          h-[85dvh]

          /* 데스크톱: 왼쪽 사이드바 */
          md:inset-y-0 md:left-0 md:right-auto md:bottom-auto
          md:rounded-none md:shadow-none md:border-r md:border-gray-200
          md:w-[360px] md:h-full
          ${sidebarOpen ? 'md:translate-x-0 md:translate-y-0' : 'md:-translate-x-full md:translate-y-0'}
        `}
      >
        {/* 모바일: 드래그 핸들 + 닫기 */}
        <div className="md:hidden flex items-center justify-between px-4 pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-full overflow-hidden">
          <Sidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            stations={visibleStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* ===== 하단 범례 ===== */}
      <StatusLegend />
    </div>
  )
}
