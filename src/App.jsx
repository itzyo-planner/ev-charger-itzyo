import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import KakaoMap from './components/KakaoMap'
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

  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [visibleStations, setVisibleStations] = useState([]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

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

        <KakaoMap
          center={mapCenter}
          filters={filters}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          onMapUpdate={handleMapUpdate}
        />

        {/* 하단 범례 */}
        <StatusLegend />
      </div>
    </div>
  )
}
