const TRACK_CONFIG = window.DangoTrack.loadTrackConfig();
const TRACK_LENGTH = TRACK_CONFIG.length;
const FINISH = TRACK_CONFIG.finish;
const ADVANCE_CELLS = TRACK_CONFIG.advanceCells;
const BLOCK_CELLS = TRACK_CONFIG.blockCells;
const TIME_CELLS = TRACK_CONFIG.timeCells;
const PLAYER_IDS = ["lu", "west", "daphne", "snow", "kat", "fei"];
const ALL_IDS = [...PLAYER_IDS, "boss"];
const GROUP_STORAGE_KEY = "dango-race-group";
const DEFAULT_GROUP_ID = "b";
const PIECE_REFERENCE_STAGE_WIDTH = 1040;
const MIN_PIECE_STAGE_SCALE = 0.34;

const COLORS = {
  lu: "#75ba78",
  west: "#5f91dd",
  daphne: "#d9a244",
  snow: "#8e75d8",
  kat: "#df7184",
  fei: "#36aab3",
  boss: "#7e4aac",
};

const GROUPS = {
  a: {
    label: "A組",
    players: {
      lu: {
        name: "陸・赫斯",
        skillName: "來顆糖吧",
        note: "推進 +3，阻退再 -1",
        asset: "public/dangos/lu-raw.png",
      },
      west: {
        name: "西格莉卡",
        skillName: "日靈，幫幫忙",
        note: "每回合標記前段名次",
        asset: "public/dangos/west-raw.png",
      },
      daphne: {
        name: "達妮婭",
        skillName: "好事成雙",
        note: "連骰同點 +2",
        asset: "public/dangos/daphne-raw.png",
      },
      snow: {
        name: "緋雪",
        skillName: "引路白鳥",
        note: "遇布大王後移動 +1",
        asset: "public/dangos/snow-raw.png",
      },
      kat: {
        name: "卡提希婭",
        skillName: "翻盤橋段",
        note: "落後啟動，之後 60% 機率 +2",
        asset: "public/dangos/kat-raw.png",
      },
      fei: {
        name: "菲比",
        skillName: "歲主庇佑",
        note: "50% 機率 +1",
        asset: "public/dangos/fei-raw.png",
      },
      boss: {
        name: "布大王",
        note: "第 3 回合從終點出發",
        asset: "public/dangos/boss-raw.png",
      },
    },
  },
  b: {
    label: "B組",
    players: {
      lu: {
        name: "千咲團子",
        skillName: "視覺解明",
        note: "投骰子時，若投出的結果為本輪所有點數最小之一，則額外前進 2 格",
        asset: "public/dangos/chisa-raw.png",
      },
      west: {
        name: "莫寧團子",
        skillName: "精密演算",
        note: "投骰子時，點數將固定在 3/2/1 循環出現",
        asset: "public/dangos/moning-raw.png",
      },
      daphne: {
        name: "琳奈團子",
        skillName: "炫彩時刻！",
        note: "60% 機率按照雙倍點數移動，20% 機率當回合無法移動",
        asset: "public/dangos/linai-raw.png",
      },
      snow: {
        name: "愛彌斯團子",
        skillName: "電子幽靈登場",
        note: "經過賽程中點後，會傳送到最近團子頂端",
        asset: "public/dangos/aiyisi-raw.png",
      },
      kat: {
        name: "守岸人團子",
        skillName: "收束的未來",
        note: "骰子只會擲出 2 或 3",
        asset: "public/dangos/shorekeeper-raw.png",
      },
      fei: {
        name: "珂萊塔團子",
        skillName: "利潤加倍",
        note: "28% 機率以骰子的雙倍點數前進",
        asset: "public/dangos/cartethyia-raw.png",
      },
      boss: {
        name: "布大王",
        note: "第 3 回合從終點出發",
        asset: "public/dangos/boss-raw.png",
      },
    },
  },
};

let activeGroupId = loadActiveGroupId();
const NAMES = new Proxy({}, { get: (_, id) => playerConfig(id).name || id });
const SKILL_NAMES = new Proxy({}, { get: (_, id) => playerConfig(id).skillName || "" });
const INITIAL_NOTES = new Proxy({}, { get: (_, id) => playerConfig(id).note || "" });

let game = createGame();
let autoTimer = null;
let isAnimating = false;

const stageEl = document.querySelector("#stage");
const cellsEl = document.querySelector("#cells");
const piecesEl = document.querySelector("#pieces");
const moversEl = document.querySelector("#movers");
const diceEl = document.querySelector("#dice");
const spotlightEl = document.querySelector("#spotlight");
const skillNoticeEl = document.querySelector("#skillNotice");
const playersEl = document.querySelector("#players");
const logEl = document.querySelector("#log");
const turnInfoEl = document.querySelector("#turnInfo");
const roundInfoEl = document.querySelector("#roundInfo");
const simResultsEl = document.querySelector("#simResults");
const endModalEl = document.querySelector("#endModal");
const endRankingsEl = document.querySelector("#endRankings");
const stepButton = document.querySelector("#stepButton");
const autoButton = document.querySelector("#autoButton");
const endOkButton = document.querySelector("#endOkButton");
const groupSelectEl = document.querySelector("#groupSelect");

applyTrackBackground();
setupGroupSelect();
setupStageResizeHandler();

document.querySelector("#newGameButton").addEventListener("click", () => {
  stopAuto();
  closeEndModal();
  game = createGame();
  diceEl.textContent = "?";
  render();
});

stepButton.addEventListener("click", async () => {
  stopAuto();
  await playStep();
});

autoButton.addEventListener("click", () => {
  if (autoTimer) {
    stopAuto();
    return;
  }
  autoButton.textContent = "暫停";
  autoTimer = window.setInterval(async () => {
    if (isAnimating) return;
    await playStep();
    if (game.finished) stopAuto();
  }, 1200);
});

document.querySelector("#clearLogButton").addEventListener("click", () => {
  game.log = [];
  renderLog();
});

document.querySelector("#simulateButton").addEventListener("click", runSimulation);

endOkButton.addEventListener("click", closeEndModal);

function setupGroupSelect() {
  if (!groupSelectEl) return;
  groupSelectEl.value = activeGroupId;
  groupSelectEl.addEventListener("change", () => {
    activeGroupId = GROUPS[groupSelectEl.value] ? groupSelectEl.value : "a";
    window.localStorage?.setItem(GROUP_STORAGE_KEY, activeGroupId);
    stopAuto();
    closeEndModal();
    game = createGame();
    diceEl.textContent = "?";
    simResultsEl.innerHTML = "";
    render();
  });
}

function loadActiveGroupId() {
  const saved = window.localStorage?.getItem(GROUP_STORAGE_KEY);
  return saved === DEFAULT_GROUP_ID ? saved : DEFAULT_GROUP_ID;
}

function activeGroup() {
  return GROUPS[activeGroupId] || GROUPS.a;
}

function playerConfig(id) {
  return activeGroup().players[id] || GROUPS.a.players[id] || {};
}

function isGroupB() {
  return activeGroupId === "b";
}

function createGame() {
  const stacks = Array.from({ length: TRACK_LENGTH + 1 }, () => []);
  const players = {};
  for (const id of PLAYER_IDS) {
    players[id] = {
      id,
      position: 1,
      finished: false,
      lastRoll: null,
      metBoss: false,
      katUsed: false,
      westMarked: false,
      hasMoved: false,
    };
  }
  const firstQueue = shuffle(PLAYER_IDS);
  stacks[1].push(...[...firstQueue].reverse());
  players.boss = {
    id: "boss",
    position: FINISH,
    finished: false,
    active: false,
    lastRoll: null,
  };

  const state = {
    players,
    stacks,
    round: 1,
    queue: firstQueue,
    current: null,
    log: [`比賽開始，第一回合順序：${firstQueue.map((id) => NAMES[id]).join("、")}。起點由上到下依此順序堆疊。`],
    finished: false,
    winner: null,
    rankings: [],
    lastEvent: null,
    plannedRolls: {},
  };
  prepareRoundRolls(state);
  return state;
}

async function playStep() {
  if (isAnimating || game.finished) return;
  isAnimating = true;
  setButtons(false);
  const event = stepGame(game, true);
  if (event) {
    await animateTurn(event);
  }
  render();
  if (game.finished) {
    stopAuto();
    showEndModal();
  }
  setButtons(true);
  isAnimating = false;
}

function stepGame(state, withLog = false) {
  if (state.finished) return null;
  if (state.queue.length === 0) beginRound(state, withLog);
  const id = state.queue.shift();
  const actor = state.players[id];
  if (!actor || actor.finished) return stepGame(state, withLog);
  state.current = id;
  const event = takeTurn(state, id, withLog);
  event.newRanks = recordFinishers(state, withLog);
  if (!state.finished && state.queue.length === 0) {
    applyBossRoundEndRule(state, withLog);
    state.round += 1;
  }
  state.lastEvent = event;
  return event;
}

function beginRound(state, withLog) {
  if (state.round === 3 && !state.players.boss.active) {
    state.players.boss.active = true;
    state.stacks[FINISH].unshift("boss");
    addLog(state, "第 3 回合，布大王從終點開始往起點移動。", withLog);
  }

  for (const id of PLAYER_IDS) state.players[id].westMarked = false;
  if (!isGroupB()) markWestTargets(state, withLog);

  const active = PLAYER_IDS.filter((id) => !state.players[id].finished);
  if (state.players.boss.active) active.push("boss");
  state.queue = shuffle(active);
  prepareRoundRolls(state);
  addLog(state, `第 ${state.round} 回合順序：${state.queue.map((id) => NAMES[id]).join("、")}。`, withLog);
}

function markWestTargets(state, withLog) {
  const west = state.players.west;
  if (west.finished || state.round === 1) return;
  const ranking = getRaceRanking(state);
  const westRank = ranking.indexOf("west");
  if (westRank <= 0) return;
  const candidates = ranking.slice(Math.max(0, westRank - 2), westRank);
  for (const id of candidates) state.players[id].westMarked = true;
  if (candidates.length) {
    addLog(state, `西格莉卡發動「${SKILL_NAMES.west}」，標記 ${candidates.map((id) => NAMES[id]).join("、")}，本回合移動少 1 格。`, withLog);
  }
}

function getRaceRanking(state) {
  return PLAYER_IDS
    .filter((id) => !state.players[id].finished)
    .sort((a, b) => compareStanding(state, a, b));
}

function compareStanding(state, a, b) {
  const diff = state.players[b].position - state.players[a].position;
  if (diff !== 0) return diff;
  const stack = state.stacks[state.players[a].position] || [];
  const aIndex = stack.indexOf(a);
  const bIndex = stack.indexOf(b);
  if (aIndex >= 0 && bIndex >= 0) return bIndex - aIndex;
  return PLAYER_IDS.indexOf(a) - PLAYER_IDS.indexOf(b);
}

function prepareRoundRolls(state) {
  state.plannedRolls = {};
  if (!isGroupB()) return;
  for (const id of state.queue) {
    if (id !== "boss") state.plannedRolls[id] = rollDirectForPlayer(state, id);
  }
}

function rollForPlayer(state, id) {
  if (id === "boss") return rollBossDie();
  if (Object.hasOwn(state.plannedRolls || {}, id)) return state.plannedRolls[id];
  return rollDirectForPlayer(state, id);
}

function rollDirectForPlayer(state, id) {
  const actor = state.players[id];
  if (isGroupB() && id === "west") {
    const cycle = [3, 2, 1];
    const index = actor.precisionIndex || 0;
    actor.precisionIndex = index + 1;
    return cycle[index % cycle.length];
  }
  if (isGroupB() && id === "kat") {
    return Math.random() < 0.5 ? 2 : 3;
  }
  return rollDie();
}

function takeTurn(state, id, withLog) {
  const actor = state.players[id];
  const roll = rollForPlayer(state, id);
  let delta = id === "boss" ? -roll : roll;
  const reasons = [`擲出 ${roll}`];

  if (id !== "boss") {
    if (isGroupB()) {
      delta = applyGroupBTurnRules(state, id, roll, delta, reasons);
    } else {
      if (id === "daphne" && actor.lastRoll === roll) {
        delta += 2;
        reasons.push(`${SKILL_NAMES.daphne}：連骰同點 +2`);
      }
      if (id === "snow" && actor.metBoss) {
        delta += 1;
        reasons.push(`${SKILL_NAMES.snow}：遇過布大王 +1`);
      }
      if (id === "fei" && Math.random() < 0.5) {
        delta += 1;
        reasons.push(`${SKILL_NAMES.fei}：額外前進 +1`);
      }
      if (id === "kat" && actor.katUsed && Math.random() < 0.6) {
        delta += 2;
        reasons.push(`${SKILL_NAMES.kat}：落後奮起 +2`);
      }
    }
    if (actor.westMarked) {
      delta = Math.max(0, delta - 1);
      reasons.push(`${SKILL_NAMES.west}：標記 -1`);
    }
  }

  actor.lastRoll = roll;
  const moved = moveStackFrom(state, id, delta);
  const beforeLanding = moved.to;
  applyLandingRules(state, moved.carried, withLog, reasons);
  applyGroupBAfterMoveRules(state, moved.carried, moved.from, reasons);
  actor.hasMoved = true;
  if (!isGroupB() && id === "kat" && !actor.katUsed && actor.position < FINISH && isLastPlace(state, id)) {
    actor.katUsed = true;
    reasons.push(`${SKILL_NAMES.kat}：落後狀態啟動`);
  }
  const finalTo = state.players[id].position;
  const event = {
    id,
    roll,
    from: moved.from,
    via: beforeLanding,
    to: finalTo,
    carried: moved.carried,
    reasons: [...reasons],
  };
  addLog(
    state,
    `${NAMES[id]}${moved.carried.length > 1 ? `帶著 ${moved.carried.slice(1).map((pid) => NAMES[pid]).join("、")}` : ""}移動：${reasons.join("，")}。`,
    withLog
  );
  return event;
}

function applyGroupBTurnRules(state, id, roll, delta, reasons) {
  if (id === "lu") {
    const rolls = Object.values(state.plannedRolls || {});
    if (roll === Math.min(...rolls)) {
      reasons.push(`${SKILL_NAMES.lu}：本輪最小點數 +2`);
      return delta + 2;
    }
  }
  if (id === "west") {
    reasons.push(`${SKILL_NAMES.west}：固定循環點數`);
  }
  if (id === "daphne") {
    const chance = Math.random();
    if (chance < 0.2) {
      reasons.push(`${SKILL_NAMES.daphne}：本回合無法移動`);
      return 0;
    }
    if (chance < 0.8) {
      reasons.push(`${SKILL_NAMES.daphne}：雙倍點數`);
      return delta * 2;
    }
  }
  if (id === "kat") {
    reasons.push(`${SKILL_NAMES.kat}：只會擲出 2 或 3`);
  }
  if (id === "fei" && Math.random() < 0.28) {
    reasons.push(`${SKILL_NAMES.fei}：雙倍點數`);
    return delta * 2;
  }
  return delta;
}

function applyGroupBAfterMoveRules(state, movedIds, from, reasons) {
  if (!isGroupB() || movedIds[0] !== "snow") return;
  const actor = state.players.snow;
  const midpoint = Math.ceil(FINISH / 2);
  if (actor.electronicGhostUsed || actor.position <= midpoint || actor.position >= FINISH) return;
  const targetPosition = PLAYER_IDS
    .filter((id) => id !== "snow" && !state.players[id].finished && state.players[id].position > actor.position)
    .map((id) => state.players[id].position)
    .sort((a, b) => a - b)[0];
  if (!targetPosition) return;
  actor.electronicGhostUsed = true;
  teleportCarriedGroup(state, movedIds, targetPosition);
  reasons.push(`${SKILL_NAMES.snow}：傳送到最近團子頂端`);
}

function teleportCarriedGroup(state, movedIds, to) {
  const from = state.players[movedIds[0]].position;
  removeIdsFromStack(state.stacks[from], movedIds);
  state.stacks[to].push(...movedIds);
  for (const id of movedIds) state.players[id].position = to;
}

function moveStackFrom(state, id, delta) {
  const actor = state.players[id];
  const from = actor.position;
  if (id === "boss") {
    const to = clamp(from + delta, 1, FINISH);
    const carried = takeBossStack(state, from);
    moveBossGroupAlongPath(state, carried, from, to);
    return { from, to, carried };
  }
  const stack = state.stacks[from];
  const index = stack.indexOf(id);
  if (index < 0) {
    const carried = [id];
    const to = clamp(from + delta, 1, FINISH);
    stackLanding(state, to, carried, id);
    actor.position = to;
    checkBossMeeting(state, carried, to);
    return { from, to, carried };
  }
  const carried = stack.splice(index);
  const to = clamp(from + delta, 1, FINISH);

  stackLanding(state, to, carried, id);
  for (const pid of carried) state.players[pid].position = to;
  checkBossMeeting(state, carried, to);
  return { from, to, carried };
}

function stackLanding(state, to, carried, leader) {
  if (leader === "boss") {
    state.stacks[to].unshift(...carried);
  } else {
    state.stacks[to].push(...carried);
  }
}

function applyLandingRules(state, movedIds, withLog, reasons) {
  const leader = movedIds[0];
  const actor = state.players[leader];
  if (actor.position >= FINISH) return;

  if (ADVANCE_CELLS.has(actor.position)) {
    const bonus = !isGroupB() && leader === "lu" ? 3 : 1;
    reasons.push(!isGroupB() && leader === "lu" ? `${SKILL_NAMES.lu}：推進裝置 +${bonus}` : `推進裝置 +${bonus}`);
    moveWholeCarriedGroup(state, movedIds, bonus);
  } else if (BLOCK_CELLS.has(actor.position)) {
    const penalty = !isGroupB() && leader === "lu" ? -2 : -1;
    reasons.push(!isGroupB() && leader === "lu" ? `${SKILL_NAMES.lu}：阻退裝置 ${penalty}` : `阻退裝置 ${penalty}`);
    moveWholeCarriedGroup(state, movedIds, penalty);
  } else if (leader !== "boss" && TIME_CELLS.has(actor.position)) {
    openTimeRift(state, actor.position, withLog);
    reasons.push("觸發時空裂隙");
  }

  checkBossMeeting(state, movedIds, actor.position);
}

function moveWholeCarriedGroup(state, movedIds, delta) {
  const from = state.players[movedIds[0]].position;
  if (movedIds[0] === "boss") {
    removeIdsFromStack(state.stacks[from], movedIds);
    moveBossGroupAlongPath(state, movedIds, from, clamp(from + delta, 1, FINISH));
    return;
  }
  const stack = state.stacks[from];
  const indexes = movedIds.map((id) => stack.indexOf(id)).filter((index) => index >= 0);
  const first = Math.min(...indexes);
  const group = stack.splice(first, movedIds.length);
  const to = clamp(from + delta, 1, FINISH);
  state.stacks[to].push(...group);
  for (const id of group) state.players[id].position = to;
}

function takeBossStack(state, from) {
  const stack = state.stacks[from];
  const bossIndex = stack.indexOf("boss");
  const aboveBoss = bossIndex >= 0 ? stack.slice(bossIndex + 1).filter((pid) => !state.players[pid].finished) : [];
  const carried = ["boss", ...aboveBoss];
  removeIdsFromStack(stack, carried);
  return carried;
}

function moveBossGroupAlongPath(state, carried, from, to) {
  if (!carried.includes("boss")) carried.unshift("boss");
  const dir = to >= from ? 1 : -1;
  for (let position = from + dir; dir > 0 ? position <= to : position >= to; position += dir) {
    const stack = state.stacks[position];
    const picked = stack.filter((pid) => pid !== "boss" && !state.players[pid].finished);
    if (picked.length) {
      removeIdsFromStack(stack, picked);
      const aboveBoss = carried.filter((pid) => pid !== "boss");
      carried.splice(0, carried.length, "boss", ...picked, ...aboveBoss);
      for (const pid of picked) state.players[pid].metBoss = true;
    }
    for (const pid of carried) state.players[pid].position = position;
  }
  state.stacks[to].unshift(...carried);
}

function removeIdsFromStack(stack, ids) {
  const idSet = new Set(ids);
  for (let i = stack.length - 1; i >= 0; i--) {
    if (idSet.has(stack[i])) stack.splice(i, 1);
  }
}

function openTimeRift(state, position, withLog) {
  const stack = state.stacks[position];
  const hasBoss = stack.includes("boss");
  const mixed = shuffle(stack.splice(0).filter((id) => id !== "boss"));
  if (hasBoss) state.stacks[position].push("boss");
  state.stacks[position].push(...mixed);
  addLog(state, `時空裂隙打開，${mixed.map((id) => NAMES[id]).join("、")} 的堆疊順序被重排。`, withLog);
}

function applyBossRoundEndRule(state, withLog) {
  const boss = state.players.boss;
  if (!boss.active || boss.position === FINISH) return;
  const stack = state.stacks[boss.position];
  const bossIndex = stack.indexOf("boss");
  if (bossIndex < 0) return;
  if (bossIndex >= 0 && bossIndex < stack.length - 1) return;
  const last = getLastNonBoss(state);
  if (!last || last.position <= boss.position) return;

  stack.splice(bossIndex, 1);
  state.stacks[FINISH].unshift("boss");
  boss.position = FINISH;
  addLog(state, "最後一名超過布大王，布大王傳送回終點。", withLog);
}

function checkBossMeeting(state, ids, position) {
  if (!state.players.boss.active) return;
  if (!ids.some((id) => id !== "boss")) return;
  if (state.stacks[position].includes("boss")) {
    for (const id of ids) {
      if (id !== "boss") state.players[id].metBoss = true;
    }
  }
}

function recordFinishers(state, withLog) {
  const finishers = PLAYER_IDS.filter((id) => !state.players[id].finished && state.players[id].position >= FINISH);
  if (!finishers.length) return [];
  finishers.sort((a, b) => state.stacks[FINISH].indexOf(b) - state.stacks[FINISH].indexOf(a));
  for (const id of finishers) {
    state.players[id].finished = true;
    addLog(state, `${NAMES[id]} 抵達終點！`, withLog);
  }
  state.rankings = [...finishers, ...getRaceRanking(state)];
  state.winner = state.rankings[0];
  state.finished = true;
  addLog(state, `比賽結束：${state.rankings.map((id, index) => `#${index + 1} ${NAMES[id]}`).join("、")}`, withLog);
  return finishers;
}

function isLastPlace(state, id) {
  const ranking = getRaceRanking(state);
  return ranking.length > 1 && ranking[ranking.length - 1] === id;
}

function getLastNonBoss(state) {
  return PLAYER_IDS
    .map((id) => state.players[id])
    .filter((player) => !player.finished)
    .sort((a, b) => a.position - b.position)[0];
}

async function animateTurn(event) {
  diceEl.textContent = event.roll;
  diceEl.classList.remove("roll");
  void diceEl.offsetWidth;
  diceEl.classList.add("roll");
  turnInfoEl.textContent = `${NAMES[event.id]}：${event.reasons.join("，")}`;
  await wait(420);
  const notices = getSkillNotices(event);
  if (notices.length) {
    showSkillNotice(notices);
    await wait(360);
  }

  const fromPoint = cellPoint(event.from);
  const moving = event.carried.map((id, index) => {
    const img = document.createElement("img");
    img.src = assetFor(id);
    img.alt = NAMES[id];
    img.className = `moving-piece ${id === "boss" ? "boss" : ""}`;
    setPieceVars(img, fromPoint, index, id, 200 + index);
    moversEl.appendChild(img);
    return img;
  });
  hidePieces(event.carried, true);

  const path = buildPath(event.from, event.to);
  for (let i = 0; i < path.length; i++) {
    const point = cellPoint(path[i]);
    moving.forEach((img, index) => {
      setPieceVars(img, point, index, event.carried[index], 220 + index);
      img.classList.add("hop");
    });
    await wait(135);
    moving.forEach((img) => img.classList.remove("hop"));
    await wait(105);
  }

  moving.forEach((img) => img.remove());
  hidePieces(event.carried, false);
  diceEl.classList.remove("roll");
  hideSkillNotice();
  if (event.newRanks && event.newRanks.includes(game.rankings[0])) {
    await showSpotlight(game.rankings[0]);
  }
}

function getSkillNotices(event) {
  return event.reasons.filter((reason) => !reason.startsWith("擲出") && !reason.startsWith("初始"));
}

function showSkillNotice(notices) {
  if (!skillNoticeEl) return;
  skillNoticeEl.innerHTML = notices.map((text) => `<div class="skill-chip">${text}</div>`).join("");
  skillNoticeEl.hidden = false;
}

function hideSkillNotice() {
  if (!skillNoticeEl) return;
  skillNoticeEl.hidden = true;
  skillNoticeEl.innerHTML = "";
}

async function showSpotlight(id) {
  if (!spotlightEl || !id) return;
  spotlightEl.innerHTML = `
    <div class="spotlight-card">
      <div class="spotlight-rank">第 1 名</div>
      <img src="${assetFor(id)}" alt="${NAMES[id]}">
      <div class="spotlight-name" style="color:${COLORS[id]}">${NAMES[id]}</div>
    </div>
  `;
  spotlightEl.hidden = false;
  await wait(1350);
  spotlightEl.hidden = true;
  spotlightEl.innerHTML = "";
}

function buildPath(from, to) {
  if (from === to) return [to];
  const dir = to > from ? 1 : -1;
  const path = [];
  for (let p = from + dir; dir > 0 ? p <= to : p >= to; p += dir) {
    path.push(p);
  }
  return path;
}

function render() {
  renderCells();
  renderPieces();
  renderPlayers();
  renderLog();
  roundInfoEl.textContent = `第 ${game.round} 回合`;
  if (game.finished) {
    turnInfoEl.textContent = `比賽結束：第 1 名 ${NAMES[game.rankings[0]]}`;
  } else if (game.current) {
    turnInfoEl.textContent = `剛行動：${NAMES[game.current]}`;
  } else {
    turnInfoEl.textContent = "準備開始";
  }
}

function renderCells() {
  if (cellsEl.children.length) return;
  for (let i = 1; i <= TRACK_LENGTH; i++) {
    const cell = document.createElement("div");
    const point = cellPoint(i);
    cell.className = `cell ${getCellClass(i)}`;
    cell.style.setProperty("--x", point.x);
    cell.style.setProperty("--y", point.y);
    cell.textContent = getCellType(i) || i;
    cellsEl.appendChild(cell);
  }
}

function renderPieces() {
  piecesEl.innerHTML = "";
  for (let position = 0; position <= TRACK_LENGTH; position++) {
    const stack = game.stacks[position];
    const point = cellPoint(position);
    stack.forEach((id, index) => {
      const img = document.createElement("img");
      img.src = assetFor(id);
      img.alt = NAMES[id];
      img.dataset.id = id;
      img.className = `piece ${id === "boss" ? "boss" : ""}`;
      setPieceVars(img, point, index, id, Math.round(point.y * 10) + index);
      piecesEl.appendChild(img);
    });
  }
}

function renderPlayers() {
  const finishedRanks = game.rankings || [];
  const unfinished = getRaceRanking(game).filter((id) => !finishedRanks.includes(id));
  const ranked = ["boss", ...finishedRanks, ...unfinished];
  playersEl.innerHTML = "";
  for (const id of ranked) {
    const player = game.players[id];
    const row = document.createElement("div");
    row.className = "player-row";
    const finalRank = finishedRanks.indexOf(id);
    const rank = id === "boss" ? "外" : finalRank >= 0 ? `#${finalRank + 1}` : "賽";
    const note = finalRank >= 0 ? `已完成｜第 ${finalRank + 1} 名` : `${player.position} 格｜${INITIAL_NOTES[id]}`;
    row.innerHTML = `
      <span class="rank">${rank}</span>
      <img class="avatar" src="${assetFor(id)}" alt="${NAMES[id]}">
      <div class="player-main">
        <div class="player-name" style="color:${COLORS[id]}">${NAMES[id]}</div>
        <div class="player-note">${note}</div>
      </div>
    `;
    playersEl.appendChild(row);
  }
}

function renderLog() {
  logEl.innerHTML = "";
  for (const text of game.log.slice(-80).reverse()) {
    const item = document.createElement("div");
    item.className = "log-entry";
    item.textContent = text;
    logEl.appendChild(item);
  }
}

function showEndModal() {
  if (!endModalEl || !endRankingsEl) return;
  endRankingsEl.innerHTML = "";
  game.rankings.forEach((id, index) => {
    const row = document.createElement("div");
    row.className = "end-rank-row";
    row.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <img class="avatar" src="${assetFor(id)}" alt="${NAMES[id]}">
      <div class="player-main">
        <div class="player-name" style="color:${COLORS[id]}">${NAMES[id]}</div>
        <div class="player-note">${game.players[id].position} 格</div>
      </div>
    `;
    endRankingsEl.appendChild(row);
  });
  endModalEl.hidden = false;
}

function closeEndModal() {
  if (!endModalEl) return;
  endModalEl.hidden = true;
}

function runSimulation() {
  const count = clamp(Number(document.querySelector("#simCount").value) || 5000, 100, 100000);
  const wins = Object.fromEntries(PLAYER_IDS.map((id) => [id, 0]));
  for (let i = 0; i < count; i++) {
    const sim = createGame();
    while (!sim.finished) stepGame(sim, false);
    wins[sim.rankings[0]] += 1;
  }

  simResultsEl.innerHTML = "";
  PLAYER_IDS
    .map((id) => ({ id, rate: wins[id] / count }))
    .sort((a, b) => b.rate - a.rate)
    .forEach(({ id, rate }, index) => {
      const row = document.createElement("div");
      row.className = "result-row";
      row.innerHTML = `
        <span class="rank">#${index + 1}</span>
        <img class="avatar" src="${assetFor(id)}" alt="${NAMES[id]}">
        <div class="player-name">${NAMES[id]}　<strong>${(rate * 100).toFixed(2)}%</strong></div>
        <div class="bar"><div class="bar-fill" style="width:${rate * 100}%;background:${COLORS[id]}"></div></div>
      `;
      simResultsEl.appendChild(row);
    });
}

function setPieceVars(el, point, stackIndex, id, z) {
  const spread = getStackSpread(stackIndex, id);
  const pieceScale = getStagePieceScale();
  el.style.setProperty("--x", point.x);
  el.style.setProperty("--y", point.y);
  el.style.setProperty("--lift", scaledPiecePx(spread.lift, pieceScale));
  el.style.setProperty("--z", z);
  el.style.setProperty("--scale", id === "boss" ? 0.72 : 0.64);
  el.style.setProperty("--size", scaledPiecePx(id === "boss" ? 210 : 190, pieceScale));
  el.style.setProperty("--height", scaledPiecePx(id === "boss" ? 132 : 142, pieceScale));
  el.style.setProperty("--dx", scaledPiecePx(spread.dx, pieceScale));
  el.style.setProperty("--dy", scaledPiecePx(spread.dy, pieceScale));
}

function getStagePieceScale() {
  const width = stageEl?.getBoundingClientRect().width || PIECE_REFERENCE_STAGE_WIDTH;
  return Math.min(1, Math.max(MIN_PIECE_STAGE_SCALE, width / PIECE_REFERENCE_STAGE_WIDTH));
}

function scaledPiecePx(value, scale = getStagePieceScale()) {
  return `${Number((value * scale).toFixed(2))}px`;
}

function setupStageResizeHandler() {
  if (!stageEl) return;

  updateStageScale();
  let lastWidth = stageEl.getBoundingClientRect().width;
  const rerenderPieces = () => {
    if (isAnimating) return;
    const width = stageEl.getBoundingClientRect().width;
    if (Math.abs(width - lastWidth) < 2) return;
    lastWidth = width;
    updateStageScale();
    renderPieces();
  };

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(rerenderPieces);
    observer.observe(stageEl);
  } else {
    window.addEventListener("resize", rerenderPieces);
  }
}

function updateStageScale() {
  stageEl.style.setProperty("--stage-scale", getStagePieceScale());
}

function getStackSpread(stackIndex, id) {
  if (id === "boss") return { dx: 0, dy: 16, lift: 0 };
  const level = Math.max(0, stackIndex);
  return {
    dx: 0,
    dy: 0,
    lift: level * 18,
  };
}

function hidePieces(ids, hidden) {
  ids.forEach((id) => {
    document.querySelectorAll(`.piece[data-id="${id}"]`).forEach((el) => {
      el.classList.toggle("hidden-during-move", hidden);
    });
  });
}

function cellPoint(position) {
  if (position <= 0) return cellPoint(1);
  return TRACK_CONFIG.points[Math.min(position, TRACK_LENGTH) - 1];
}

function applyTrackBackground() {
  if (!stageEl || !TRACK_CONFIG.backgroundImage) return;
  stageEl.classList.add("custom-map");
  stageEl.style.setProperty("--map-image", `url("${TRACK_CONFIG.backgroundImage}")`);
}

function getCellClass(index) {
  if (index === FINISH) return "finish";
  if (ADVANCE_CELLS.has(index)) return "advance";
  if (BLOCK_CELLS.has(index)) return "block";
  if (TIME_CELLS.has(index)) return "time";
  return "";
}

function getCellType(index) {
  if (ADVANCE_CELLS.has(index)) return "+";
  if (BLOCK_CELLS.has(index)) return "-";
  if (TIME_CELLS.has(index)) return "時";
  if (index === FINISH) return "終";
  return "";
}

function assetFor(id) {
  return playerConfig(id).asset || `public/dangos/${id}-raw.png`;
}

function addLog(state, message, enabled) {
  if (enabled) state.log.push(message);
}

function rollDie() {
  return Math.floor(Math.random() * 3) + 1;
}

function rollBossDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function shuffle(items) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setButtons(enabled) {
  stepButton.disabled = !enabled;
  document.querySelector("#newGameButton").disabled = !enabled;
  document.querySelector("#simulateButton").disabled = !enabled;
}

function stopAuto() {
  window.clearInterval(autoTimer);
  autoTimer = null;
  autoButton.textContent = "自動跑完";
}

render();
