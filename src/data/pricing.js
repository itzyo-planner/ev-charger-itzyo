// 전기차 충전 요금 (사업자별 완속/급속 구분, 수정일자 포함)
// 출처: 한국환경공단 전기자동차 충전요금 공시

// 구조: { memberSlow, memberFast, nonMemberSlow, nonMemberFast, updatedAt }
// null = 해당 요금 없음 (해당 충전 타입 미제공)
const PRICING_DATA = {
  '기후에너지환경부': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-15' },
  '환경부': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2023-11-15' },
  'GS차저비': { memberSlow: 303, memberFast: 319, nonMemberSlow: null, nonMemberFast: 470, updatedAt: '2026-01-22' },
  'GS칼텍스': { memberSlow: null, memberFast: 347, nonMemberSlow: null, nonMemberFast: 348, updatedAt: '2023-10-21' },
  'KH에너지': { memberSlow: null, memberFast: 341, nonMemberSlow: null, nonMemberFast: 347, updatedAt: '2023-10-21' },
  'LG유플러스': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 460, updatedAt: '2024-11-13' },
  'LG플러스 홈충전': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 310, updatedAt: '2024-11-13' },
  'LG플러스 홈충전(올리치그린)': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: null, updatedAt: '2024-11-13' },
  'NI인포유': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-11-13' },
  'SK렌터카': { memberSlow: null, memberFast: 310, nonMemberSlow: null, nonMemberFast: 310, updatedAt: '2024-01-08' },
  'SK에너지': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 450.0, updatedAt: '2025-01-15' },
  'SK일렉링크': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 450.0, updatedAt: '2025-01-15' },
  'SK시그넷': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-05-08' },
  '가온일렉트릭': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-06-09' },
  '가평전기': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-06-09' },
  '거목건설': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-05-23' },
  '관성계측기': { memberSlow: 260, memberFast: 324.4, nonMemberSlow: 347.2, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '광진테크': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 460, updatedAt: '2025-02-11' },
  '그리드위즈': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 460, updatedAt: '2025-02-11' },
  '그린전력': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-08-20' },
  '그린피드': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-08-23' },
  '나이스차저': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-08-23' },
  '내일': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-01-09' },
  '넥스트렌드': { memberSlow: null, memberFast: 400, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-01-09' },
  '농업에너지자조': { memberSlow: null, memberFast: 230, nonMemberSlow: null, nonMemberFast: 290, updatedAt: '2024-10-21' },
  '대림장치즈': { memberSlow: null, memberFast: 138, nonMemberSlow: null, nonMemberFast: 236, updatedAt: '2024-10-21' },
  '녹색솔루션': { memberSlow: null, memberFast: 270, nonMemberSlow: null, nonMemberFast: 370, updatedAt: '2025-07-10' },
  '대성블루에너지': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 500, updatedAt: '2025-07-10' },
  '대영채비': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 360, updatedAt: '2025-08-18' },
  '동양이엔피': { memberSlow: null, memberFast: 340, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2024-04-22' },
  '두루스코어비엔이': { memberSlow: null, memberFast: 250, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-04-22' },
  '딜라이브어비': { memberSlow: null, memberFast: 270, nonMemberSlow: null, nonMemberFast: 324, updatedAt: '2025-02-12' },
  '레드이앤지': { memberSlow: null, memberFast: null, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-02-19' },
  '레드이앤지(2)': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-02-19' },
  '리얼채비': { memberSlow: null, memberFast: 279, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2025-01-15' },
  '리갈발전': { memberSlow: null, memberFast: 250, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2025-01-15' },
  '린에너지': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2024-10-21' },
  '매니지온': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2024-10-21' },
  '에너지커피': { memberSlow: null, memberFast: 130, nonMemberSlow: null, nonMemberFast: 230, updatedAt: '2025-02-06' },
  '제가블': { memberSlow: null, memberFast: 330, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-02-06' },
  '제가파워스': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 460, updatedAt: '2025-02-06' },
  '보타리에너지': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2023-11-16' },
  '보타리에너지서비스': { memberSlow: null, memberFast: 286.7, nonMemberSlow: null, nonMemberFast: 286.7, updatedAt: '2023-11-16' },
  '브이에이에네르기': { memberSlow: null, memberFast: 250, nonMemberSlow: null, nonMemberFast: 0, updatedAt: '2025-01-17' },
  '서울시': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-01-19' },
  '세종시': { memberSlow: null, memberFast: 340, nonMemberSlow: null, nonMemberFast: 340, updatedAt: '2024-01-19' },
  '세차지': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-02-11' },
  '서울에너지': { memberSlow: null, memberFast: 278, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2025-02-11' },
  '산업시스템': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2026-10-19' },
  '선광시스템': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2025-01-16' },
  '성원기업': { memberSlow: null, memberFast: 325, nonMemberSlow: null, nonMemberFast: 460, updatedAt: '2025-02-17' },
  '생진기업': { memberSlow: null, memberFast: 290, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2025-02-17' },
  '소프트베리': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '소프트메타': { memberSlow: null, memberFast: 260, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2025-08-23' },
  '스타코프': { memberSlow: null, memberFast: 370, nonMemberSlow: null, nonMemberFast: 370, updatedAt: '2025-08-23' },
  '신세계아이앤씨': { memberSlow: null, memberFast: 340, nonMemberSlow: null, nonMemberFast: 455, updatedAt: '2024-12-10' },
  '신서에너지마켓': { memberSlow: null, memberFast: 289, nonMemberSlow: null, nonMemberFast: 485, updatedAt: '2024-12-10' },
  '씨어스': { memberSlow: null, memberFast: 340, nonMemberSlow: null, nonMemberFast: 340, updatedAt: '2024-11-16' },
  '아마렌코리아': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 240, updatedAt: '2025-08-04' },
  '아르곤': { memberSlow: null, memberFast: 290, nonMemberSlow: null, nonMemberFast: 290, updatedAt: '2025-08-04' },
  '아이노코리아': { memberSlow: null, memberFast: 270, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2025-11-15' },
  '아우토크릭트': { memberSlow: null, memberFast: 320, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '아이전기차지아': { memberSlow: null, memberFast: 245, nonMemberSlow: null, nonMemberFast: 240, updatedAt: '2025-11-16' },
  '아이온커뮤니케이션즈': { memberSlow: null, memberFast: 285, nonMemberSlow: null, nonMemberFast: 360, updatedAt: '2025-07-01' },
  '아이마켓': { memberSlow: null, memberFast: 285, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2024-11-16' },
  '에버온': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 380, updatedAt: '2025-02-14' },
  '에스에스기전': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 340, updatedAt: '2024-10-29' },
  '에스에스피': { memberSlow: null, memberFast: 290, nonMemberSlow: null, nonMemberFast: 340, updatedAt: '2024-10-21' },
  '엔라이팅': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '언텍블루에너지': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-10-21' },
  '엔비플러스': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '블스또일모빌리티파크': { memberSlow: null, memberFast: 380, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2024-11-16' },
  '온스테이션': { memberSlow: null, memberFast: 340, nonMemberSlow: null, nonMemberFast: 420, updatedAt: '2025-11-06' },
  '론스테이션': { memberSlow: null, memberFast: 285, nonMemberSlow: null, nonMemberFast: 420, updatedAt: '2025-11-06' },
  '유니어보이드': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2025-01-24' },
  '유플러스이비': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-01-24' },
  '이비에스이비아이디': { memberSlow: null, memberFast: 290, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-11-06' },
  '이비이앤지': { memberSlow: null, memberFast: 380, nonMemberSlow: null, nonMemberFast: 500, updatedAt: '2024-11-08' },
  '이브이시스': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-10-04' },
  '이브이투핸드': { memberSlow: null, memberFast: 280, nonMemberSlow: null, nonMemberFast: 360, updatedAt: '2025-10-04' },
  '이서전마드코리아': { memberSlow: null, memberFast: 290, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-11-08' },
  '이브이시스코': { memberSlow: null, memberFast: 260, nonMemberSlow: null, nonMemberFast: 500, updatedAt: '2024-11-08' },
  '이앤에어테크': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-10-21' },
  '이엘에너지리더스': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 340, updatedAt: '2024-10-21' },
  '이앤에이치에너지': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-08-05' },
  '이오플래닛비시지텔': { memberSlow: null, memberFast: 245, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-08-05' },
  '이사벨헬스니스': { memberSlow: null, memberFast: 330, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2024-08-05' },
  '이셀렉트릭스': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2024-06-21' },
  '이붸인트': { memberSlow: null, memberFast: 250, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2024-06-21' },
  '이마르크무': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2025-05-29' },
  '이카플래그': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2025-05-29' },
  '이카플래그(2)': { memberSlow: null, memberFast: null, nonMemberSlow: null, nonMemberFast: 440, updatedAt: '2025-05-29' },
  '인코리아': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-06-12' },
  '일렉트리': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-04-12' },
  '제주전기자동차서비스': { memberSlow: null, memberFast: 320, nonMemberSlow: null, nonMemberFast: 480, updatedAt: '2025-11-16' },
  '제주특별자치도': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '지레스에너트': { memberSlow: null, memberFast: 227, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '차볼트스': { memberSlow: null, memberFast: 400, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-01-19' },
  '차지스': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2025-05-19' },
  '차지인': { memberSlow: null, memberFast: 312.5, nonMemberSlow: null, nonMemberFast: 450.0, updatedAt: '2025-11-16' },
  '차지인(2)': { memberSlow: null, memberFast: 282.0, nonMemberSlow: null, nonMemberFast: 450.0, updatedAt: '2025-11-16' },
  '채비': { memberSlow: null, memberFast: 450, nonMemberSlow: null, nonMemberFast: 580, updatedAt: '2025-11-13' },
  '채비(2)': { memberSlow: null, memberFast: 370, nonMemberSlow: null, nonMemberFast: 590, updatedAt: '2025-11-13' },
  '클라인': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-06-19' },
  '콘시전': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2024-05-10' },
  '크로커스': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 860, updatedAt: '2024-04-12' },
  '크로포스': { memberSlow: null, memberFast: 339, nonMemberSlow: null, nonMemberFast: 590, updatedAt: '2025-01-16' },
  '클린일렉스': { memberSlow: null, memberFast: 370, nonMemberSlow: null, nonMemberFast: 590, updatedAt: '2025-01-16' },
  '타디스테크놀로지': { memberSlow: null, memberFast: 260.1, nonMemberSlow: null, nonMemberFast: 300, updatedAt: '2025-07-01' },
  '투루시너번이티': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-12-17' },
  '파스타크비': { memberSlow: null, memberFast: 344.4, nonMemberSlow: null, nonMemberFast: 344.4, updatedAt: '2025-02-17' },
  '파워큐브': { memberSlow: null, memberFast: 344.4, nonMemberSlow: null, nonMemberFast: 344.4, updatedAt: '2025-02-17' },
  '플러그링크': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 0, updatedAt: '2025-12-23' },
  '플러딘코퍼레이션': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 250, updatedAt: '2025-12-23' },
  '파인인포터스': { memberSlow: null, memberFast: 300, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-06-03' },
  '한국EV충전서비스센터': { memberSlow: null, memberFast: 400, nonMemberSlow: null, nonMemberFast: 400, updatedAt: '2025-11-16' },
  '한국전기차충전서비스센터': { memberSlow: null, memberFast: 400, nonMemberSlow: null, nonMemberFast: 500, updatedAt: '2023-08-25' },
  '한국전기차인프라기술': { memberSlow: null, memberFast: 208, nonMemberSlow: null, nonMemberFast: 300, updatedAt: '2025-11-16' },
  '한국전기차충전서비스': { memberSlow: null, memberFast: 371, nonMemberSlow: null, nonMemberFast: 500, updatedAt: '2025-11-16' },
  '한국전력': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-11-04' },
  '한국전자금융': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-11-04' },
  '한마음장애인자립센터': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2025-11-04' },
  '한화솔루션': { memberSlow: null, memberFast: 352, nonMemberSlow: null, nonMemberFast: 328, updatedAt: '2026-01-20' },
  '한화임팩트': { memberSlow: null, memberFast: 283.1, nonMemberSlow: null, nonMemberFast: 397.5, updatedAt: '2026-01-21' },
  '현대자동차': { memberSlow: null, memberFast: 309, nonMemberSlow: null, nonMemberFast: 308, updatedAt: '2025-04-21' },
  '현대엔지니어링': { memberSlow: null, memberFast: 250, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2025-09-01' },
  '해피차저지': { memberSlow: null, memberFast: 335, nonMemberSlow: null, nonMemberFast: 390, updatedAt: '2025-09-01' },
  '홈앤스마이스': { memberSlow: null, memberFast: 222, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2025-08-22' },
  '흥엔스이비아이': { memberSlow: null, memberFast: 350, nonMemberSlow: null, nonMemberFast: 350, updatedAt: '2024-11-15' },
  'E1': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2024-11-15' },
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
  if (price === null || price === undefined) return '-';
  return `${price}원`;
}

export default PRICING_DATA;
