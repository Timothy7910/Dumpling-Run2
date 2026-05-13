import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type RacerId = 'lu' | 'west' | 'daphne' | 'snow' | 'kat' | 'fei' | 'boss';

type Racer = {
  id: RacerId;
  name: string;
  skill: string;
  color: string;
  image: string;
};

const trackLength = 32;
const finish = 32;
const dicePalette: Record<RacerId, {base: string; light: string; shadow: string}> = {
  lu: {base: '#36b8d8', light: '#d8fbff', shadow: '#167190'},
  west: {base: '#ee6f99', light: '#ffe0ed', shadow: '#a92c58'},
  daphne: {base: '#e7b849', light: '#fff1b8', shadow: '#a56e13'},
  snow: {base: '#55c99a', light: '#dcfff0', shadow: '#1d7d55'},
  kat: {base: '#6da9f7', light: '#e4f3ff', shadow: '#2f64ad'},
  fei: {base: '#ff875c', light: '#ffe2d3', shadow: '#b94522'},
  boss: {base: '#8e62d9', light: '#e1d3ff', shadow: '#56309a'},
};
const advanceCells = new Set([3, 11, 16, 23]);
const blockCells = new Set([10, 28]);
const timeCells = new Set([5, 20]);

const racers: Racer[] = [
  {id: 'lu', name: '陆・赫斯', skill: '来颗糖吧', color: '#69b879', image: 'lu-raw.png'},
  {id: 'west', name: '西格莉卡', skill: '日灵，帮帮忙', color: '#5f91dd', image: 'west-raw.png'},
  {id: 'daphne', name: '达妮娅', skill: '好事成双', color: '#d7a441', image: 'daphne-raw.png'},
  {id: 'snow', name: '绯雪', skill: '引路白鸟', color: '#9073d8', image: 'snow-raw.png'},
  {id: 'kat', name: '卡提希娅', skill: '翻盘桥段', color: '#df7184', image: 'kat-raw.png'},
  {id: 'fei', name: '菲比', skill: '岁主庇佑', color: '#36aeb5', image: 'fei-raw.png'},
  {id: 'boss', name: '布大王', skill: '终点追击', color: '#7b4bab', image: 'boss-raw.png'},
];

const winRates = [
  {id: 'daphne' as RacerId, name: '达妮娅', rate: 22.59},
  {id: 'fei' as RacerId, name: '菲比', rate: 19.05},
  {id: 'snow' as RacerId, name: '绯雪', rate: 18.82},
  {id: 'west' as RacerId, name: '西格莉卡', rate: 15.72},
  {id: 'kat' as RacerId, name: '卡提希娅', rate: 12.2},
  {id: 'lu' as RacerId, name: '陆・赫斯', rate: 11.62},
];

const raceOrder: RacerId[] = ['snow', 'lu', 'kat', 'daphne', 'west', 'fei'];
const getRacer = (id: RacerId) => racers.find((racer) => racer.id === id) ?? racers[0];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const trackPoint = (position: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * (position - 1)) / trackLength;
  return {
    x: 960 + Math.cos(angle) * 660,
    y: 600 + Math.sin(angle) * 285,
  };
};

const rangeProgress = (frame: number, start: number, end: number) =>
  clamp((frame - start) / (end - start), 0, 1);

const steppedPosition = (frame: number, startFrame: number, from: number, to: number) => {
  const distance = Math.max(1, Math.abs(to - from));
  const totalFrames = distance * 12;
  const progress = rangeProgress(frame, startFrame, startFrame + totalFrames);
  const eased = interpolate(progress, [0, 1], [0, 1], {easing: Easing.inOut(Easing.cubic)});
  return from + (to - from) * eased;
};

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      border: '2px solid rgba(45, 64, 84, 0.12)',
      background: 'rgba(255, 255, 255, 0.82)',
      boxShadow: '0 22px 60px rgba(37, 52, 76, 0.14)',
      borderRadius: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

const DangoImage = ({
  id,
  x,
  y,
  size = 176,
  active = false,
  stackLevel = 0,
}: {
  id: RacerId;
  x: number;
  y: number;
  size?: number;
  active?: boolean;
  stackLevel?: number;
}) => {
  const racer = getRacer(id);
  return (
    <Img
      src={staticFile(`dangos/${racer.image}`)}
      style={{
        position: 'absolute',
        width: size,
        left: x - size / 2,
        top: y - size * 0.72 - stackLevel * 30,
        transform: `translateY(${active ? -12 : 0}px) scale(${active ? 1.06 : 1})`,
        transformOrigin: '50% 85%',
        filter: active
          ? 'drop-shadow(0 18px 14px rgba(31, 45, 64, 0.26))'
          : 'drop-shadow(0 12px 12px rgba(31, 45, 64, 0.16))',
        zIndex: Math.round(y + stackLevel * 50),
      }}
    />
  );
};

const Dice = ({frame, activeId}: {frame: number; activeId: RacerId}) => {
  const rolling = frame >= 165 && frame <= 280;
  const value = rolling ? ((Math.floor(frame / 4) % 3) + 1) : frame > 280 ? 3 : '?';
  const color = dicePalette[activeId];
  const localFrame = Math.max(0, frame - 165);
  const spin = rolling
    ? interpolate(localFrame, [0, 34, 74, 115], [-38, 384, 636, 720], {extrapolateRight: 'clamp'})
    : 0;
  const y = rolling
    ? interpolate(localFrame, [0, 32, 56, 82, 115], [-220, 24, -48, 10, 0], {
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    : 0;
  const scale = rolling
    ? interpolate(localFrame, [0, 36, 64, 115], [0.7, 1.12, 0.95, 1], {extrapolateRight: 'clamp'})
    : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 850,
        top: 470 + y,
        width: 220,
        height: 220,
        border: '9px solid rgba(255,255,255,0.9)',
        borderRadius: 42,
        background: `linear-gradient(145deg, ${color.light} 0%, ${color.base} 42%, ${color.shadow} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 110,
        fontWeight: 950,
        color: '#ffffff',
        transform: `rotate(${spin}deg) scale(${scale})`,
        clipPath: 'polygon(50% 0%, 88% 14%, 100% 50%, 82% 88%, 50% 100%, 14% 86%, 0% 50%, 15% 13%)',
        textShadow: '0 5px 0 rgba(0,0,0,0.24), 0 -2px 0 rgba(255,255,255,0.72)',
        boxShadow: `inset 0 11px 0 rgba(255,255,255,0.28), inset 0 -15px 0 rgba(35,34,72,0.22), 0 13px 0 ${color.shadow}, 0 34px 64px rgba(33,49,70,0.28)`,
      }}
    >
      {value}
    </div>
  );
};

const Track = ({frame}: {frame: number}) => {
  const boardIn = fade(frame, 40, 95);
  const moving = frame >= 145;
  const activeIndex = clamp(Math.floor((frame - 150) / 54), 0, raceOrder.length - 1);
  const activeId = raceOrder[activeIndex];
  const basePositions: Record<RacerId, number> = {
    snow: steppedPosition(frame, 160, 1, 7),
    lu: steppedPosition(frame, 212, 1, 5),
    kat: steppedPosition(frame, 262, 1, 4),
    daphne: steppedPosition(frame, 316, 1, 8),
    west: steppedPosition(frame, 370, 1, 3),
    fei: steppedPosition(frame, 424, 1, 6),
    boss: steppedPosition(frame, 475, finish, 27),
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: boardIn}}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <ellipse cx="960" cy="600" rx="705" ry="325" fill="none" stroke="#e6d7b6" strokeWidth="52" />
        <ellipse cx="960" cy="600" rx="705" ry="325" fill="none" stroke="#3f5872" strokeWidth="7" opacity="0.28" />
        {Array.from({length: trackLength}, (_, index) => {
          const cell = index + 1;
          const point = trackPoint(cell);
          const label =
            cell === finish
              ? '终'
              : advanceCells.has(cell)
                ? '+'
                : blockCells.has(cell)
                  ? '-'
                  : timeCells.has(cell)
                    ? '时'
                    : String(cell);
          const fill =
            cell === finish
              ? '#d8a641'
              : advanceCells.has(cell)
                ? '#74bb7d'
                : blockCells.has(cell)
                  ? '#df6f83'
                  : timeCells.has(cell)
                    ? '#8a73d7'
                    : '#fffdf8';
          return (
            <g key={cell}>
              <circle cx={point.x} cy={point.y} r={31} fill={fill} stroke="#26384d" strokeWidth="6" />
              <text
                x={point.x}
                y={point.y + 9}
                textAnchor="middle"
                fontSize={label.length > 1 ? 17 : 24}
                fontWeight={950}
                fill={label === String(cell) ? '#26384d' : '#fff'}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {raceOrder.map((id, index) => {
        const point = trackPoint(basePositions[id]);
        const isStartStack = !moving;
        return (
          <DangoImage
            key={id}
            id={id}
            x={point.x}
            y={point.y}
            active={activeId === id && moving}
            stackLevel={isStartStack ? raceOrder.length - index - 1 : 0}
          />
        );
      })}
      {frame > 470 ? <DangoImage id="boss" x={trackPoint(basePositions.boss).x} y={trackPoint(basePositions.boss).y} size={210} active={frame < 570} /> : null}
      <Dice frame={frame} activeId={activeId} />
    </div>
  );
};

const FeaturePanel = ({frame}: {frame: number}) => {
  const opacity = fade(frame, 95, 135) * (1 - fade(frame, 470, 520));
  const pulse = 1 + Math.sin(frame * 0.18) * 0.015;
  return (
    <Card style={{position: 'absolute', left: 86, top: 710, width: 560, padding: 30, opacity}}>
      <div style={{fontSize: 30, color: '#607386', fontWeight: 800}}>可玩版规则</div>
      <div style={{fontSize: 58, lineHeight: 1.05, fontWeight: 950, color: '#223149', marginTop: 10}}>
        掷骰后逐格前进
      </div>
      <div style={{fontSize: 28, lineHeight: 1.55, color: '#405873', fontWeight: 700, marginTop: 18}}>
        32格圆形赛道，团子会堆叠；下方团子行动时，会带着上方团子一起冲刺。
      </div>
      <div
        style={{
          marginTop: 22,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 28,
          fontWeight: 900,
          color: '#fff',
          background: '#223149',
          borderRadius: 999,
          padding: '13px 22px',
          transform: `scale(${pulse})`,
        }}
      >
        技能触发会跳出明确提示
      </div>
    </Card>
  );
};

const SkillToast = ({frame}: {frame: number}) => {
  const local = frame - 268;
  const opacity = fade(local, 0, 12) * (1 - fade(local, 78, 96));
  const y = interpolate(opacity, [0, 1], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Card
      style={{
        position: 'absolute',
        left: 1260,
        top: 166 + y,
        width: 470,
        padding: 26,
        opacity,
        borderColor: 'rgba(105, 184, 121, 0.55)',
      }}
    >
      <div style={{fontSize: 28, fontWeight: 900, color: '#69b879'}}>陆・赫斯发动技能</div>
      <div style={{fontSize: 52, lineHeight: 1.08, fontWeight: 950, color: '#223149', marginTop: 8}}>
        来颗糖吧
      </div>
      <div style={{fontSize: 26, color: '#4b657f', fontWeight: 700, marginTop: 12}}>
        触发推进格，额外前进3格。
      </div>
    </Card>
  );
};

const WinRatePanel = ({frame}: {frame: number}) => {
  const opacity = fade(frame, 520, 570);
  const barProgress = fade(frame, 585, 690);
  return (
    <Card style={{position: 'absolute', right: 88, top: 170, width: 590, padding: 30, opacity, zIndex: 2200}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontSize: 34, fontWeight: 950, color: '#223149'}}>胜率预测</div>
        <div style={{fontSize: 24, color: '#607386', fontWeight: 800}}>50000场快速模拟</div>
      </div>
      <div style={{marginTop: 24, display: 'grid', gap: 18}}>
        {winRates.map((item, index) => {
          const racer = getRacer(item.id);
          const width = `${interpolate(barProgress, [0, 1], [0, item.rate * 3.6], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: ease,
          })}%`;
          return (
            <div key={item.id} style={{display: 'grid', gridTemplateColumns: '54px 86px 1fr', gap: 16, alignItems: 'center'}}>
              <div style={{fontSize: 28, fontWeight: 950, color: '#607386'}}>#{index + 1}</div>
              <Img
                src={staticFile(`dangos/${racer.image}`)}
                style={{
                  width: 86,
                  height: 58,
                  objectFit: 'cover',
                  borderRadius: 8,
                  boxShadow: '0 8px 16px rgba(31,45,64,0.14)',
                }}
              />
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: 28, fontWeight: 950, color: '#223149'}}>{item.name}</span>
                  <span style={{fontSize: 28, fontWeight: 950, color: '#223149'}}>{item.rate.toFixed(2)}%</span>
                </div>
                <div style={{height: 14, borderRadius: 999, background: '#edf3f5', marginTop: 10, overflow: 'hidden'}}>
                  <div style={{height: '100%', width, background: racer.color, borderRadius: 999}} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const TitleBlock = ({frame}: {frame: number}) => {
  const intro = 1 - fade(frame, 105, 145);
  const compact = fade(frame, 110, 155);
  return (
    <div
      style={{
        position: 'absolute',
        left: interpolate(compact, [0, 1], [120, 72]),
        top: interpolate(compact, [0, 1], [118, 52]),
        opacity: fade(frame, 0, 40),
      }}
    >
      <div style={{fontSize: interpolate(compact, [0, 1], [46, 30]), fontWeight: 900, color: '#607386'}}>
        鸣潮 3.3 · 二周年活动自制演示
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: interpolate(compact, [0, 1], [126, 70]),
          lineHeight: 0.96,
          fontWeight: 950,
          color: '#223149',
        }}
      >
        团子快跑
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 36,
          lineHeight: 1.35,
          width: 720,
          color: '#405873',
          fontWeight: 750,
          opacity: intro,
        }}
      >
        把团子终点赛规则做成网页可玩版，并用大量模拟估算每个团子的夺冠概率。
      </div>
    </div>
  );
};

const Closing = ({frame}: {frame: number}) => {
  const opacity = fade(frame, 735, 790);
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none', zIndex: 2300}}>
      <div style={{position: 'absolute', left: 110, bottom: 92}}>
        <div style={{fontSize: 32, fontWeight: 900, color: '#607386'}}>玩家自制内容</div>
        <div style={{fontSize: 72, lineHeight: 1.05, fontWeight: 950, color: '#223149', marginTop: 10}}>
          打开网页，直接开跑
        </div>
      </div>
      <Card style={{position: 'absolute', right: 98, bottom: 86, width: 650, padding: 30}}>
        <div style={{fontSize: 32, color: '#223149', fontWeight: 950}}>影片展示内容</div>
        <div style={{fontSize: 27, lineHeight: 1.55, color: '#405873', fontWeight: 750, marginTop: 12}}>
          可玩版、骰子动画、逐格移动、堆叠带走、布大王追击，以及一键胜率预测。
        </div>
      </Card>
    </div>
  );
};

export const PromoVideo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const glow = 0.5 + Math.sin((frame / fps) * Math.PI) * 0.12;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #eef9fb 0%, #fff9ef 100%)',
        overflow: 'hidden',
        fontFamily: '"Microsoft JhengHei", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 54% 52%, rgba(255,255,255,${glow}), rgba(255,255,255,0) 42%)`,
        }}
      />
      <Track frame={frame} />
      <TitleBlock frame={frame} />
      <FeaturePanel frame={frame} />
      <SkillToast frame={frame} />
      <WinRatePanel frame={frame} />
      <Closing frame={frame} />
    </AbsoluteFill>
  );
};
