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

type PlayerId = 'lu' | 'west' | 'daphne' | 'snow' | 'kat' | 'fei' | 'boss';

type Player = {
  id: PlayerId;
  position: number;
  lastRoll: number | null;
  metBoss: boolean;
  katUsed: boolean;
  westMarked: boolean;
  hasMoved: boolean;
};

type GameState = {
  players: Record<PlayerId, Player>;
  stacks: PlayerId[][];
  round: number;
  queue: PlayerId[];
  bossActive: boolean;
  finished: boolean;
  winner: PlayerId | null;
};

type MoveEvent = {
  id: PlayerId;
  round: number;
  roll: number;
  from: number;
  to: number;
  carried: PlayerId[];
  label: string;
};

const trackLength = 32;
const finish = 32;
const advanceCells = new Set([3, 11, 16, 23]);
const blockCells = new Set([10, 28]);
const timeCells = new Set([5, 20]);
const playerIds: PlayerId[] = ['lu', 'west', 'daphne', 'snow', 'kat', 'fei'];
const allIds: PlayerId[] = [...playerIds, 'boss'];

const names: Record<PlayerId, string> = {
  lu: '陸・赫斯',
  west: '西格莉卡',
  daphne: '達妮婭',
  snow: '緋雪',
  kat: '卡提希婭',
  fei: '菲比',
  boss: '布大王',
};

const skillNames: Record<Exclude<PlayerId, 'boss'>, string> = {
  lu: '來顆糖吧',
  west: '日靈，幫幫忙',
  daphne: '好事成雙',
  snow: '引路白鳥',
  kat: '翻盤橋段',
  fei: '歲主庇佑',
};

const colors: Record<PlayerId, string> = {
  lu: '#75ba78',
  west: '#5f91dd',
  daphne: '#d9a244',
  snow: '#8e75d8',
  kat: '#df7184',
  fei: '#36aab3',
  boss: '#7e4aac',
};

const seeded = (() => {
  let seed = 20260509;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();

const rand = () => seeded();
const rollDie = () => Math.floor(rand() * 3) + 1;
const rollBossDie = () => Math.floor(rand() * 6) + 1;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const shuffle = <T,>(items: T[]) => {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

const createGame = (): GameState => {
  const stacks = Array.from({length: trackLength + 1}, () => [] as PlayerId[]);
  const players = Object.fromEntries(
    allIds.map((id) => [
      id,
      {
        id,
        position: id === 'boss' ? finish : 1,
        lastRoll: null,
        metBoss: false,
        katUsed: false,
        westMarked: false,
        hasMoved: false,
      },
    ])
  ) as Record<PlayerId, Player>;
  const firstQueue = shuffle(playerIds);
  stacks[1].push(...[...firstQueue].reverse());

  return {
    players,
    stacks,
    round: 1,
    queue: firstQueue,
    bossActive: false,
    finished: false,
    winner: null,
  };
};

const markWest = (state: GameState) => {
  for (const id of playerIds) state.players[id].westMarked = false;
  const west = state.players.west;
  if (state.round === 1) return;
  const ranking = getRaceRanking(state);
  const westRank = ranking.indexOf('west');
  if (westRank <= 0) return;
  const targets = ranking.slice(Math.max(0, westRank - 2), westRank);
  for (const id of targets) state.players[id].westMarked = true;
};

const getRaceRanking = (state: GameState) =>
  playerIds
    .filter((id) => state.players[id].position < finish)
    .sort((a, b) => compareStanding(state, a, b));

const compareStanding = (state: GameState, a: PlayerId, b: PlayerId) => {
  const diff = state.players[b].position - state.players[a].position;
  if (diff !== 0) return diff;
  const stack = state.stacks[state.players[a].position] || [];
  const aIndex = stack.indexOf(a);
  const bIndex = stack.indexOf(b);
  if (aIndex >= 0 && bIndex >= 0) return bIndex - aIndex;
  return playerIds.indexOf(a) - playerIds.indexOf(b);
};

const beginRound = (state: GameState) => {
  if (state.round === 3 && !state.bossActive) {
    state.bossActive = true;
    state.stacks[finish].unshift('boss');
  }
  markWest(state);
  state.queue = shuffle([
    ...playerIds,
    ...(state.bossActive ? (['boss'] as PlayerId[]) : []),
  ]);
};

const moveStack = (state: GameState, id: PlayerId, delta: number) => {
  const from = state.players[id].position;
  if (id === 'boss') {
    const to = clamp(from + delta, 1, finish);
    const carried = takeBossStack(state, from);
    moveBossGroupAlongPath(state, carried, from, to);
    return {from, to, carried};
  }
  const stack = state.stacks[from];
  const index = stack.indexOf(id);
  if (index < 0) {
    const carried = [id];
    const to = clamp(from + delta, 1, finish);
    landStack(state, to, carried, id);
    state.players[id].position = to;
    return {from, to, carried};
  }
  const carried = stack.splice(index);
  const to = clamp(from + delta, 1, finish);
  landStack(state, to, carried, id);
  for (const pid of carried) state.players[pid].position = to;
  if (state.bossActive && carried.some((pid) => pid !== 'boss') && state.stacks[to].includes('boss')) {
    for (const pid of carried) {
      if (pid !== 'boss') state.players[pid].metBoss = true;
    }
  }
  return {from, to, carried};
};

const landStack = (state: GameState, to: number, carried: PlayerId[], leader: PlayerId) => {
  if (leader === 'boss') state.stacks[to].unshift(...carried);
  else state.stacks[to].push(...carried);
};

const moveGroup = (state: GameState, ids: PlayerId[], delta: number) => {
  const from = state.players[ids[0]].position;
  if (ids[0] === 'boss') {
    removeIdsFromStack(state.stacks[from], ids);
    moveBossGroupAlongPath(state, ids, from, clamp(from + delta, 1, finish));
    return;
  }
  const stack = state.stacks[from];
  const first = Math.min(...ids.map((id) => stack.indexOf(id)).filter((i) => i >= 0));
  const group = stack.splice(first, ids.length);
  const to = clamp(from + delta, 1, finish);
  state.stacks[to].push(...group);
  for (const id of group) state.players[id].position = to;
};

const takeBossStack = (state: GameState, from: number) => {
  const stack = state.stacks[from];
  const bossIndex = stack.indexOf('boss');
  const aboveBoss = bossIndex >= 0 ? stack.slice(bossIndex + 1).filter((pid) => state.players[pid].position < finish) : [];
  const carried: PlayerId[] = ['boss', ...aboveBoss];
  removeIdsFromStack(stack, carried);
  return carried;
};

const moveBossGroupAlongPath = (state: GameState, carried: PlayerId[], from: number, to: number) => {
  if (!carried.includes('boss')) carried.unshift('boss');
  const dir = to >= from ? 1 : -1;
  for (let position = from + dir; dir > 0 ? position <= to : position >= to; position += dir) {
    const stack = state.stacks[position];
    const picked = stack.filter((pid) => pid !== 'boss' && state.players[pid].position < finish);
    if (picked.length) {
      removeIdsFromStack(stack, picked);
      const aboveBoss = carried.filter((pid) => pid !== 'boss');
      carried.splice(0, carried.length, 'boss', ...picked, ...aboveBoss);
      for (const pid of picked) state.players[pid].metBoss = true;
    }
    for (const pid of carried) state.players[pid].position = position;
  }
  state.stacks[to].unshift(...carried);
};

const removeIdsFromStack = (stack: PlayerId[], ids: PlayerId[]) => {
  const idSet = new Set(ids);
  for (let i = stack.length - 1; i >= 0; i--) {
    if (idSet.has(stack[i])) stack.splice(i, 1);
  }
};

const openRift = (state: GameState, position: number) => {
  const stack = state.stacks[position];
  const hasBoss = stack.includes('boss');
  const mixed = shuffle(stack.splice(0).filter((id) => id !== 'boss'));
  if (hasBoss) stack.push('boss');
  stack.push(...mixed);
};

const isLast = (state: GameState, id: PlayerId) => {
  const ranking = getRaceRanking(state);
  return ranking.length > 1 && ranking[ranking.length - 1] === id;
};

const step = (state: GameState): MoveEvent => {
  if (state.queue.length === 0) beginRound(state);
  const id = state.queue.shift() as PlayerId;
  const player = state.players[id];
  const roll = id === 'boss' ? rollBossDie() : rollDie();
  let delta = id === 'boss' ? -roll : roll;
  const parts = [`${names[id]} 擲出 ${roll}`];

  if (id !== 'boss') {
    if (id === 'daphne' && player.lastRoll === roll) {
      delta += 2;
      parts.push(`${skillNames.daphne}：連骰同點 +2`);
    }
    if (id === 'snow' && player.metBoss) {
      delta += 1;
      parts.push(`${skillNames.snow}：遇過布大王 +1`);
    }
    if (id === 'fei' && rand() < 0.5) {
      delta += 1;
      parts.push(`${skillNames.fei}：額外前進 +1`);
    }
    if (id === 'kat' && player.katUsed && rand() < 0.6) {
      delta += 2;
      parts.push(`${skillNames.kat}：落後奮起 +2`);
    }
    if (player.westMarked) {
      delta = Math.max(0, delta - 1);
      parts.push(`${skillNames.west}：標記 -1`);
    }
  }

  player.lastRoll = roll;
  const moved = moveStack(state, id, delta);
  if (moved.to < finish) {
    if (advanceCells.has(moved.to)) {
      const bonus = id === 'lu' ? 3 : 1;
      parts.push(id === 'lu' ? `${skillNames.lu}：推進 +${bonus}` : `推進 +${bonus}`);
      moveGroup(state, moved.carried, bonus);
      moved.to = state.players[id].position;
    } else if (blockCells.has(moved.to)) {
      const penalty = id === 'lu' ? -2 : -1;
      parts.push(id === 'lu' ? `${skillNames.lu}：阻退 ${penalty}` : `阻退 ${penalty}`);
      moveGroup(state, moved.carried, penalty);
      moved.to = state.players[id].position;
    } else if (id !== 'boss' && timeCells.has(moved.to)) {
      openRift(state, moved.to);
      parts.push('時空裂隙');
    }
  }
  player.hasMoved = true;
  if (id === 'kat' && !player.katUsed && player.position < finish && isLast(state, id)) {
    player.katUsed = true;
    parts.push(`${skillNames.kat}：落後狀態啟動`);
  }

  const winners = playerIds.filter((pid) => state.players[pid].position >= finish);
  if (winners.length) {
    state.finished = true;
    state.winner = winners[0];
    parts.push(`${names[state.winner]} 到達終點`);
  }
  if (state.queue.length === 0) {
    applyBossReturnIfPassed(state);
    state.round += 1;
  }

  return {
    id,
    round: state.round,
    roll,
    from: moved.from,
    to: moved.to,
    carried: moved.carried,
    label: parts.join('｜'),
  };
};

const applyBossReturnIfPassed = (state: GameState) => {
  if (!state.bossActive || state.players.boss.position === finish) return;
  const boss = state.players.boss;
  const stack = state.stacks[boss.position];
  const bossIndex = stack.indexOf('boss');
  if (bossIndex < 0) return;
  if (bossIndex < stack.length - 1) return;
  const last = playerIds
    .map((id) => state.players[id])
    .sort((a, b) => a.position - b.position)[0];
  if (!last || last.position <= boss.position) return;
  stack.splice(bossIndex, 1);
  state.stacks[finish].unshift('boss');
  boss.position = finish;
};

const buildTimeline = () => {
  const state = createGame();
  const events: MoveEvent[] = [];
  for (let i = 0; i < 22 && !state.finished; i++) events.push(step(state));
  return events;
};

const timeline = buildTimeline();

const cellPoint = (position: number) => {
  if (position <= 0) return cellPoint(1);
  const angle = -Math.PI / 2 + (Math.PI * 2 * (position - 1)) / trackLength;
  const rx = 720;
  const ry = 285;
  return {
    x: 960 + Math.cos(angle) * rx,
    y: 640 + Math.sin(angle) * ry,
  };
};

const lerpCell = (from: number, to: number, progress: number) => {
  const dir = to >= from ? 1 : -1;
  const distance = Math.abs(to - from);
  if (distance === 0) return cellPoint(to);
  const exact = from + dir * Math.min(distance, Math.floor(progress * distance));
  const next = clamp(exact + dir, 0, finish);
  const local = (progress * distance) % 1;
  const a = cellPoint(exact);
  const b = cellPoint(next);
  return {
    x: interpolate(local, [0, 1], [a.x, b.x]),
    y: interpolate(local, [0, 0.5, 1], [a.y, Math.min(a.y, b.y) - 42, b.y]),
  };
};

const positionFor = (id: PlayerId, eventIndex: number, phase: number) => {
  let pos = id === 'boss' ? finish : 1;
  let stackLevel = id === 'boss' ? -1 : playerIds.indexOf(id);
  for (let i = 0; i <= eventIndex && i < timeline.length; i++) {
    const ev = timeline[i];
    if (ev.carried.includes(id)) {
      if (i === eventIndex) {
        const p = lerpCell(ev.from, ev.to, phase);
        return {point: p, stackLevel: ev.carried.indexOf(id), active: true};
      }
      pos = ev.to;
      stackLevel = ev.carried.indexOf(id);
    }
  }
  return {point: cellPoint(pos), stackLevel, active: false};
};

const Dice = ({roll, localFrame, fps}: {roll: number; localFrame: number; fps: number}) => {
  const spin = interpolate(localFrame, [0, 0.7 * fps], [0, 720], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const bounce = interpolate(localFrame, [0, 0.22 * fps, 0.45 * fps, 0.7 * fps], [0, -70, 18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 852,
        top: 406 + bounce,
        width: 170,
        height: 170,
        borderRadius: 26,
        background: '#fffdf8',
        border: '8px solid #2d4054',
        display: 'grid',
        placeItems: 'center',
        fontSize: 78,
        fontWeight: 900,
        color: '#2d4054',
        transform: `rotate(${spin}deg) scale(${interpolate(localFrame, [0, 0.25 * fps, fps], [0.72, 1.12, 1], {extrapolateRight: 'clamp'})})`,
        boxShadow: '0 28px 50px rgba(36, 45, 66, 0.24)',
      }}
    >
      {roll}
    </div>
  );
};

const Dango = ({id, eventIndex, phase}: {id: PlayerId; eventIndex: number; phase: number}) => {
  const {point, stackLevel, active} = positionFor(id, eventIndex, phase);
  const scale = id === 'boss' ? 0.72 : 0.62;
  const spread = getStackSpread(stackLevel, id);
  const width = id === 'boss' ? 260 : 240;
  return (
    <Img
      src={staticFile(`dangos/${id}-raw.png`)}
      style={{
        position: 'absolute',
        width,
        left: point.x - width / 2 + spread.dx,
        top: point.y - 150 - spread.lift + spread.dy,
        transform: `scale(${scale}) translateY(${active ? -8 : 0}px)`,
        transformOrigin: '50% 90%',
        filter: active ? 'drop-shadow(0 18px 12px rgba(34, 45, 64, 0.22))' : 'drop-shadow(0 12px 10px rgba(34, 45, 64, 0.16))',
        zIndex: Math.round(point.y + spread.lift),
      }}
    />
  );
};

const getStackSpread = (stackLevel: number, id: PlayerId) => {
  if (id === 'boss') return {dx: 0, dy: 18, lift: 0};
  const level = Math.max(0, stackLevel);
  return {
    dx: 0,
    dy: 0,
    lift: level * 22,
  };
};

export const DangoRace = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const introFrames = fps * 2;
  const eventFrames = fps * 2.5;
  const activeIndex = clamp(Math.floor((frame - introFrames) / eventFrames), 0, timeline.length - 1);
  const localFrame = Math.max(0, frame - introFrames - activeIndex * eventFrames);
  const moveStart = fps * 0.9;
  const rawMove = interpolate(localFrame, [moveStart, eventFrames - fps * 0.25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const ev = timeline[activeIndex];
  const titleIn = interpolate(frame, [0, fps], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #eef8fb 0%, #fff8ef 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.92), rgba(255,255,255,0) 38%)'}} />
      <div style={{position: 'absolute', left: 70, top: 54, opacity: titleIn}}>
        <div style={{fontSize: 34, color: '#607386', fontWeight: 800}}>Remotion 團子快跑</div>
        <div style={{fontSize: 82, lineHeight: 1, fontWeight: 950, color: '#243247'}}>圓形賽道擲骰動畫</div>
      </div>

      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <ellipse cx="960" cy="640" rx="760" ry="320" fill="none" stroke="#e5d8bb" strokeWidth="42" />
        <ellipse cx="960" cy="640" rx="760" ry="320" fill="none" stroke="#4b6a82" strokeWidth="7" opacity="0.32" />
        {Array.from({length: trackLength}, (_, i) => {
          const p = cellPoint(i + 1);
          const type = advanceCells.has(i + 1) ? '+' : blockCells.has(i + 1) ? '-' : timeCells.has(i + 1) ? '時' : i + 1 === finish ? '終' : '';
          const fill = type === '+' ? '#77b87d' : type === '-' ? '#df7184' : type === '時' ? '#8e75d8' : type === '終' ? '#d9a244' : '#fffdf8';
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={29} fill={fill} stroke="#2d4054" strokeWidth="5" />
              <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize={type ? 22 : 16} fontWeight="900" fill={type ? '#fff' : '#2d4054'}>
                {type || i + 1}
              </text>
            </g>
          );
        })}
        <circle cx="960" cy="898" r="56" fill="#fffdf8" stroke="#2d4054" strokeWidth="6" />
        <text x="960" y="908" textAnchor="middle" fontSize="28" fontWeight="900" fill="#2d4054">起點</text>
      </svg>

      {allIds.map((id) => (
        <Dango key={id} id={id} eventIndex={activeIndex} phase={rawMove} />
      ))}

      <Dice roll={ev.roll} localFrame={localFrame} fps={fps} />

      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 64,
          width: 560,
          minHeight: 190,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.92)',
          border: '2px solid rgba(45,64,84,0.14)',
          padding: 28,
          boxShadow: '0 22px 55px rgba(36, 45, 66, 0.14)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Img src={staticFile(`dangos/${ev.id}-raw.png`)} style={{width: 116, height: 86, objectFit: 'contain'}} />
          <div>
            <div style={{fontSize: 26, color: '#607386', fontWeight: 850}}>第 {ev.round} 回合</div>
            <div style={{fontSize: 46, color: colors[ev.id], fontWeight: 950}}>{names[ev.id]}</div>
          </div>
        </div>
        <div style={{marginTop: 16, fontSize: 30, lineHeight: 1.28, color: '#243247', fontWeight: 850}}>{ev.label}</div>
      </div>

      <div style={{position: 'absolute', left: 76, bottom: 60, display: 'flex', gap: 14}}>
        {allIds.map((id) => (
          <div key={id} style={{display: 'grid', gap: 6, justifyItems: 'center'}}>
            <Img src={staticFile(`dangos/${id}-raw.png`)} style={{width: 92, height: 72, objectFit: 'contain'}} />
            <div style={{fontSize: 20, fontWeight: 900, color: colors[id]}}>{names[id]}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
