// 한국환경공단 전기자동차 충전소 공공데이터 API
const SERVICE_KEY = 'ada87e1014ef7984e17193005501805bb19b4effcc00fc8659eb3a62dcd6fc53';
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
  '08': 'DC_COMBO',      // DC콤보(완속포함)
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

// XML 텍스트에서 특정 태그 값 추출
function getTagValue(xml, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(re);
  return match ? match[1].trim() : '';
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
    status: STATUS_MAP[stat] || 'unknown',
    statusCode: stat,
    power: parseInt(output) || 0,
    operator: busiNm,
    operatorId: busiId,
    useTime: useTime || '',
    limitYn: limitYn === 'Y',
    limitDetail: limitDetail || '',
    category: limitYn === 'Y' ? 'private' : 'public',
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
      // 가장 높은 출력 기록
      if (item.power > station.power) {
        station.power = item.power;
        station.chargerType = item.chargerType;
      }
      // 하나라도 사용가능하면 사용가능 표시
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
      });
    }
  });

  return Array.from(stationMap.values());
}

// 공공데이터 API 호출
export async function fetchChargers({ region, numOfRows = 100, pageNo = 1 } = {}) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
  });

  // 지역 필터
  if (region && REGION_CODE_MAP[region]) {
    params.set('zscode', REGION_CODE_MAP[region]);
  }

  const url = `${BASE_URL}/getChargerInfo?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const xml = await response.text();

    // 에러 응답 체크
    const resultCode = getTagValue(xml, 'resultCode');
    if (resultCode && resultCode !== '00') {
      const resultMsg = getTagValue(xml, 'resultMsg');
      throw new Error(`API 에러: ${resultCode} - ${resultMsg}`);
    }

    // totalCount 추출
    const totalCount = parseInt(getTagValue(xml, 'totalCount')) || 0;

    // item 태그 파싱
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const parsed = parseItem(match[1]);
      if (parsed) items.push(parsed);
    }

    // 충전소 단위로 그룹핑
    const stations = groupByStation(items);

    return {
      totalCount,
      stations,
      pageNo,
      numOfRows,
    };
  } catch (error) {
    console.error('충전소 데이터 조회 실패:', error);
    throw error;
  }
}

// 다중 페이지 조회 (최대 maxPages 페이지까지)
export async function fetchAllChargers({ region, numOfRows = 100, maxPages = 3 } = {}) {
  const firstPage = await fetchChargers({ region, numOfRows, pageNo: 1 });
  let allStations = [...firstPage.stations];

  const totalPages = Math.ceil(firstPage.totalCount / numOfRows);
  const pagesToFetch = Math.min(totalPages, maxPages);

  if (pagesToFetch > 1) {
    const promises = [];
    for (let page = 2; page <= pagesToFetch; page++) {
      promises.push(fetchChargers({ region, numOfRows, pageNo: page }));
    }
    const results = await Promise.all(promises);
    results.forEach((r) => {
      allStations = allStations.concat(r.stations);
    });
  }

  // 중복 제거 (같은 statId)
  const uniqueMap = new Map();
  allStations.forEach((s) => {
    if (!uniqueMap.has(s.statId) || s.chargerCount > uniqueMap.get(s.statId).chargerCount) {
      uniqueMap.set(s.statId, s);
    }
  });

  return Array.from(uniqueMap.values());
}

export { REGION_CODE_MAP };
