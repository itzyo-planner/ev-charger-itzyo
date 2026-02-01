// OG 이미지 생성 스크립트 (1200x630)
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const width = 1200;
const height = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#DBEAFE"/>
      <stop offset="100%" stop-color="#BFDBFE"/>
    </linearGradient>
    <linearGradient id="plug" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="pin" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#4ADE80"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#00000018"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Circuit decoration -->
  <g stroke="#93C5FD" stroke-width="1.5" opacity="0.25" fill="none">
    <line x1="520" y1="60" x2="620" y2="20"/><circle cx="620" cy="20" r="4" fill="#93C5FD"/>
    <line x1="540" y1="40" x2="650" y2="10"/><circle cx="650" cy="10" r="4" fill="#93C5FD"/>
    <line x1="560" y1="80" x2="660" y2="50"/><circle cx="660" cy="50" r="4" fill="#93C5FD"/>
    <line x1="530" y1="100" x2="640" y2="90"/><circle cx="640" cy="90" r="4" fill="#93C5FD"/>
    <line x1="520" y1="140" x2="620" y2="140"/><circle cx="620" cy="140" r="4" fill="#93C5FD"/>
    <line x1="500" y1="180" x2="600" y2="190"/><circle cx="600" cy="190" r="4" fill="#93C5FD"/>
  </g>

  <!-- White circle -->
  <circle cx="430" cy="200" r="130" fill="white" filter="url(#shadow)"/>

  <!-- Blue cable -->
  <path d="M340 120 C250 120 210 200 210 240 C210 310 270 340 340 340 L510 340 C570 340 600 290 600 240 C600 195 580 155 555 120"
        fill="none" stroke="url(#plug)" stroke-width="20" stroke-linecap="round"/>

  <!-- Plug body -->
  <rect x="295" y="80" width="70" height="55" rx="12" fill="url(#plug)"/>
  <rect x="312" y="48" width="12" height="40" rx="5" fill="#CBD5E1"/>
  <rect x="340" y="48" width="12" height="40" rx="5" fill="#CBD5E1"/>

  <!-- Lightning on plug -->
  <path d="M335 88 L323 108 L335 108 L326 128 L344 104 L332 104 L342 88Z" fill="#FBBF24"/>

  <!-- Location pin -->
  <path d="M430 125 C393 125 365 155 365 190 C365 235 430 295 430 295 C430 295 495 235 495 190 C495 155 467 125 430 125Z" fill="url(#pin)"/>

  <!-- Battery in pin -->
  <rect x="405" y="165" width="50" height="35" rx="6" fill="white" opacity="0.95"/>
  <rect x="455" y="175" width="8" height="12" rx="3" fill="white" opacity="0.95"/>
  <rect x="410" y="170" width="24" height="25" rx="3" fill="#22C55E"/>
  <path d="M425 170 L418 185 L425 185 L419 195 L434 182 L426 182 L432 170Z" fill="white"/>

  <!-- EV itzyo text -->
  <text x="430" y="440" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="90">
    <tspan fill="#1E40AF">EV </tspan><tspan fill="#16A34A">it</tspan><tspan fill="#CA8A04">zyo</tspan>
  </text>

  <!-- Subtitle -->
  <text x="430" y="500" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="32" fill="#64748B">
    전기차 충전소 실시간 검색
  </text>

  <!-- URL -->
  <text x="430" y="580" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="#94A3B8">
    ev-charger-itzyo.pages.dev
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png');

console.log('og-image.png 생성 완료 (1200x630)');

// 192x192 favicon PNG도 생성
const favicon192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#DBEAFE"/>
      <stop offset="100%" stop-color="#B3D4FC"/>
    </linearGradient>
    <linearGradient id="plug2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="pin2" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#4ADE80"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="40" fill="url(#bg2)"/>
  <circle cx="102" cy="78" r="42" fill="white"/>
  <path d="M68 52 C42 52 32 76 32 90 C32 112 52 124 72 124 L126 124 C144 124 156 108 156 88 C156 72 148 58 138 52"
        fill="none" stroke="url(#plug2)" stroke-width="7" stroke-linecap="round"/>
  <rect x="52" y="38" width="24" height="20" rx="4" fill="url(#plug2)"/>
  <rect x="58" y="28" width="4" height="14" rx="2" fill="#CBD5E1"/>
  <rect x="68" y="28" width="4" height="14" rx="2" fill="#CBD5E1"/>
  <path d="M66 43 L62 49 L66 49 L63 55 L70 48 L66 48 L69 43Z" fill="#FBBF24"/>
  <path d="M102 56 C90 56 82 66 82 76 C82 90 102 108 102 108 C102 108 122 90 122 76 C122 66 114 56 102 56Z" fill="url(#pin2)"/>
  <rect x="94" y="68" width="16" height="11" rx="2" fill="white"/>
  <rect x="110" y="71" width="2.5" height="4" rx="1" fill="white"/>
  <rect x="96" y="70" width="7" height="7" rx="1" fill="#22C55E"/>
  <path d="M101 70 L99 74 L101 74 L99 77 L103 73 L101 73 L103 70Z" fill="white"/>
  <text x="96" y="156" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="20">
    <tspan fill="#1E40AF">EV</tspan><tspan fill="#1E40AF" font-size="6"> </tspan><tspan fill="#16A34A">it</tspan><tspan fill="#CA8A04">zyo</tspan>
  </text>
</svg>`;

await sharp(Buffer.from(favicon192))
  .resize(192, 192)
  .png()
  .toFile('public/icon-192.png');

await sharp(Buffer.from(favicon192))
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png');

console.log('icon-192.png, icon-512.png 생성 완료');
