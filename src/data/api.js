// 한국환경공단 전기자동차 충전소 공공데이터 API
const SERVICE_KEY = 'ada87e1014ef7984e17193005501805bb19b4effcc00fc8659eb3a62dcd6fc53';

// 개발: Vite 프록시, 프로덕션: Cloudflare Pages Function 프록시
const BASE_URL = '/api/EvCharger';

// 충전기 타입 코드 매핑 (API → 앱)
const CHARGER_TYPE_MAP = {
  '01': 'DC_CHADEMO',
  '02': 'SLOW',
  '03': 'DC_CHADEMO',    // DC차데모+AC3상
  '04': 'DC_COMBO',
  '05': 'DC_COMBO',      // DC차데모+DC콤보
  '06': 'DC_COMBO',      // DC차데모+AC3상+DC콤보
  '07': 'AC3',
  '08': 'DC_COMBO_SLOW', // DC콤보(완속포함)
  '09': 'NACS',          // NACS (테슬라)
  '10': 'NACS',          // NACS+DC콤보
};

// 충전기 상태 코드 매핑 (API → 앱)
const STATUS_MAP = {
  '1': 'unavailable',   // 통신이상
  '2': 'available',     // 충전대기(사용가능)
  '3': 'in_use',        // 충전중
  '4': 'unavailable',   // 운영중지
  '5': 'unavailable',   // 점검중
  '9': 'unknown',       // 상태미확인
};

// 지역코드 매핑 (앱 region id → 공공데이터 zscode)
const REGION_CODE_MAP = {
  seoul: '11',
  busan: '26',
  daegu: '27',
  incheon: '28',
  gwangju: '29',
  daejeon: '30',
  ulsan: '31',
  sejong: '36',
  gyeonggi: '41',
  chungbuk: '43',
  chungnam: '44',
  jeonbuk: '45',
  jeonnam: '46',
  gyeongbuk: '47',
  gyeongnam: '48',
  jeju: '50',
  gangwon: '51',
};

// 위도/경도 → 지역코드 추정 (지도 바운드 중심 좌표 기반)
const REGION_BOUNDS = [
  { code: '11', lat: 37.5665, lng: 126.978, name: '서울' },
  { code: '26', lat: 35.1796, lng: 129.0756, name: '부산' },
  { code: '27', lat: 35.8714, lng: 128.6014, name: '대구' },
  { code: '28', lat: 37.4563, lng: 126.7052, name: '인천' },
  { code: '29', lat: 35.1595, lng: 126.8526, name: '광주' },
  { code: '30', lat: 36.3504, lng: 127.3845, name: '대전' },
  { code: '31', lat: 35.5384, lng: 129.3114, name: '울산' },
  { code: '36', lat: 36.4800, lng: 127.0000, name: '세종' },
  { code: '41', lat: 37.4138, lng: 127.5183, name: '경기' },
  { code: '43', lat: 36.6357, lng: 127.4917, name: '충북' },
  { code: '44', lat: 36.5184, lng: 126.8000, name: '충남' },
  { code: '45', lat: 35.7175, lng: 127.1530, name: '전북' },
  { code: '46', lat: 34.8679, lng: 126.9910, name: '전남' },
  { code: '47', lat: 36.4919, lng: 128.8889, name: '경북' },
  { code: '48', lat: 35.4606, lng: 128.2132, name: '경남' },
  { code: '50', lat: 33.4996, lng: 126.5312, name: '제주' },
  { code: '51', lat: 37.8228, lng: 128.1555, name: '강원' },
];

// 지도 중심 좌표로 가장 가까운 지역코드 추정
export function estimateRegionCode(lat, lng) {
  let closest = null;
  let minDist = Infinity;
  for (const region of REGION_BOUNDS) {
    const dist = Math.sqrt(Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = region;
    }
  }
  return closest ? closest.code : '11';
}

// XML 텍스트에서 특정 태그 값 추출
function getTagValue(xml, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(re);
  return match ? match[1].trim() : '';
}

// 충전기 타입 코드 → 한글 라벨
const CHARGER_TYPE_LABEL = {
  '01': 'DC차데모',
  '02': 'AC완속',
  '03': 'DC차데모+AC3상',
  '04': 'DC콤보',
  '05': 'DC차데모+DC콤보',
  '06': 'DC차데모+AC3상+DC콤보',
  '07': 'AC3상',
  '08': 'DC콤보(완속)',
  '09': 'NACS',
  '10': 'NACS+DC콤보',
};

// 충전기 출력 구분 라벨
function getPowerLabel(output) {
  const w = parseInt(output) || 0;
  if (w <= 7) return `완속 (${w}kW 단독)`;
  if (w <= 50) return `급속 (${w}kW)`;
  if (w <= 100) return `급속 (${w}kW)`;
  if (w <= 200) return `초급속 (${w}kW)`;
  return `초급속 (${w}kW)`;
}

// XML item을 스테이션 객체로 변환
function parseItem(itemXml) {
  const statId = getTagValue(itemXml, 'statId');
  const chgerId = getTagValue(itemXml, 'chgerId');
  const statNm = getTagValue(itemXml, 'statNm');
  const addr = getTagValue(itemXml, 'addr');
  const lat = parseFloat(getTagValue(itemXml, 'lat'));
  const lng = parseFloat(getTagValue(itemXml, 'lng'));
  const chgerType = getTagValue(itemXml, 'chgerType');
  const stat = getTagValue(itemXml, 'stat');
  const output = getTagValue(itemXml, 'output');
  const busiNm = getTagValue(itemXml, 'busiNm');
  const busiId = getTagValue(itemXml, 'busiId');
  const useTime = getTagValue(itemXml, 'useTime');
  const limitYn = getTagValue(itemXml, 'limitYn');
  const limitDetail = getTagValue(itemXml, 'limitDetail');
  const busiCall = getTagValue(itemXml, 'busiCall');
  const statUpdDt = getTagValue(itemXml, 'statUpdDt');
  const note = getTagValue(itemXml, 'note');
  const parkingFree = getTagValue(itemXml, 'parkingFree');
  const kindDetail = getTagValue(itemXml, 'kindDetail');

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  return {
    id: `${statId}_${chgerId}`,
    statId,
    chgerId,
    name: statNm,
    address: addr,
    lat,
    lng,
    chargerType: CHARGER_TYPE_MAP[chgerType] || 'DC_COMBO',
    chargerTypeCode: chgerType,
    chargerTypeLabel: CHARGER_TYPE_LABEL[chgerType] || chgerType,
    status: STATUS_MAP[stat] || 'unknown',
    statusCode: stat,
    power: parseInt(output) || 0,
    powerLabel: getPowerLabel(output),
    operator: busiNm,
    operatorId: busiId,
    useTime: useTime || '',
    limitYn: limitYn === 'Y',
    limitDetail: limitDetail || '',
    category: limitYn === 'Y' ? 'private' : 'public',
    phone: busiCall || '',
    statUpdDt: statUpdDt || '',
    note: note || '',
    parkingFree: parkingFree === 'Y',
    kindDetail: kindDetail || '',
  };
}

// 같은 충전소(statId) 기준으로 충전기 그룹핑
function groupByStation(items) {
  const stationMap = new Map();

  items.forEach((item) => {
    if (!item) return;
    const key = item.statId;
    if (stationMap.has(key)) {
      const station = stationMap.get(key);
      station.chargerCount += 1;
      station.chargers.push(item);
      if (item.power > station.power) {
        station.power = item.power;
        station.chargerType = item.chargerType;
      }
      if (item.status === 'available') {
        station.status = 'available';
      } else if (item.status === 'in_use' && station.status !== 'available') {
        station.status = 'in_use';
      }
    } else {
      stationMap.set(key, {
        ...item,
        id: key,
        chargerCount: 1,
        chargers: [item],
      });
    }
  });

  return Array.from(stationMap.values());
}

// Bounds 내 충전소만 필터
export function filterByBounds(stations, bounds) {
  if (!bounds) return stations;
  const { sw, ne } = bounds;
  return stations.filter((s) =>
    s.lat >= sw.lat && s.lat <= ne.lat &&
    s.lng >= sw.lng && s.lng <= ne.lng
  );
}

// 공공데이터 API 호출 (지역코드 기반)
// API 파라미터: zcode = 시도코드(2자리), zscode = 시군구코드(5자리)
export async function fetchChargers({ zscode, region, numOfRows = 9999, pageNo = 1 } = {}) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
  });

  // 지역코드 설정: 2자리는 zcode, 5자리는 zscode
  const code = zscode || (region && REGION_CODE_MAP[region]) || '';
  if (code) {
    if (code.length <= 2) {
      params.set('zcode', code);
    } else {
      params.set('zscode', code);
    }
  }

  const url = `${BASE_URL}/getChargerInfo?${params.toString()}`;
  console.log('[API] 요청 URL:', url);

  const response = await fetch(url);
  console.log('[API] 응답 상태:', response.status, response.statusText);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[API] 에러 응답:', errorBody.substring(0, 500));
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  const xml = await response.text();
  console.log('[API] 응답 크기:', xml.length, '바이트, 미리보기:', xml.substring(0, 300));

  const resultCode = getTagValue(xml, 'resultCode');
  if (resultCode && resultCode !== '00') {
    const resultMsg = getTagValue(xml, 'resultMsg');
    console.error('[API] API 에러:', resultCode, resultMsg);
    throw new Error(`API 에러: ${resultCode} - ${resultMsg}`);
  }

  const totalCount = parseInt(getTagValue(xml, 'totalCount')) || 0;
  console.log('[API] 전체 건수:', totalCount);

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = [];
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const parsed = parseItem(match[1]);
    if (parsed) items.push(parsed);
  }
  console.log('[API] 파싱된 충전기 수:', items.length);

  const stations = groupByStation(items);
  console.log('[API] 그룹핑된 충전소 수:', stations.length);

  return { totalCount, stations, pageNo, numOfRows };
}

// 지도 바운드 기반 충전소 조회 (중심 좌표로 지역 추정 → API 호출 → 바운드 필터)
export async function fetchChargersInMapBounds({ centerLat, centerLng, bounds, numOfRows = 9999, zscodeOverride, skipBoundsFilter = false } = {}) {
  const zscode = zscodeOverride || estimateRegionCode(centerLat, centerLng);
  console.log('[fetchChargersInMapBounds] zscode:', zscode, 'zscodeOverride:', zscodeOverride, 'skipBoundsFilter:', skipBoundsFilter);

  // 한 번에 최대한 많이 가져오기 (numOfRows=9999)
  const result = await fetchChargers({ zscode, numOfRows, pageNo: 1 });

  let allStations = result.stations;
  console.log('[fetchChargersInMapBounds] API에서 받은 충전소 수:', allStations.length);

  // 지역 검색인 경우 bounds 필터 건너뛰기 (API가 이미 지역 필터링함)
  if (!skipBoundsFilter && bounds) {
    const beforeFilter = allStations.length;
    allStations = filterByBounds(allStations, bounds);
    console.log('[fetchChargersInMapBounds] bounds 필터:', beforeFilter, '→', allStations.length);
  }

  return {
    totalCount: result.totalCount,
    stations: allStations,
    zscode,
  };
}

// 지역 키 → 중심 좌표 조회
export function getRegionCenter(regionKey) {
  const code = REGION_CODE_MAP[regionKey];
  if (!code) return null;
  const region = REGION_BOUNDS.find((r) => r.code === code);
  return region ? { lat: region.lat, lng: region.lng } : null;
}

export { REGION_CODE_MAP, REGION_BOUNDS };
