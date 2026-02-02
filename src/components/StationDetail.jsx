import { CHARGER_TYPES } from '../data/mockChargers'
import { getPricing, formatPrice } from '../data/pricing'

const STATUS_LABEL = {
  available: '충전가능',
  in_use: '충전중',
  unavailable: '사용불가',
  unknown: '상태미확인',
  restricted: '이용자제한',
};

const STATUS_STYLE = {
  available: 'bg-blue-600 text-white',
  in_use: 'bg-green-600 text-white',
  unavailable: 'bg-gray-400 text-white',
  unknown: 'bg-orange-500 text-white',
  restricted: 'bg-purple-500 text-white',
};

function formatDateTime(dt) {
  if (!dt || dt.length < 14) return '';
  return `${dt.slice(0,4)}.${dt.slice(4,6)}.${dt.slice(6,8)} ${dt.slice(8,10)}:${dt.slice(10,12)}`;
}

// 플랫폼 감지
function isAndroid() { return /android/i.test(navigator.userAgent); }
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }

// 내비 앱 실행 헬퍼
function openNavApp({ appScheme, androidIntent, iosAppStore, webUrl }) {
  if (isAndroid() && androidIntent) {
    window.location.href = androidIntent;
  } else if (isIOS()) {
    const start = Date.now();
    window.location.href = appScheme;
    setTimeout(() => {
      if (document.hidden) return;
      if (Date.now() - start < 2000 && iosAppStore) {
        window.location.href = iosAppStore;
      }
    }, 1500);
  } else {
    window.open(webUrl, '_blank');
  }
}

export default function StationDetail({ station, onClose }) {
  if (!station) return null;

  const chargers = station.chargers || [];
  const pricing = getPricing(station.operator);

  const openTmap = () => {
    const name = encodeURIComponent(station.name);
    openNavApp({
      appScheme: `tmap://route?goalname=${name}&goalx=${station.lng}&goaly=${station.lat}`,
      androidIntent: `intent://route?goalname=${name}&goalx=${station.lng}&goaly=${station.lat}#Intent;scheme=tmap;package=com.skt.tmap.ku;end`,
      iosAppStore: 'https://apps.apple.com/kr/app/id431589174',
      webUrl: `https://tmap.life/navigate?goalx=${station.lng}&goaly=${station.lat}&goalname=${name}`,
    });
  };

  const openNaver = () => {
    const name = encodeURIComponent(station.name);
    openNavApp({
      appScheme: `nmap://navigation?dlat=${station.lat}&dlng=${station.lng}&dname=${name}&appname=ev.itzyo`,
      androidIntent: `intent://navigation?dlat=${station.lat}&dlng=${station.lng}&dname=${name}&appname=ev.itzyo#Intent;scheme=nmap;package=com.nhn.android.nmap;end`,
      iosAppStore: 'https://apps.apple.com/kr/app/id311867728',
      webUrl: `https://map.naver.com/v5/directions/-/-/${station.lng},${station.lat},${name}/-/car`,
    });
  };

  const openKakao = () => {
    const name = encodeURIComponent(station.name);
    openNavApp({
      appScheme: `kakaomap://route?ep=${station.lat},${station.lng}&by=CAR`,
      androidIntent: `intent://route?ep=${station.lat},${station.lng}&by=CAR#Intent;scheme=kakaomap;package=net.daum.android.map;end`,
      iosAppStore: 'https://apps.apple.com/kr/app/id304608425',
      webUrl: `https://map.kakao.com/link/to/${name},${station.lat},${station.lng}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white w-full md:w-[480px] md:max-w-[90vw] max-h-[90dvh] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex-1 pr-3 leading-snug">{station.name}</h2>
          <button
            onClick={onClose}
            className="touch-btn p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="flex-1 overflow-y-auto">
          {/* 운영기관 + 이용시간 */}
          <div className="flex gap-2 px-4 py-3">
            <span className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 font-medium">
              {station.operator || '정보없음'}
            </span>
            <span className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              이용가능시간 : {station.useTime || '정보없음'}
            </span>
          </div>

          {/* 길찾기 버튼 — 충전기 위에 배치 */}
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <button
                onClick={openTmap}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold active:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                T맵
              </button>
              <button
                onClick={openNaver}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-lg py-3 text-sm font-semibold active:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                네이버내비
              </button>
              <button
                onClick={openKakao}
                className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500 text-gray-900 rounded-lg py-3 text-sm font-semibold active:bg-yellow-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                카카오맵
              </button>
            </div>
          </div>

          {/* 충전기 섹션 */}
          <div className="px-4 pb-3">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              충전기
            </h3>

            {/* 테이블 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-2 text-center font-semibold text-gray-600 w-[22%]">구분</th>
                    <th className="py-2 px-2 text-center font-semibold text-gray-600 w-[22%]">충전기 타입</th>
                    <th className="py-2 px-2 text-center font-semibold text-gray-600 w-[28%]">충전기 상태<br/><span className="text-[10px] text-gray-400">(갱신일시)</span></th>
                    <th className="py-2 px-2 text-center font-semibold text-gray-600 w-[28%]">충전기 ID<br/><span className="text-[10px] text-gray-400">(상세위치)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {chargers.length > 0 ? chargers.map((c, i) => (
                    <tr key={c.id || i} className={i > 0 ? 'border-t border-gray-100' : ''}>
                      <td className="py-2.5 px-2 text-center text-gray-700">{c.powerLabel || `${c.power}kW`}</td>
                      <td className="py-2.5 px-2 text-center text-gray-700">{c.chargerTypeLabel || CHARGER_TYPES.find(t => t.id === c.chargerType)?.label || c.chargerType}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_STYLE[c.status] || STATUS_STYLE.unknown}`}>
                          {STATUS_LABEL[c.status] || '알 수 없음'}
                        </span>
                        {c.statUpdDt && (
                          <div className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(c.statUpdDt)}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center text-gray-700">
                        <div>{c.chgerId}</div>
                        {c.kindDetail && <div className="text-[10px] text-gray-400 mt-0.5">{c.kindDetail}</div>}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">충전기 상세정보 없음</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 상세정보 섹션 */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              상세정보
            </h3>

            <div className="border-t-2 border-gray-800">
              <DetailRow label="도로명주소" value={station.address} />
              <DetailRow label="상세위치" value={station.kindDetail || '-'} />
              <DetailRow label="운영기관" value={station.operator || '-'} />
              <DetailRow label="연락처" value={station.phone || '-'} isPhone />
              <DetailRow label="충전요금" value={pricing ? '유료' : '-'} />
              {pricing && (
                <div className="flex gap-3 px-4 pb-3 text-xs border-b border-gray-100">
                  <span className="text-amber-700">회원 <b>{formatPrice(pricing.member)}/kWh</b></span>
                  <span className="text-orange-600">비회원 <b>{formatPrice(pricing.nonMember)}/kWh</b></span>
                </div>
              )}
              <DetailRow label="주차요금" value={station.parkingFree ? '무료' : '유료'} />
              <DetailRow label="참고사항" value={station.note || '없음'} />
              <DetailRow label="이용자제한" value={station.limitYn ? (station.limitDetail || '제한있음') : '제한 없음'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isPhone }) {
  return (
    <div className="flex border-b border-gray-100 min-h-[44px]">
      <div className="w-24 flex-shrink-0 flex items-center px-4 py-3 bg-gray-50">
        <span className="text-xs font-semibold text-gray-600 underline underline-offset-2">{label}</span>
      </div>
      <div className="flex-1 flex items-center px-4 py-3">
        {isPhone && value !== '-' ? (
          <a href={`tel:${value}`} className="text-xs text-blue-600 underline">{value}</a>
        ) : (
          <span className="text-xs text-gray-800">{value}</span>
        )}
      </div>
    </div>
  );
}
