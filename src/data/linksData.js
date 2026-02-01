// 프로필 정보
export const profile = {
  name: 'ITZYO',
  bio: '전기차 충전 솔루션 & 액세서리 전문',
  avatar: null, // URL을 넣으면 프로필 이미지 표시
};

// 소셜 링크
export const socialLinks = [
  {
    id: 1,
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://instagram.com/',
    icon: 'instagram',
  },
  {
    id: 2,
    platform: 'youtube',
    label: 'YouTube',
    url: 'https://youtube.com/',
    icon: 'youtube',
  },
];

// 일반 링크
export const links = [
  {
    id: 1,
    title: '전기차 충전소 찾기',
    description: '내 주변 충전소를 실시간으로 검색하세요',
    url: '/map',
    icon: '⚡',
  },
  {
    id: 2,
    title: '공식 블로그',
    description: '전기차 관련 최신 소식과 팁',
    url: 'https://blog.naver.com/',
    icon: '📝',
  },
  {
    id: 3,
    title: '카카오톡 문의',
    description: '1:1 상담 및 문의',
    url: 'https://pf.kakao.com/',
    icon: '💬',
  },
];

// 판매 상품
export const products = [
  {
    id: 1,
    name: '휴대용 전기차 충전기',
    description: '가정용 콘센트에서 충전 가능한 휴대용 완속 충전기',
    price: 350000,
    image: null,
    url: 'https://smartstore.naver.com/',
    badge: '인기',
  },
  {
    id: 2,
    name: '충전 어댑터 (DC콤보 → AC3상)',
    description: '다양한 충전기 호환 어댑터',
    price: 89000,
    image: null,
    url: 'https://smartstore.naver.com/',
    badge: null,
  },
  {
    id: 3,
    name: '충전 케이블 정리 가방',
    description: '방수 소재 충전 케이블 전용 수납 가방',
    price: 29000,
    image: null,
    url: 'https://smartstore.naver.com/',
    badge: '신상',
  },
  {
    id: 4,
    name: '차량용 충전 거치대',
    description: '충전 포트에 맞는 케이블 거치대',
    price: 15000,
    image: null,
    url: 'https://smartstore.naver.com/',
    badge: null,
  },
];
