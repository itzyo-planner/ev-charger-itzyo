export default function StatusLegend() {
  const statusItems = [
    { color: '#3B82F6', label: '사용가능' },
    { color: '#EF4444', label: '사용중' },
    { color: '#6B7280', label: '사용불가' },
    { color: '#F97316', label: '미확인' },
    { color: '#A855F7', label: '제한' },
  ];

  const powerItems = [
    { color: '#6B7280', label: '완속' },
    { color: '#3B82F6', label: '100kW' },
    { color: '#22C55E', label: '200kW' },
    { color: '#60A5FA', label: '350kW' },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1" style={{ bottom: 'calc(8px + var(--sab))' }}>
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg px-2.5 py-1.5 md:px-5 md:py-2.5 flex items-center gap-2 md:gap-5 text-[10px] md:text-xs max-w-[96vw] overflow-x-auto">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <svg width="10" height="12" viewBox="0 0 44 52" className="md:w-[14px] md:h-[17px]">
              <path d="M22 48 C22 48 40 30 40 18 C40 8 32 0 22 0 C12 0 4 8 4 18 C4 30 22 48 22 48Z"
                fill={item.color} stroke="white" strokeWidth="2"/>
            </svg>
            <span className="text-gray-700 whitespace-nowrap">{item.label}</span>
          </div>
        ))}
        <div className="w-px h-3 md:h-4 bg-gray-300 shrink-0" />
        {powerItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-gray-700 whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-white/80 backdrop-blur rounded px-2 py-0.5 text-[8px] md:text-[10px] text-gray-500 flex items-center gap-1.5">
        <span>공공데이터포털 | 한국환경공단 전기자동차 충전소 정보</span>
        <span className="text-gray-400">|</span>
        <span>공공누리 제1유형 (CC BY)</span>
      </div>
    </div>
  );
}
