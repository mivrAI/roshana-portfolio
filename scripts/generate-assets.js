const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });

const svg = (width, height, body, extra = "") => `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.12"/>
      </feComponentTransfer>
    </filter>
    <linearGradient id="redA" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#f1164b"/>
      <stop offset="0.55" stop-color="#5b071f"/>
      <stop offset="1" stop-color="#040405"/>
    </linearGradient>
    <linearGradient id="aquaA" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#37efd7"/>
      <stop offset="0.5" stop-color="#e9ece9"/>
      <stop offset="1" stop-color="#ec1d55"/>
    </linearGradient>
    <linearGradient id="goldA" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#efae1f"/>
      <stop offset="1" stop-color="#ec1d55"/>
    </linearGradient>
    <radialGradient id="blueGlow" cx="50%" cy="35%" r="70%">
      <stop stop-color="#37efd7" stop-opacity="0.95"/>
      <stop offset="0.38" stop-color="#1f366d" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#060608"/>
    </radialGradient>
    ${extra}
  </defs>
  ${body}
</svg>`;

const assets = {
  "orbit-stripes.png": svg(960, 620, `
    <rect width="960" height="620" fill="#08090a"/>
    <rect x="112" y="95" width="736" height="430" rx="14" fill="#f4f2ee" filter="url(#softShadow)"/>
    <rect x="156" y="142" width="64" height="340" fill="#123f3b"/>
    <rect x="260" y="142" width="64" height="340" fill="#123f3b"/>
    <rect x="364" y="142" width="420" height="340" fill="#dedbd2"/>
    <rect x="0" y="0" width="960" height="620" filter="url(#grain)"/>
  `),
  "orbit-interface.png": svg(960, 620, `
    <rect width="960" height="620" fill="#0c0d12"/>
    <circle cx="660" cy="188" r="96" fill="#37efd7" opacity="0.85" filter="url(#softShadow)"/>
    <circle cx="328" cy="390" r="112" fill="#ec1d55" opacity="0.82" filter="url(#softShadow)"/>
    <rect x="112" y="88" width="736" height="444" rx="22" fill="none" stroke="#ffffff" opacity="0.08"/>
    <path d="M188 462 C330 246 486 544 748 186" fill="none" stroke="#f4f2ee" stroke-width="4" opacity="0.35"/>
    <rect x="0" y="0" width="960" height="620" filter="url(#grain)"/>
  `),
  "orbit-data.png": svg(960, 620, `
    <rect width="960" height="620" fill="#0a0714"/>
    <rect x="0" y="0" width="960" height="620" fill="url(#redA)" opacity="0.55"/>
    ${Array.from({ length: 18 }, (_, i) => {
      const x = 70 + i * 48;
      const h = 170 + (i % 6) * 48;
      return `<path d="M${x} 0 L${x - 16} ${h}" stroke="#37efd7" stroke-width="2" opacity="${0.25 + (i % 4) * 0.12}"/>`;
    }).join("")}
    <rect x="0" y="0" width="960" height="620" filter="url(#grain)"/>
  `),
  "about-portrait.png": svg(1200, 860, `
    <rect width="1200" height="860" fill="url(#redA)"/>
    <ellipse cx="585" cy="460" rx="250" ry="330" fill="#1a050c" opacity="0.84" filter="url(#softShadow)"/>
    <circle cx="594" cy="304" r="118" fill="#e7c4ce"/>
    <path d="M355 507 C455 420 735 420 840 507 L960 860 H240 Z" fill="#16020a"/>
    <path d="M337 285 C430 72 735 50 846 276 C748 198 471 200 337 285 Z" fill="#24040e"/>
    <ellipse cx="503" cy="320" rx="26" ry="14" fill="#401321"/>
    <ellipse cx="685" cy="320" rx="26" ry="14" fill="#401321"/>
    <path d="M535 405 C576 436 635 436 674 405" fill="none" stroke="#401321" stroke-width="10" stroke-linecap="round"/>
    <circle cx="220" cy="214" r="280" fill="#f1164b" opacity="0.28"/>
    <rect width="1200" height="860" filter="url(#grain)"/>
  `),
  "case-defence.png": svg(1400, 780, `
    <rect width="1400" height="780" fill="#f4f2ee"/>
    <rect x="135" y="195" width="340" height="470" rx="24" fill="#15151a" filter="url(#softShadow)"/>
    <rect x="168" y="242" width="274" height="372" rx="14" fill="#f7f7f3"/>
    <rect x="365" y="92" width="720" height="560" rx="20" fill="#15151a" filter="url(#softShadow)"/>
    <rect x="405" y="140" width="640" height="460" rx="10" fill="#f8f7f2"/>
    <rect x="920" y="150" width="330" height="495" rx="26" fill="#15151a" filter="url(#softShadow)"/>
    <rect x="958" y="202" width="254" height="374" rx="16" fill="#f8f7f2"/>
    ${Array.from({ length: 13 }, (_, i) => `<rect x="440" y="${205 + i * 28}" width="530" height="9" fill="#0b0b10" opacity="${i % 3 === 0 ? 0.22 : 0.1}"/>`).join("")}
    <rect x="440" y="205" width="530" height="96" fill="#ec1d55" opacity="0.16"/>
    <rect x="190" y="320" width="205" height="86" fill="#ec1d55" opacity="0.18"/>
    <rect x="986" y="295" width="198" height="86" fill="#ec1d55" opacity="0.18"/>
    <rect width="1400" height="780" filter="url(#grain)"/>
  `),
  "case-chivas.png": svg(1400, 780, `
    <rect width="1400" height="780" fill="#08090a"/>
    <rect x="250" y="135" width="900" height="510" fill="url(#goldA)" filter="url(#softShadow)" transform="rotate(-7 700 390)"/>
    <rect x="642" y="132" width="80" height="520" fill="#f4f2ee" opacity="0.42" transform="rotate(-7 682 392)"/>
    <path d="M420 555 C545 220 785 720 982 188" fill="none" stroke="#f4f2ee" stroke-width="7" opacity="0.28"/>
    <rect width="1400" height="780" filter="url(#grain)"/>
  `),
  "case-monument.png": svg(1400, 780, `
    <rect width="1400" height="780" fill="#dff5f1"/>
    <rect x="250" y="115" width="900" height="520" rx="30" fill="url(#aquaA)" filter="url(#softShadow)" transform="rotate(5 700 390)"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${330 + i * 78} 130 L${330 + i * 78} 650" stroke="#0a0b0d" stroke-width="2" opacity="0.11" transform="rotate(5 700 390)"/>`).join("")}
    <circle cx="1035" cy="215" r="76" fill="#efae1f" opacity="0.45"/>
    <rect width="1400" height="780" filter="url(#grain)"/>
  `),
  "case-vodafone.png": svg(1400, 780, `
    <rect width="1400" height="780" fill="#08090a"/>
    <rect width="1400" height="780" fill="url(#redA)" opacity="0.88"/>
    <circle cx="700" cy="390" r="245" fill="none" stroke="#f4f2ee" stroke-width="92" opacity="0.92"/>
    <circle cx="700" cy="390" r="108" fill="#08090a"/>
    <path d="M310 570 C480 200 780 715 1070 135" fill="none" stroke="#37efd7" stroke-width="9" opacity="0.42"/>
    <rect width="1400" height="780" filter="url(#grain)"/>
  `),
  "mini-mobile.png": svg(900, 620, `
    <rect width="900" height="620" fill="#09090c"/>
    <rect x="240" y="95" width="420" height="430" rx="26" fill="url(#redA)" filter="url(#softShadow)" transform="rotate(-4 450 310)"/>
    <rect x="250" y="104" width="400" height="72" fill="#f4f2ee" opacity="0.72" transform="rotate(-4 450 310)"/>
  `),
  "mini-editorial.png": svg(900, 620, `
    <rect width="900" height="620" fill="#060707"/>
    <rect x="150" y="148" width="610" height="330" fill="#12443f" filter="url(#softShadow)" transform="rotate(8 455 315)"/>
    <rect x="410" y="148" width="96" height="330" fill="#f4f2ee" opacity="0.62" transform="rotate(8 455 315)"/>
  `),
  "mini-ai.png": svg(900, 620, `
    <rect width="900" height="620" fill="#070810"/>
    <rect x="105" y="120" width="690" height="380" fill="#15132d" stroke="#3b6ded"/>
    ${Array.from({ length: 16 }, (_, i) => `<path d="M${130 + i * 40} 120 L${130 + i * 40} 500" stroke="#37efd7" stroke-width="2" opacity="0.26"/>`).join("")}
    <circle cx="650" cy="288" r="96" fill="#ec1d55" opacity="0.28"/>
  `),
  "mini-brand.png": svg(900, 620, `
    <rect width="900" height="620" fill="#050505"/>
    <ellipse cx="455" cy="320" rx="285" ry="150" fill="url(#goldA)" filter="url(#softShadow)"/>
    <ellipse cx="430" cy="315" rx="300" ry="150" fill="#ec1d55" opacity="0.32"/>
  `),
  "mini-commerce.png": svg(900, 620, `
    <rect width="900" height="620" fill="#050607"/>
    <rect x="260" y="110" width="305" height="410" rx="34" fill="#f4f2ee" filter="url(#softShadow)"/>
    <rect x="285" y="160" width="255" height="305" rx="22" fill="#0c5754"/>
    <rect x="480" y="220" width="220" height="350" rx="22" fill="#e8e5df" opacity="0.7"/>
  `),
  "mini-system.png": svg(900, 620, `
    <rect width="900" height="620" fill="#060607"/>
    <rect x="160" y="150" width="580" height="320" fill="#f4f2ee" filter="url(#softShadow)" transform="skewY(-6)"/>
    <rect x="345" y="132" width="38" height="350" fill="#5b071f" transform="skewY(-6)"/>
    <rect x="570" y="104" width="38" height="350" fill="#5b071f" transform="skewY(-6)"/>
  `),
  "contact-hands.png": svg(1600, 900, `
    <rect width="1600" height="900" fill="#050607"/>
    <path d="M80 565 C245 438 480 436 660 519 C740 558 726 668 639 688 C438 734 245 707 86 632 C20 602 18 612 80 565 Z" fill="#282828" opacity="0.98" filter="url(#softShadow)" transform="rotate(-8 360 590)"/>
    <path d="M860 290 C1068 240 1330 326 1502 430 C1570 471 1535 592 1451 602 C1235 628 1045 576 844 510 C748 479 758 316 860 290 Z" fill="#303030" opacity="0.86" filter="url(#softShadow)" transform="rotate(11 1160 440)"/>
    <rect x="760" y="460" width="86" height="86" fill="#ff174d"/>
    <path d="M0 650 L560 574 L1600 345 L1600 900 L0 900 Z" fill="#ffffff" opacity="0.03"/>
    <rect width="1600" height="900" filter="url(#grain)"/>
  `)
};

async function main() {
  await Promise.all(Object.entries(assets).map(([name, source]) => {
    return sharp(Buffer.from(source)).png({ compressionLevel: 9 }).toFile(path.join(outDir, name));
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
