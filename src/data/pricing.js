// 전기차 충전 요금 (사업자별 완속/급속 구분, 수정일자 포함)
// 출처: 한국환경공단 전기자동차 충전요금 공시

// 구조: { memberSlow, memberFast, nonMemberSlow, nonMemberFast, updatedAt }
// null = 해당 요금 없음 (해당 충전 타입 미제공)
const PRICING_DATA = {
  '기후에너지환경부': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2023-11-15' },
  '환경부': { memberSlow: null, memberFast: 324.4, nonMemberSlow: null, nonMemberFast: 324.4, updatedAt: '2023-11-15' },
  'GS차지비': { memberSlow: 319, memberFast: 335, nonMemberSlow: 470, nonMemberFast: 470, updatedAt: '2026-01-22' },
  'GS칼텍스': { memberSlow: null, memberFast: 347, nonMemberSlow: null, nonMemberFast: 448, updatedAt: '2024-07-22' },
  'KH에너지': { memberSlow: null, memberFast: 347, nonMemberSlow: null, nonMemberFast: 347, updatedAt: '2024-10-21' },
  'LG유플러스': { memberSlow: 295, memberFast: 350, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2025-02-28' },
  'LG유플러스 볼트업': { memberSlow: 295, memberFast: 350, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2025-02-28' },
  'LG유플러스 볼트업(플러그인)': { memberSlow: 295, memberFast: 350, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2025-02-28' },
  'NICE인프라': { memberSlow: 324, memberFast: 350, nonMemberSlow: 324, nonMemberFast: 350, updatedAt: '2026-01-09' },
  'SK렌터카': { memberSlow: 310, memberFast: 350, nonMemberSlow: 310, nonMemberFast: 350, updatedAt: '2024-11-01' },
  'SK에너지': { memberSlow: 286, memberFast: 347.2, nonMemberSlow: 286, nonMemberFast: 450.0, updatedAt: '2024-02-06' },
  'SK일렉링크': { memberSlow: 320, memberFast: 430, nonMemberSlow: 590, nonMemberFast: 590.0, updatedAt: '2025-07-15' },
  '가온건설': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 400, nonMemberFast: 500, updatedAt: '2025-06-20' },
  '광성계측기': { memberSlow: 300, memberFast: 260, nonMemberSlow: 347.2, nonMemberFast: 324.4, updatedAt: '2024-10-21' },
  '그리드위즈': { memberSlow: 249, memberFast: 320, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2024-10-21' },
  '그린전력': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-09-20' },
  '넥씽': { memberSlow: 300, memberFast: 350, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2025-01-02' },
  '농협경제지주': { memberSlow: 186, memberFast: 230, nonMemberSlow: 236, nonMemberFast: 280, updatedAt: '2024-10-21' },
  '농협경제지주 신재생에너지센터': { memberSlow: 186, memberFast: 230, nonMemberSlow: 236, nonMemberFast: 280, updatedAt: '2024-10-21' },
  '뉴텍솔루션': { memberSlow: 270, memberFast: 280, nonMemberSlow: 370, nonMemberFast: 440, updatedAt: '2024-10-21' },
  '대성물류건설': { memberSlow: 250, memberFast: null, nonMemberSlow: 500, nonMemberFast: null, updatedAt: '2025-07-07' },
  '동양이엔피': { memberSlow: 280, memberFast: 350, nonMemberSlow: 280, nonMemberFast: 350, updatedAt: '2025-09-16' },
  '두루스코이브이': { memberSlow: 250, memberFast: 340, nonMemberSlow: 350, nonMemberFast: 400, updatedAt: '2024-04-22' },
  '딜라이브': { memberSlow: 279, memberFast: null, nonMemberSlow: 324, nonMemberFast: null, updatedAt: '2025-02-17' },
  '레드이엔지': { memberSlow: 260, memberFast: 400, nonMemberSlow: 400, nonMemberFast: 500, updatedAt: '2025-02-03' },
  '리셀파워': { memberSlow: 250, memberFast: 320, nonMemberSlow: 350, nonMemberFast: 420, updatedAt: '2025-07-15' },
  '매니지온': { memberSlow: 230, memberFast: 324.4, nonMemberSlow: 440, nonMemberFast: 440, updatedAt: '2024-10-21' },
  '메가볼트': { memberSlow: 290, memberFast: 330, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2025-02-06' },
  '보타리에너지': { memberSlow: 286.7, memberFast: 324.4, nonMemberSlow: 286.7, nonMemberFast: 324.4, updatedAt: '2023-11-16' },
  '브라이트에너지파트너스': { memberSlow: 250, memberFast: 320, nonMemberSlow: 0, nonMemberFast: 550, updatedAt: '2025-01-17' },
  '서울시': { memberSlow: 324.4, memberFast: 324.4, nonMemberSlow: 324.4, nonMemberFast: 324.4, updatedAt: '2024-10-21' },
  '서울씨엔지': { memberSlow: 278, memberFast: 347.2, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2025-04-10' },
  '선광시스템': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '성민기업': { memberSlow: 280, memberFast: 325, nonMemberSlow: 440, nonMemberFast: 460, updatedAt: '2025-02-17' },
  '소프트베리': { memberSlow: 260, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '스타코프': { memberSlow: 230, memberFast: 340, nonMemberSlow: 370, nonMemberFast: 450, updatedAt: '2025-06-23' },
  '신세계아이앤씨': { memberSlow: 269, memberFast: 324, nonMemberSlow: 455, nonMemberFast: 455, updatedAt: '2024-12-10' },
  '씨어스': { memberSlow: 324, memberFast: 348, nonMemberSlow: 324, nonMemberFast: 348, updatedAt: '2023-11-15' },
  '아론': { memberSlow: 290, memberFast: null, nonMemberSlow: 290, nonMemberFast: null, updatedAt: '2025-06-04' },
  '아마노코리아': { memberSlow: 276, memberFast: 340, nonMemberSlow: 440, nonMemberFast: 440, updatedAt: '2023-11-15' },
  '아우토크립트': { memberSlow: null, memberFast: 320, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2025-07-17' },
  '아이마켓코리아': { memberSlow: 240, memberFast: 324.4, nonMemberSlow: 240, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '아이온커뮤니케이션즈': { memberSlow: 295, memberFast: null, nonMemberSlow: 360, nonMemberFast: null, updatedAt: '2025-06-18' },
  '아이파킹': { memberSlow: 285, memberFast: 345, nonMemberSlow: 400, nonMemberFast: 450, updatedAt: '2025-07-01' },
  '에버온': { memberSlow: 296, memberFast: 324.4, nonMemberSlow: 380, nonMemberFast: 380, updatedAt: '2025-03-14' },
  '에스에스기전': { memberSlow: 280, memberFast: 300, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2024-01-29' },
  '에스이랩': { memberSlow: 230, memberFast: null, nonMemberSlow: 340, nonMemberFast: null, updatedAt: '2025-02-04' },
  '엔비플러스': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-10-21' },
  '엘쓰리일렉트릭파워': { memberSlow: 269, memberFast: 350, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2024-02-14' },
  '온스테이션': { memberSlow: 295, memberFast: 340, nonMemberSlow: 420, nonMemberFast: 420, updatedAt: '2025-11-06' },
  '유니이브이': { memberSlow: 234, memberFast: null, nonMemberSlow: 324.4, nonMemberFast: null, updatedAt: '2024-01-31' },
  '유플러스아이티': { memberSlow: 290, memberFast: 320, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2025-11-24' },
  '이브이루씨': { memberSlow: 292, memberFast: 340, nonMemberSlow: 350, nonMemberFast: 450, updatedAt: '2025-10-01' },
  '이브이모드코리아': { memberSlow: 290, memberFast: null, nonMemberSlow: 400, nonMemberFast: null, updatedAt: '2026-01-02' },
  '이브이시스': { memberSlow: 250, memberFast: 380, nonMemberSlow: 500, nonMemberFast: 500, updatedAt: '2024-11-08' },
  '이브이파트너스': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 340, nonMemberFast: 400, updatedAt: '2024-11-06' },
  '이앤에이치에너지': { memberSlow: 245, memberFast: 324.4, nonMemberSlow: 350, nonMemberFast: 350, updatedAt: '2025-03-05' },
  '이엘일렉트릭': { memberSlow: 260, memberFast: 320, nonMemberSlow: 480, nonMemberFast: 480, updatedAt: '2024-03-20' },
  '이웨이브': { memberSlow: 250, memberFast: 347.2, nonMemberSlow: 430, nonMemberFast: 430, updatedAt: '2024-10-21' },
  '이지차저': { memberSlow: 289, memberFast: 350, nonMemberSlow: 450, nonMemberFast: 450, updatedAt: '2025-05-09' },
  '이카플러그': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 440, nonMemberFast: 440, updatedAt: '2024-10-24' },
  '일렉트리': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-04-12' },
  '제주전기자동차서비스': { memberSlow: 280, memberFast: 320, nonMemberSlow: 480, nonMemberFast: 480, updatedAt: '2023-11-16' },
  '지에스커넥트': { memberSlow: 227, memberFast: 324.4, nonMemberSlow: 347.2, nonMemberFast: 347.2, updatedAt: '2023-11-16' },
  '차밥스': { memberSlow: 280, memberFast: 400, nonMemberSlow: 324.4, nonMemberFast: 400, updatedAt: '2025-01-07' },
  '차지인': { memberSlow: 292.0, memberFast: 312.5, nonMemberSlow: 450.0, nonMemberFast: 450.0, updatedAt: '2023-11-16' },
  '채비': { memberSlow: 275, memberFast: 430, nonMemberSlow: 590, nonMemberFast: 590, updatedAt: '2025-11-13' },
  '쿨사인': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2024-05-10' },
  '크로커스': { memberSlow: 242, memberFast: 330, nonMemberSlow: 360, nonMemberFast: 380, updatedAt: '2024-04-12' },
  '클린일렉스': { memberSlow: 295, memberFast: 370, nonMemberSlow: 590, nonMemberFast: 590, updatedAt: '2026-01-02' },
  '타디스테크놀로지': { memberSlow: 242.1, memberFast: 323, nonMemberSlow: 430, nonMemberFast: 430, updatedAt: '2023-11-16' },
  '투이스이브이씨': { memberSlow: 280, memberFast: 300, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2023-11-16' },
  '파워큐브': { memberSlow: 295, memberFast: 344.4, nonMemberSlow: 295, nonMemberFast: 344.4, updatedAt: '2025-02-17' },
  '플러그링크': { memberSlow: 324.4, memberFast: 324.4, nonMemberSlow: 0, nonMemberFast: 0, updatedAt: '2025-12-23' },
  '피라인모터스': { memberSlow: 250, memberFast: 300, nonMemberSlow: 250, nonMemberFast: 320, updatedAt: '2025-02-19' },
  '한국EV충전서비스센터': { memberSlow: 400, memberFast: 400, nonMemberSlow: 400, nonMemberFast: 400, updatedAt: '2024-10-21' },
  '한국전기차인프라기술': { memberSlow: 288, memberFast: 347.2, nonMemberSlow: 380, nonMemberFast: 380, updatedAt: '2025-02-26' },
  '한국전기차충전서비스': { memberSlow: 286.7, memberFast: 371, nonMemberSlow: 500, nonMemberFast: 500, updatedAt: '2023-11-15' },
  '한마음장애인복지회': { memberSlow: 324.4, memberFast: 347.2, nonMemberSlow: 324.4, nonMemberFast: 347.2, updatedAt: '2025-11-04' },
  '한화솔루션': { memberSlow: 283.8, memberFast: 352, nonMemberSlow: 357.5, nonMemberFast: 528, updatedAt: '2026-01-20' },
  '해피차지': { memberSlow: 308, memberFast: 347.2, nonMemberSlow: 308, nonMemberFast: 430, updatedAt: '2024-10-21' },
  '현대엔지니어링': { memberSlow: 292, memberFast: 368, nonMemberSlow: 450, nonMemberFast: 500, updatedAt: '2025-09-01' },
  '홈앤서비스': { memberSlow: 227, memberFast: null, nonMemberSlow: 260, nonMemberFast: null, updatedAt: '2023-11-15' },
  '휴맥스이브이': { memberSlow: 280, memberFast: 320, nonMemberSlow: 480, nonMemberFast: 480, updatedAt: '2023-11-16' },
  '휴맥스EV': { memberSlow: 280, memberFast: 320, nonMemberSlow: 480, nonMemberFast: 480, updatedAt: '2023-11-16' },
  // 별칭 매핑 (API 이름이 다를 수 있음)
  'NI인포유': { memberSlow: 324, memberFast: 350, nonMemberSlow: 324, nonMemberFast: 350, updatedAt: '2026-01-09' },
  '대영채비': { memberSlow: 275, memberFast: 430, nonMemberSlow: 590, nonMemberFast: 590, updatedAt: '2025-11-13' },
  'E1': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 450, updatedAt: '2024-11-15' },
  'SK시그넷': { memberSlow: null, memberFast: 347.2, nonMemberSlow: null, nonMemberFast: 347.2, updatedAt: '2024-05-08' },
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
