import { useTranslation } from "../../shared/i18n/useTranslation";
import { BAIRROS } from "./map.data";
import s from "./MapPage.module.css";

const RIVER_LINES = [
  "M 40 420 Q 160 408 280 414 Q 400 420 530 408",
  "M 30 370 Q 140 358 270 364 Q 400 370 540 358",
  "M 50 310 Q 180 298 300 304 Q 420 310 540 300",
  "M 70 250 Q 190 238 320 244 Q 440 250 545 240",
  "M 100 190 Q 220 178 340 184 Q 450 190 540 182",
];

export function LisbonMapSvg({
  bairro,
  counts,
  onSelectBairro,
}: {
  bairro: string | null;
  counts: Record<string, number>;
  onSelectBairro: (name: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.mapPanel}>
      <svg
        viewBox="0 0 580 520"
        className={s.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <pattern
            id="waterLines"
            x="0"
            y="0"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="9"
              x2="9"
              y2="0"
              stroke="rgba(100,150,180,.18)"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="580" height="468" fill="#EDE6DA" />
        {RIVER_LINES.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(45,27,61,.04)"
            strokeWidth="1"
          />
        ))}

        {BAIRROS.map((b) => {
          const cls = [
            s.bairro,
            bairro === b.name && s.bairroActive,
            bairro && bairro !== b.name && s.bairroDimmed,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <g
              key={b.name}
              className={cls}
              role="button"
              tabIndex={0}
              aria-label={t("marketing:map.svg.filterByAria", {
                bairro: b.name,
              })}
              onClick={() => onSelectBairro(b.name)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectBairro(b.name);
                }
              }}
            >
              <title>{b.name}</title>
              <path
                className={s.zone}
                filter="url(#sketch)"
                d={b.path}
                fill={b.fill}
                stroke={b.stroke}
              />
              <text className={s.bairroLabel} x={b.lx} y={b.ly}>
                {b.name}
              </text>
            </g>
          );
        })}

        <path
          d="M 0 462 Q 90 450 200 455 Q 310 460 420 452 Q 500 446 580 454 L 580 520 L 0 520 Z"
          fill="#C0D8E8"
        />
        <path
          d="M 0 462 Q 90 450 200 455 Q 310 460 420 452 Q 500 446 580 454 L 580 520 L 0 520 Z"
          fill="url(#waterLines)"
        />
        <text className={s.riverLabel} x="290" y="492">
          Rio Tejo
        </text>

        {BAIRROS.filter((b) => counts[b.name]).map((b) => (
          <g key={`badge-${b.name}`} style={{ pointerEvents: "none" }}>
            <circle
              cx={b.bx}
              cy={b.by}
              r="9"
              fill="var(--accent)"
              opacity="0.9"
            />
            <text
              x={b.bx}
              y={b.by}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "var(--sans)",
                fontSize: 9,
                fontWeight: 700,
                fill: "var(--paper)",
              }}
            >
              {counts[b.name]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
