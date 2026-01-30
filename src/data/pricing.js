// 전기차 충전 요금 (2026-01-30 기준, 단위: 원/kWh)
// 출처: 한국전력 전기차 충전요금 공시

const PRICING_DATA = {
  '기후에너지환경부': { member: 347, nonMember: 347.2, note: '100kW 이상' },
  '환경부': { member: 347, nonMember: 347.2, note: '100kW 이상' },
  'GS차지비': { member: 319, nonMember: 470 },
  'GS칼텍스': { member: 319, nonMember: 347 },
  'KH에너지': { member: 341, nonMember: 347 },
  'LG유플러스 홈충전': { member: 339, nonMember: 390 },
  'LG헬로비전': { member: 339, nonMember: 390 },
  'NI인포유': { member: 350, nonMember: 350 },
  'SK렌터카': { member: 310, nonMember: 310 },
  'SK에너지': { member: 347, nonMember: 450 },
  'SK일렉링크': { member: 347.2, nonMember: 450 },
  'SK시그넷': { member: 347.2, nonMember: 347.2 },
  '가온일렉트릭': { member: 324, nonMember: 400 },
  '가평전기': { member: 324, nonMember: 400 },
  '강릉시': { member: 324, nonMember: 400 },
  '거제시': { member: 324, nonMember: 400 },
  '경기산업': { member: 324, nonMember: 400 },
  '관성계측기': { member: 324.4, nonMember: 347.2 },
  '그리디스': { member: 347.2, nonMember: 347.2 },
  '그린카드': { member: 248, nonMember: 347.2 },
  '그린피드': { member: 248, nonMember: 347.2 },
  '그린전력': { member: 347, nonMember: 347.2 },
  '나이스차저': { member: 324.4, nonMember: 324.4 },
  '내일': { member: 300, nonMember: 400 },
  '넥스트렌드': { member: 400, nonMember: 400 },
  '뉴텔솔루션': { member: 270, nonMember: 390 },
  '농업에너지자조 신재생에너지센터': { member: 345, nonMember: 350 },
  '대성블루에너지': { member: 300, nonMember: 390 },
  '대영채비': { member: 339, nonMember: 390 },
  '동부이엔텍': { member: 325, nonMember: 340 },
  '두루스코어비엔이': { member: 340, nonMember: 500 },
  '라이트브리지': { member: 350, nonMember: 350 },
  '레드이앤지': { member: 400, nonMember: 500 },
  '레드이앤지(2)': { member: 390, nonMember: 400 },
  '리얼채비': { member: 279, nonMember: 350 },
  '린에너지': { member: 324.4, nonMember: 440 },
  '매니지온': { member: 324.4, nonMember: 324.4 },
  '메가차저에너지': { member: 324.4, nonMember: 324.4 },
  '보타리에너지서비스': { member: 288.7, nonMember: 288.7 },
  '보타리에너지서비스(2)': { member: 200, nonMember: 590 },
  '브이에이에네르기': { member: 250, nonMember: 0 },
  '서울시': { member: 324.4, nonMember: 324.4 },
  '세종시': { member: 340, nonMember: 340 },
  '세차지': { member: 347.2, nonMember: 450 },
  '서울에너지': { member: 278, nonMember: 347.2 },
  '소프트베리': { member: 324.4, nonMember: 440 },
  '생진기업': { member: 285, nonMember: 460 },
  '생진기업(2)': { member: 347.2, nonMember: 347.2 },
  '스타코프': { member: 347.2, nonMember: 347.2 },
  '스카이코어': { member: 259, nonMember: 370 },
  '신세계아이앤씨': { member: 340, nonMember: 455 },
  '씨어스': { member: 340, nonMember: 340 },
  '아마렌코리아': { member: 324.4, nonMember: 240 },
  '아이온커뮤니케이션즈': { member: 285, nonMember: 360 },
  '아이마켓': { member: 285, nonMember: 400 },
  '에버온': { member: 324.4, nonMember: 380 },
  '에스에스기전': { member: 300, nonMember: 340 },
  '에스에스피': { member: 290, nonMember: 340 },
  '엔라이팅': { member: 324.4, nonMember: 324.4 },
  '언텍블루에너지': { member: 350, nonMember: 450 },
  '엘스타일렉트릭에너지': { member: 234, nonMember: 324.4 },
  '온스테이션': { member: 285, nonMember: 420 },
  '유니어보이드': { member: 290, nonMember: 300 },
  '유플러스이비': { member: 340, nonMember: 450 },
  '이비이앤지': { member: 250, nonMember: 300 },
  '이브이시스': { member: 347.2, nonMember: 400 },
  '이오플래닛': { member: 347.2, nonMember: 400 },
  '이앤에어테크': { member: 324.4, nonMember: 350 },
  '이엘에너지리더스': { member: 324.4, nonMember: 350 },
  '이카플래그': { member: 347.2, nonMember: 440 },
  '인코리아': { member: 324.4, nonMember: 440 },
  '일렉트리': { member: 324.4, nonMember: 324.4 },
  '제주전기자동차서비스': { member: 320, nonMember: 480 },
  '제주특별자치도': { member: 324.4, nonMember: 347.2 },
  '지레스에너트': { member: 227, nonMember: 347.2 },
  '차지온': { member: 347.2, nonMember: 400 },
  '차지스': { member: 390, nonMember: 324.4 },
  '차지인': { member: 312.5, nonMember: 450 },
  '차지인(2)': { member: 282.0, nonMember: 450.0 },
  '채비': { member: 435, nonMember: 590 },
  '클라인': { member: 347.2, nonMember: 347.2 },
  '클린일렉스': { member: 370, nonMember: 590 },
  '크로커스': { member: 340, nonMember: 860 },
  '클린일렉스(2)': { member: 370, nonMember: 590 },
  '타디스테크놀로지': { member: 240.1, nonMember: 300 },
  '투루시너번이티': { member: 300, nonMember: 400 },
  '파스타크비': { member: 383, nonMember: 344.4 },
  '파워큐브': { member: 344.4, nonMember: 344.4 },
  '플러그링크': { member: 324.4, nonMember: 0 },
  '플러딘코퍼레이션': { member: 300, nonMember: 250 },
  '한국충전서비스': { member: 430, nonMember: 430 },
  '한국전기차인프라기술': { member: 208, nonMember: 300 },
  '한국전기차충전서비스': { member: 300, nonMember: 430 },
  '한국전력': { member: 324.4, nonMember: 324.4 },
  '한국전자금융': { member: 286.7, nonMember: 347 },
  '한전산업개발': { member: 324.4, nonMember: 324.4 },
  '현대자동차': { member: 347.2, nonMember: 347.2 },
  'E1': { member: 347.2, nonMember: 450 },
};

// 기관명으로 요금 조회 (부분 매칭 지원)
export function getPricing(operatorName) {
  if (!operatorName) return null;

  // 정확한 매칭
  if (PRICING_DATA[operatorName]) {
    return PRICING_DATA[operatorName];
  }

  // 부분 매칭 (기관명에 포함된 키워드로 검색)
  const name = operatorName.trim();
  for (const [key, value] of Object.entries(PRICING_DATA)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }

  return null;
}

// 요금 포맷팅 (원/kWh)
export function formatPrice(price) {
  if (price === 0) return '무료';
  if (!price) return '-';
  return `${price}원`;
}

export default PRICING_DATA;
