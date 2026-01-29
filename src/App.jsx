import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import KakaoMap from './components/KakaoMap'
import StatusLegend from './components/StatusLegend'
import { fetchChargers } from './data/api'

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

  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [visibleStations, setVisibleStations] = useState([]);
  const [apiStations, setApiStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 공공데이터 API에서 충전소 데이터 조회
  const loadChargers = useCallback(async (region) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchChargers({
        region: region || undefined,
        numOfRows: 100,
        pageNo: 1,
      });
      setApiStations(result.stations);
    } catch (err) {
      console.error('API 호출 실패:', err);
      setError('충전소 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      // API 실패 시 mock 데이터로 자동 fallback (apiStations를 빈 배열로 유지)
    } finally {
      setLoading(false);
    }
  }, []);

  // 앱 초기 로드 시 서울 지역 데이터 조회
  useEffect(() => {
    loadChargers('seoul');
  }, [loadChargers]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // 지역 변경 시 API 재조회
    if (newFilters.region !== filters.region) {
      loadChargers(newFilters.region);
    }
  }, [filters.region, loadChargers]);

  const handleMapUpdate = useCallback((stations) => {
    setVisibleStations(stations);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* 사이드바 토글 버튼 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 z-30 -translate-y-1/2 bg-white shadow-lg rounded-r-md p-1 hover:bg-gray-100 transition-all"
        style={{ left: sidebarOpen ? '360px' : '0px' }}
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
      </button>

      {/* 사이드바 */}
      <div className={`${sidebarOpen ? 'w-[360px] min-w-[360px]' : 'w-0 min-w-0 overflow-hidden'} transition-all duration-300 h-full`}>
        <Sidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          stations={visibleStations}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          loading={loading}
          error={error}
          onSearch={() => loadChargers(filters.region)}
        />
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        {/* 상단 탭 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full shadow-lg flex overflow-hidden">
          <button className="px-5 py-2.5 text-sm font-semibold text-blue-600 bg-white border-b-2 border-blue-600 flex items-center gap-1.5">
            <span className="text-lg">⚡</span> 전기차충전소
          </button>
          <button className="px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
            <span className="text-lg">💧</span> 수소충전소
          </button>
        </div>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">충전소 데이터 로딩 중...</span>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && !loading && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-2">
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {/* API 데이터 카운트 표시 */}
        {!loading && apiStations.length > 0 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow px-3 py-1.5">
            <span className="text-xs text-gray-500">
              공공데이터 API: <strong className="text-blue-600">{apiStations.length}</strong>개 충전소 로드됨
            </span>
          </div>
        )}

        <KakaoMap
          center={mapCenter}
          filters={filters}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          onMapUpdate={handleMapUpdate}
          apiStations={apiStations}
        />

        {/* 하단 범례 */}
        <StatusLegend />
      </div>
    </div>
  )
}
