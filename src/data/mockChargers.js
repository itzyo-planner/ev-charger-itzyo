// 충전기 상태 코드
export const CHARGER_STATUS = {
  AVAILABLE: 'available',    // 사용 가능
  IN_USE: 'in_use',          // 사용 중
  UNAVAILABLE: 'unavailable', // 사용 불가
  UNKNOWN: 'unknown',        // 상태미확인
  RESTRICTED: 'restricted',  // 이용자제한
};

// 충전기 타입
export const CHARGER_TYPES = [
  { id: 'all', label: '전체' },
  { id: 'DC_COMBO', label: 'DC콤보' },
  { id: 'DC_CHADEMO', label: 'DC차데모' },
  { id: 'AC3', label: 'AC3상' },
  { id: 'SLOW', label: '완속' },
  { id: 'DC_COMBO_SLOW', label: 'DC콤보 (완속)' },
  { id: 'NACS', label: 'NACS' },
];

// 운영기관
export const OPERATORS = [
  { id: 'all', label: '전체' },
  { id: 'ME', label: '기후에너지환경부' },
  { id: 'E1', label: 'E1' },
  { id: 'GS', label: 'GS차지비' },
  { id: 'GSCALTEX', label: 'GS칼텍스' },
  { id: 'KH', label: 'KH에너지' },
  { id: 'KEPCO', label: '한국전력' },
  { id: 'EVERON', label: '에버온' },
  { id: 'SKHD', label: 'SK시그넷' },
];

// 충전소 분류
export const STATION_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'public', label: '공용' },
  { id: 'shared', label: '공유' },
  { id: 'private', label: '비공용' },
];

// 시/도 목록
export const REGIONS = [
  { id: '', label: '시/도' },
  { id: 'seoul', label: '서울특별시' },
  { id: 'busan', label: '부산광역시' },
  { id: 'daegu', label: '대구광역시' },
  { id: 'incheon', label: '인천광역시' },
  { id: 'gwangju', label: '광주광역시' },
  { id: 'daejeon', label: '대전광역시' },
  { id: 'ulsan', label: '울산광역시' },
  { id: 'sejong', label: '세종특별자치시' },
  { id: 'gyeonggi', label: '경기도' },
  { id: 'chungbuk', label: '충청북도' },
  { id: 'chungnam', label: '충청남도' },
  { id: 'jeonbuk', label: '전북특별자치도' },
  { id: 'jeonnam', label: '전라남도' },
  { id: 'gyeongbuk', label: '경상북도' },
  { id: 'gyeongnam', label: '경상남도' },
  { id: 'jeju', label: '제주특별자치도' },
  { id: 'gangwon', label: '강원특별자치도' },
];

// 시/군/구 데이터 (일부)
export const DISTRICTS = {
  seoul: [
    { id: '', label: '시/군' },
    { id: 'gangnam', label: '강남구' },
    { id: 'gangdong', label: '강동구' },
    { id: 'gangbuk', label: '강북구' },
    { id: 'gangseo', label: '강서구' },
    { id: 'gwanak', label: '관악구' },
    { id: 'gwangjin', label: '광진구' },
    { id: 'guro', label: '구로구' },
    { id: 'geumcheon', label: '금천구' },
    { id: 'nowon', label: '노원구' },
    { id: 'dobong', label: '도봉구' },
    { id: 'dongdaemun', label: '동대문구' },
    { id: 'dongjak', label: '동작구' },
    { id: 'mapo', label: '마포구' },
    { id: 'seodaemun', label: '서대문구' },
    { id: 'seocho', label: '서초구' },
    { id: 'seongdong', label: '성동구' },
    { id: 'seongbuk', label: '성북구' },
    { id: 'songpa', label: '송파구' },
    { id: 'yangcheon', label: '양천구' },
    { id: 'yeongdeungpo', label: '영등포구' },
    { id: 'yongsan', label: '용산구' },
    { id: 'eunpyeong', label: '은평구' },
    { id: 'jongno', label: '종로구' },
    { id: 'jung', label: '중구' },
    { id: 'jungnang', label: '중랑구' },
  ],
  gyeonggi: [
    { id: '', label: '시/군' },
    { id: 'suwon', label: '수원시' },
    { id: 'seongnam', label: '성남시' },
    { id: 'yongin', label: '용인시' },
    { id: 'bucheon', label: '부천시' },
    { id: 'ansan', label: '안산시' },
    { id: 'anyang', label: '안양시' },
    { id: 'hwaseong', label: '화성시' },
    { id: 'pyeongtaek', label: '평택시' },
    { id: 'goyang', label: '고양시' },
  ],
};

// 서울/경기 지역 모의 충전소 데이터
function generateMockChargers() {
  const stations = [
    { id: 1, name: '강남역 충전소', lat: 37.4979, lng: 127.0276, address: '서울특별시 강남구 역삼동', operator: 'ME', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 28 },
    { id: 2, name: '삼성동 코엑스 충전소', lat: 37.5120, lng: 127.0590, address: '서울특별시 강남구 삼성동', operator: 'GS', category: 'public', chargerType: 'DC_COMBO', power: 200, status: 'in_use', chargerCount: 23 },
    { id: 3, name: '서초 IC 충전소', lat: 37.4837, lng: 127.0155, address: '서울특별시 서초구 서초동', operator: 'E1', category: 'public', chargerType: 'DC_CHADEMO', power: 50, status: 'available', chargerCount: 8 },
    { id: 4, name: '잠실 롯데월드타워 충전소', lat: 37.5126, lng: 127.1025, address: '서울특별시 송파구 신천동', operator: 'KEPCO', category: 'public', chargerType: 'DC_COMBO', power: 350, status: 'available', chargerCount: 37 },
    { id: 5, name: '여의도 IFC 충전소', lat: 37.5256, lng: 126.9258, address: '서울특별시 영등포구 여의도동', operator: 'EVERON', category: 'public', chargerType: 'AC3', power: 100, status: 'in_use', chargerCount: 12 },
    { id: 6, name: '마포구청 충전소', lat: 37.5633, lng: 126.9017, address: '서울특별시 마포구 도화동', operator: 'ME', category: 'public', chargerType: 'SLOW', power: 7, status: 'available', chargerCount: 99 },
    { id: 7, name: '노원 이마트 충전소', lat: 37.6543, lng: 127.0626, address: '서울특별시 노원구 상계동', operator: 'SKHD', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'unavailable', chargerCount: 5 },
    { id: 8, name: '종로 세종문화회관 충전소', lat: 37.5724, lng: 126.9760, address: '서울특별시 종로구 세종로', operator: 'GS', category: 'public', chargerType: 'DC_COMBO_SLOW', power: 50, status: 'available', chargerCount: 67 },
    { id: 9, name: '구로 디지털단지 충전소', lat: 37.4845, lng: 126.8969, address: '서울특별시 구로구 구로동', operator: 'KH', category: 'shared', chargerType: 'DC_COMBO', power: 100, status: 'in_use', chargerCount: 9 },
    { id: 10, name: '성수동 카페거리 충전소', lat: 37.5445, lng: 127.0557, address: '서울특별시 성동구 성수동', operator: 'E1', category: 'public', chargerType: 'NACS', power: 200, status: 'available', chargerCount: 64 },
    { id: 11, name: '수원역 충전소', lat: 37.2660, lng: 127.0015, address: '경기도 수원시 팔달구', operator: 'ME', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 225 },
    { id: 12, name: '판교 테크노밸리 충전소', lat: 37.4020, lng: 127.1086, address: '경기도 성남시 분당구', operator: 'GSCALTEX', category: 'public', chargerType: 'DC_COMBO', power: 350, status: 'in_use', chargerCount: 270 },
    { id: 13, name: '용인 기흥 충전소', lat: 37.2747, lng: 127.1155, address: '경기도 용인시 기흥구', operator: 'EVERON', category: 'public', chargerType: 'DC_CHADEMO', power: 50, status: 'available', chargerCount: 337 },
    { id: 14, name: '고양 킨텍스 충전소', lat: 37.6700, lng: 126.7464, address: '경기도 고양시 일산서구', operator: 'KEPCO', category: 'public', chargerType: 'DC_COMBO', power: 200, status: 'restricted', chargerCount: 43 },
    { id: 15, name: '화성 동탄 충전소', lat: 37.2063, lng: 127.0738, address: '경기도 화성시 동탄', operator: 'ME', category: 'public', chargerType: 'AC3', power: 100, status: 'available', chargerCount: 125 },
    { id: 16, name: '안산 중앙역 충전소', lat: 37.3189, lng: 126.8396, address: '경기도 안산시 단원구', operator: 'GS', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 32 },
    { id: 17, name: '인천공항 충전소', lat: 37.4602, lng: 126.4407, address: '인천광역시 중구 운서동', operator: 'SKHD', category: 'public', chargerType: 'DC_COMBO', power: 350, status: 'in_use', chargerCount: 7 },
    { id: 18, name: '천안 아산역 충전소', lat: 36.7948, lng: 127.1043, address: '충청남도 천안시 동남구', operator: 'E1', category: 'public', chargerType: 'DC_COMBO', power: 200, status: 'available', chargerCount: 223 },
    { id: 19, name: '대전 유성 충전소', lat: 36.3622, lng: 127.3561, address: '대전광역시 유성구', operator: 'KH', category: 'public', chargerType: 'SLOW', power: 7, status: 'unknown', chargerCount: 4 },
    { id: 20, name: '부산 해운대 충전소', lat: 35.1587, lng: 129.1604, address: '부산광역시 해운대구', operator: 'GSCALTEX', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 25 },
    { id: 21, name: '광화문 충전소', lat: 37.5759, lng: 126.9769, address: '서울특별시 종로구 사직로', operator: 'ME', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 4 },
    { id: 22, name: '남산타워 충전소', lat: 37.5512, lng: 126.9882, address: '서울특별시 용산구 용산동', operator: 'EVERON', category: 'shared', chargerType: 'DC_CHADEMO', power: 50, status: 'in_use', chargerCount: 9 },
    { id: 23, name: '건대입구 충전소', lat: 37.5403, lng: 127.0695, address: '서울특별시 광진구 화양동', operator: 'GS', category: 'public', chargerType: 'DC_COMBO', power: 200, status: 'available', chargerCount: 8 },
    { id: 24, name: '평택 충전소', lat: 36.9922, lng: 127.0856, address: '경기도 평택시 비전동', operator: 'KEPCO', category: 'public', chargerType: 'DC_COMBO', power: 100, status: 'available', chargerCount: 5 },
  ];

  return stations;
}

export const mockChargers = generateMockChargers();

// 지도 중심 좌표 기준으로 반경 내 충전소 필터링 (시뮬레이션)
export function fetchChargersInBounds(centerLat, centerLng, level) {
  const radius = level * 0.05;
  return mockChargers.filter((c) => {
    const dlat = Math.abs(c.lat - centerLat);
    const dlng = Math.abs(c.lng - centerLng);
    return dlat < radius && dlng < radius;
  });
}
