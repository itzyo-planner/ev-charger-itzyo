import { useState } from 'react'
import {
  CHARGER_TYPES,
  OPERATORS,
  STATION_CATEGORIES,
  REGIONS,
  DISTRICTS,
} from '../data/mockChargers'

export default function Sidebar({ filters, onFiltersChange, stations, selectedStation, onSelectStation, loading, error, onSearch }) {
  const [activeTab, setActiveTab] = useState('search');

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key];
    if (value === 'all') {
      onFiltersChange({ ...filters, [key]: ['all'] });
      return;
    }
    let next = current.filter((v) => v !== 'all');
    if (next.includes(value)) {
      next = next.filter((v) => v !== value);
    } else {
      next = [...next, value];
    }
    if (next.length === 0) next = ['all'];
    onFiltersChange({ ...filters, [key]: next });
  };

  const resetFilters = () => {
    onFiltersChange({
      region: '',
      district: '',
      category: 'all',
      chargerType: ['all'],
      operator: ['all'],
      keyword: '',
      is24h: false,
      isSmart: false,
    });
  };

  const districtOptions = filters.region && DISTRICTS[filters.region]
    ? DISTRICTS[filters.region]
    : [{ id: '', label: '시/군' }];

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          충전소 검색
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          자주 찾는 충전소
        </button>
      </div>

      {activeTab === 'search' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 지역선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">지역선택</label>
            <div className="flex gap-2">
              <select
                value={filters.region}
                onChange={(e) => {
                  updateFilter('region', e.target.value);
                  updateFilter('district', '');
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <select
                value={filters.district}
                onChange={(e) => updateFilter('district', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {districtOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 충전소 분류 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">충전소 분류</label>
            <div className="flex gap-2 items-center">
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATION_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is24h}
                    onChange={(e) => updateFilter('is24h', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  24시간 이용
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isSmart}
                    onChange={(e) => updateFilter('isSmart', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  스마트충전기
                </label>
              </div>
            </div>
          </div>

          {/* 충전기 타입 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">충전기 타입</label>
            <select
              value={filters.chargerType.includes('all') ? 'all' : filters.chargerType[0] || 'all'}
              onChange={(e) => updateFilter('chargerType', [e.target.value])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CHARGER_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* 검색어 */}
          <div>
            <div className="flex gap-2">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>충전소</option>
                <option>주소</option>
              </select>
              <input
                type="text"
                placeholder="검색어 입력"
                value={filters.keyword}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onFiltersChange({ ...filters });
                if (onSearch) onSearch();
              }}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '조회 중...' : '검색하기'}
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 border border-blue-300 text-blue-600 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              초기화
            </button>
          </div>

          {/* 운영기관 체크박스 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">운영기관</label>
            <div className="grid grid-cols-2 gap-1.5">
              {OPERATORS.map((op) => (
                <label key={op.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.operator.includes(op.id)}
                    onChange={() => toggleArrayFilter('operator', op.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {op.label}
                </label>
              ))}
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="border-t border-gray-200 pt-4">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">공공데이터 API 조회 중...</span>
              </div>
            ) : stations.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">검색 결과: {stations.length}개</p>
                {stations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectStation(s)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStation?.id === s.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.address}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{s.power}kW</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {CHARGER_TYPES.find(t => t.id === s.chargerType)?.label || s.chargerType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                검색 결과가 없습니다.<br />지역을 선택하고 [검색하기]를 클릭하세요.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4">
          자주 찾는 충전소가 없습니다.
        </div>
      )}

      {/* 엑셀 다운로드 */}
      <div className="border-t border-gray-200 p-3 flex justify-center">
        <button className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          엑셀 다운로드
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    available: { label: '사용가능', color: 'bg-blue-100 text-blue-700' },
    in_use: { label: '사용중', color: 'bg-green-100 text-green-700' },
    unavailable: { label: '사용불가', color: 'bg-gray-100 text-gray-500' },
    unknown: { label: '상태미확인', color: 'bg-orange-100 text-orange-600' },
    restricted: { label: '이용자제한', color: 'bg-purple-100 text-purple-600' },
  };
  const c = config[status] || config.unknown;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>
      {c.label}
    </span>
  );
}
