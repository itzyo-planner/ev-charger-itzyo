export default function StatusLegend() {
  const statusItems = [
    { color: '#3B82F6', label: '사용가능' },
    { color: '#EF4444', label: '사용중' },
    { color: '#6B7280', label: '사용불가' },
    { color: '#F97316', label: '상태미확인' },
    { color: '#A855F7', label: '이용자제한' },
  ];

  const powerItems = [
    { color: '#6B7280', label: '50kW, 완속' },
    { color: '#3B82F6', label: '100kW' },
    { color: '#22C55E', label: '200kW' },
    { color: '#60A5FA', label: '350kW' },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur rounded-lg shadow-lg px-5 py-2.5 flex items-center gap-5 text-xs">
      {statusItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <svg width="14" height="17" viewBox="0 0 44 52">
            <path d="M22 48 C22 48 40 30 40 18 C40 8 32 0 22 0 C12 0 4 8 4 18 C4 30 22 48 22 48Z"
              fill={item.color} stroke="white" strokeWidth="2"/>
          </svg>
          <span className="text-gray-700">{item.label}</span>
        </div>
      ))}
      <div className="w-px h-4 bg-gray-300" />
      {powerItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
          <span className="text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
