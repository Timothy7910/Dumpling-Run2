const TRACK_CONFIG = window.DangoTrack.loadTrackConfig();
const TRACK_LENGTH = TRACK_CONFIG.length;
const FINISH = TRACK_CONFIG.finish;
const ADVANCE_CELLS = TRACK_CONFIG.advanceCells;
const BLOCK_CELLS = TRACK_CONFIG.blockCells;
const TIME_CELLS = TRACK_CONFIG.timeCells;
const PLAYER_IDS = ["lu", "west", "daphne", "snow", "kat", "fei"];
const CUSTOM_SOURCE_GROUP_IDS = ["a", "b", "c"];
const CUSTOM_GROUP_ID = "custom";
const CUSTOM_SELECTION_SIZE = 6;
const CUSTOM_START_POSITIONS = [29, 30, 31, 32, 1];
const CUSTOM_FULL_LAP_START_POSITIONS = [29, 30, 31, 32];
const GROUP_STORAGE_KEY = "dango-race-group";
const GROUP_DEFAULT_VERSION_STORAGE_KEY = "dango-race-group-default-version";
const GROUP_DEFAULT_VERSION = "c-group-default";
const CUSTOM_GROUP_STORAGE_KEY = "dango-race-custom-selection";
const CUSTOM_START_STORAGE_KEY = "dango-race-custom-start-positions";
const CUSTOM_STACK_STORAGE_KEY = "dango-race-custom-stack-order";
const CUSTOM_FIRST_QUEUE_STORAGE_KEY = "dango-race-custom-first-queue-order";
const CUSTOM_RANDOM_ORDER_VALUE = "";
const CUSTOM_ORDER_VALUES = [1, 2, 3, 4, 5, 6];
const DEFAULT_GROUP_ID = "c";
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

const DICE_PALETTE = [
  { id: "aqua", base: "#36b8d8", light: "#d8fbff", shadow: "#167190", ink: "#ffffff" },
  { id: "rose", base: "#ee6f99", light: "#ffe0ed", shadow: "#a92c58", ink: "#ffffff" },
  { id: "gold", base: "#e7b849", light: "#fff1b8", shadow: "#a56e13", ink: "#ffffff" },
  { id: "mint", base: "#55c99a", light: "#dcfff0", shadow: "#1d7d55", ink: "#ffffff" },
  { id: "sky", base: "#6da9f7", light: "#e4f3ff", shadow: "#2f64ad", ink: "#ffffff" },
  { id: "coral", base: "#ff875c", light: "#ffe2d3", shadow: "#b94522", ink: "#ffffff" },
  { id: "boss", base: "#8e62d9", light: "#e1d3ff", shadow: "#56309a", ink: "#ffffff" },
];

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
  c: {
    label: "C組",
    players: {
      lu: {
        name: "奧古斯塔團子",
        skillName: "總督權柄",
        note: "回合開始時若在堆疊最頂端，本回合不行動，且下回合最後行動",
        asset: "public/dangos/augusta-raw.png",
      },
      west: {
        name: "尤諾團子",
        skillName: "錨定命途",
        note: "每場一次，過中點後會把除了布大王以外的全部團子傳送到自己格",
        asset: "public/dangos/younuo-raw.png",
      },
      daphne: {
        name: "弗洛洛團子",
        skillName: "優雅陰謀",
        note: "回合開始時若在堆疊最底層，本回合移動額外 +3",
        asset: "public/dangos/fuluoluo-raw.png",
      },
      snow: {
        name: "長離團子",
        skillName: "謀而後定",
        note: "若下方堆疊其他團子，下回合 65% 機率最後行動",
        asset: "public/dangos/changli-raw.png",
      },
      kat: {
        name: "今汐團子",
        skillName: "今尹之名",
        note: "若頭頂堆疊其他團子，40% 機率移動到所有團子的最上方",
        asset: "public/dangos/jinxi-raw.png",
      },
      fei: {
        name: "卡卡羅團子",
        skillName: "如影隨形",
        note: "開始移動時若在最後一名，額外前進 3 格",
        asset: "public/dangos/kakaluo-raw.png",
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
const playersEl = document.querySelector("#players");
const logEl = document.querySelector("#log");
const stageRankingEl = document.querySelector("#stageRanking");
const turnOrderEl = document.querySelector("#turnOrder");
const simResultsEl = document.querySelector("#simResults");
const endModalEl = document.querySelector("#endModal");
const endRankingsEl = document.querySelector("#endRankings");
const stepButton = document.querySelector("#stepButton");
const autoButton = document.querySelector("#autoButton");
const endOkButton = document.querySelector("#endOkButton");
const groupSelectEl = document.querySelector("#groupSelect");
const customGroupButton = document.querySelector("#customGroupButton");
const customModalEl = document.querySelector("#customModal");
const customGridEl = document.querySelector("#customGrid");
const customCountEl = document.querySelector("#customCount");
const customSaveButton = document.querySelector("#customSaveButton");
const customCancelButton = document.querySelector("#customCancelButton");
const customResetOrderButton = document.querySelector("#customResetOrderButton");

applyTrackBackground();
setupGroupSelect();
setupCustomPicker();
setupStageResizeHandler();
resetDice();

document.querySelector("#newGameButton").addEventListener("click", () => {
  stopAuto();
  closeEndModal();
  game = createGame();
  resetDice();
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
  groupSelectEl.value = GROUPS[activeGroupId] ? activeGroupId : DEFAULT_GROUP_ID;
  updateGroupControls();
  groupSelectEl.addEventListener("change", () => {
    activeGroupId = normalizeGroupId(groupSelectEl.value);
    window.localStorage?.setItem(GROUP_STORAGE_KEY, activeGroupId);
    stopAuto();
    closeEndModal();
    game = createGame();
    resetDice();
    simResultsEl.innerHTML = "";
    updateGroupControls();
    render();
  });
  customGroupButton?.addEventListener("click", openCustomPicker);
}

function loadActiveGroupId() {
  if (window.localStorage?.getItem(GROUP_DEFAULT_VERSION_STORAGE_KEY) !== GROUP_DEFAULT_VERSION) {
    window.localStorage?.setItem(GROUP_DEFAULT_VERSION_STORAGE_KEY, GROUP_DEFAULT_VERSION);
    window.localStorage?.setItem(GROUP_STORAGE_KEY, DEFAULT_GROUP_ID);
    return DEFAULT_GROUP_ID;
  }
  const saved = window.localStorage?.getItem(GROUP_STORAGE_KEY);
  return normalizeGroupId(saved || DEFAULT_GROUP_ID);
}

function normalizeGroupId(id) {
  return GROUPS[id] || id === CUSTOM_GROUP_ID ? id : DEFAULT_GROUP_ID;
}

function activeGroup() {
  return GROUPS[activeGroupId] || GROUPS.a;
}

function playerConfig(id) {
  if (id === "boss") return activeGroup().players.boss || GROUPS.a.players.boss || {};
  const source = racerSourceGroup(id);
  const slot = racerSlot(id);
  return GROUPS[source]?.players[slot] || GROUPS.a.players[slot] || {};
}

function racerSourceGroup(id) {
  if (id.includes(":")) return id.split(":")[0];
  return activeGroupId === CUSTOM_GROUP_ID ? "a" : activeGroupId;
}

function racerSlot(id) {
  return id.includes(":") ? id.split(":")[1] : id;
}

function isGroupB(id) {
  return racerSourceGroup(id) === "b";
}

function isGroupA(id) {
  return racerSourceGroup(id) === "a";
}

function isGroupC(id) {
  return racerSourceGroup(id) === "c";
}

function activePlayerIds() {
  if (activeGroupId !== CUSTOM_GROUP_ID) return [...PLAYER_IDS];
  return loadCustomSelection();
}

function getCustomRacerOptions() {
  return CUSTOM_SOURCE_GROUP_IDS.flatMap((groupId) =>
    PLAYER_IDS.map((slot) => ({
      id: `${groupId}:${slot}`,
      groupId,
      slot,
      ...GROUPS[groupId].players[slot],
    }))
  );
}

function loadCustomSelection() {
  const fallback = getCustomRacerOptions().filter((option) => option.groupId === DEFAULT_GROUP_ID).map((option) => option.id);
  try {
    const parsed = JSON.parse(window.localStorage?.getItem(CUSTOM_GROUP_STORAGE_KEY) || "[]");
    const valid = getCustomRacerOptions().map((option) => option.id);
    const selected = Array.isArray(parsed) ? parsed.filter((id) => valid.includes(id)) : [];
    return selected.length === CUSTOM_SELECTION_SIZE ? selected : fallback;
  } catch {
    return fallback;
  }
}

function loadCustomStartPositions() {
  try {
    const parsed = JSON.parse(window.localStorage?.getItem(CUSTOM_START_STORAGE_KEY) || "{}");
    const valid = getCustomRacerOptions().map((option) => option.id);
    return Object.fromEntries(
      Object.entries(parsed || {})
        .filter(([id, position]) => valid.includes(id) && CUSTOM_START_POSITIONS.includes(Number(position)))
        .map(([id, position]) => [id, Number(position)])
    );
  } catch {
    return {};
  }
}

function loadCustomRankConfig(storageKey) {
  try {
    const parsed = JSON.parse(window.localStorage?.getItem(storageKey) || "{}");
    const valid = getCustomRacerOptions().map((option) => option.id);
    return Object.fromEntries(
      Object.entries(parsed || {})
        .filter(([id, rank]) => valid.includes(id) && CUSTOM_ORDER_VALUES.includes(Number(rank)))
        .map(([id, rank]) => [id, Number(rank)])
    );
  } catch {
    return {};
  }
}

function loadCustomStackOrder() {
  return loadCustomRankConfig(CUSTOM_STACK_STORAGE_KEY);
}

function loadCustomFirstQueueOrder() {
  return loadCustomRankConfig(CUSTOM_FIRST_QUEUE_STORAGE_KEY);
}

function getCustomStartPosition(id, starts = loadCustomStartPositions()) {
  return CUSTOM_START_POSITIONS.includes(starts[id]) ? starts[id] : 1;
}

function getCustomRankValue(id, ranks) {
  return CUSTOM_ORDER_VALUES.includes(ranks[id]) ? String(ranks[id]) : CUSTOM_RANDOM_ORDER_VALUE;
}

function customRankOptions() {
  return `<option value="${CUSTOM_RANDOM_ORDER_VALUE}">隨機</option>${CUSTOM_ORDER_VALUES.map((rank) => `<option value="${rank}">${rank}</option>`).join("")}`;
}

function getCustomPickerRankConfig(selectedIds, type) {
  const selected = new Set(selectedIds);
  const config = {};
  const selector = type === "stack" ? ".custom-stack-select" : ".custom-turn-select";
  customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
    if (!selected.has(card.dataset.id)) return;
    const rank = Number(card.querySelector(selector)?.value);
    if (CUSTOM_ORDER_VALUES.includes(rank)) config[card.dataset.id] = rank;
  });
  return config;
}

function resolveCustomRankOrder(playerIds, ranks) {
  const resolved = {};
  const used = new Set();
  const randomIds = [];
  for (const id of playerIds) {
    const rank = ranks[id];
    if (CUSTOM_ORDER_VALUES.includes(rank) && !used.has(rank)) {
      resolved[id] = rank;
      used.add(rank);
    } else {
      randomIds.push(id);
    }
  }
  const remaining = shuffle(CUSTOM_ORDER_VALUES.filter((rank) => !used.has(rank)));
  randomIds.forEach((id, index) => {
    resolved[id] = remaining[index];
  });
  return resolved;
}

function buildCustomFirstQueue(playerIds, customFirstQueueOrder) {
  const resolved = resolveCustomRankOrder(playerIds, customFirstQueueOrder);
  return [...playerIds].sort((a, b) => resolved[a] - resolved[b]);
}

function buildCustomInitialStacks(stacks, players, playerIds, customStackOrder) {
  const resolved = resolveCustomRankOrder(playerIds, customStackOrder);
  for (const id of [...playerIds].sort((a, b) => resolved[a] - resolved[b])) {
    const startPosition = players[id].position;
    stacks[startPosition].push(id);
  }
}

function selectedCustomRankValues(type, selected) {
  const selector = type === "stack" ? ".custom-stack-select" : ".custom-turn-select";
  const values = new Map();
  customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
    if (!selected.has(card.dataset.id)) return;
    const value = card.querySelector(selector)?.value || CUSTOM_RANDOM_ORDER_VALUE;
    if (value !== CUSTOM_RANDOM_ORDER_VALUE) values.set(card.dataset.id, value);
  });
  return values;
}

function updateCustomRankSelectOptions(selected) {
  for (const type of ["stack", "firstQueue"]) {
    const selector = type === "stack" ? ".custom-stack-select" : ".custom-turn-select";
    const used = selectedCustomRankValues(type, selected);
    const usedValues = new Set(used.values());
    customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
      const select = card.querySelector(selector);
      if (!select) return;
      select.querySelectorAll("option").forEach((option) => {
        option.disabled =
          option.value !== CUSTOM_RANDOM_ORDER_VALUE && usedValues.has(option.value) && used.get(card.dataset.id) !== option.value;
      });
    });
  }
}

function normalizeCustomRankControls(selected) {
  for (const type of ["stack", "firstQueue"]) {
    const selector = type === "stack" ? ".custom-stack-select" : ".custom-turn-select";
    const seen = new Set();
    customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
      const select = card.querySelector(selector);
      if (!select || !selected.has(card.dataset.id) || select.value === CUSTOM_RANDOM_ORDER_VALUE) return;
      if (seen.has(select.value)) {
        select.value = CUSTOM_RANDOM_ORDER_VALUE;
        return;
      }
      seen.add(select.value);
    });
  }
}

function resetCustomRankControls(event) {
  event?.stopPropagation();
  customGridEl?.querySelectorAll(".custom-stack-select, .custom-turn-select").forEach((select) => {
    select.value = CUSTOM_RANDOM_ORDER_VALUE;
  });
  updateCustomRankSelectOptions(getCustomPickerSelection());
}

function colorFor(id) {
  return COLORS[racerSlot(id)] || COLORS.boss;
}

function diceColorFor(id) {
  return game.players[id]?.diceColor || DICE_PALETTE[0];
}

function applyDiceColor(id) {
  const color = diceColorFor(id);
  diceEl.style.setProperty("--dice-base", color.base);
  diceEl.style.setProperty("--dice-light", color.light);
  diceEl.style.setProperty("--dice-shadow", color.shadow);
  diceEl.style.setProperty("--dice-ink", color.ink);
  diceEl.dataset.owner = id;
}

function resetDice() {
  applyDiceColor("boss");
  diceEl.textContent = "?";
  diceEl.dataset.value = "?";
  diceEl.classList.remove("roll");
}

function diceStyleFor(id) {
  const color = diceColorFor(id);
  return `--dice-base:${color.base};--dice-light:${color.light};--dice-shadow:${color.shadow};--dice-ink:${color.ink}`;
}

function setupCustomPicker() {
  if (!customModalEl || !customGridEl) return;
  customGridEl.innerHTML = "";
  const selected = new Set(loadCustomSelection());
  const selectedIds = [...selected];
  const starts = loadCustomStartPositions();
  const stackOrder = loadCustomStackOrder();
  const firstQueueOrder = loadCustomFirstQueueOrder();
  for (const option of getCustomRacerOptions()) {
    const card = document.createElement("div");
    card.className = "custom-racer";
    card.dataset.id = option.id;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.innerHTML = `
      <span class="custom-racer-group">${option.groupId.toUpperCase()}</span>
      <img src="${option.asset}" alt="${option.name}">
      <span class="custom-racer-name">${option.name}</span>
      <label class="custom-start-control">
        <span>站位</span>
        <select class="custom-start-select" data-start-position aria-label="${option.name} 初始站位">
          ${CUSTOM_START_POSITIONS.map((position) => `<option value="${position}">${position}</option>`).join("")}
        </select>
      </label>
      <div class="custom-rank-controls">
        <label>
          <span>堆疊(6上)</span>
          <select class="custom-stack-select" data-stack-order aria-label="${option.name} 初始堆疊層級">
            ${customRankOptions()}
          </select>
        </label>
        <label>
          <span>首回合</span>
          <select class="custom-turn-select" data-first-queue-order aria-label="${option.name} 第一回合行動順序">
            ${customRankOptions()}
          </select>
        </label>
      </div>
    `;
    card.querySelector(".custom-start-select").value = getCustomStartPosition(option.id, starts);
    card.querySelector(".custom-stack-select").value = getCustomRankValue(option.id, stackOrder);
    card.querySelector(".custom-turn-select").value = getCustomRankValue(option.id, firstQueueOrder);
    card.querySelectorAll("select").forEach((select) => {
      select.addEventListener("click", (event) => event.stopPropagation());
      select.addEventListener("change", (event) => {
        event.stopPropagation();
        updateCustomRankSelectOptions(getCustomPickerSelection());
      });
    });
    const toggle = () => {
      const current = getCustomPickerSelection();
      if (current.has(option.id)) {
        current.delete(option.id);
      } else if (current.size < CUSTOM_SELECTION_SIZE) {
        current.add(option.id);
      }
      renderCustomPickerSelection(current);
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
    customGridEl.appendChild(card);
  }
  customSaveButton?.addEventListener("click", saveCustomSelection);
  customCancelButton?.addEventListener("click", closeCustomPicker);
  customResetOrderButton?.addEventListener("click", resetCustomRankControls);
  customModalEl.addEventListener("click", (event) => {
    if (event.target === customModalEl) closeCustomPicker();
  });
  renderCustomPickerSelection(selected);
}

function openCustomPicker() {
  renderCustomPickerSelection(new Set(loadCustomSelection()));
  customModalEl.hidden = false;
}

function closeCustomPicker() {
  if (!customModalEl) return;
  customModalEl.hidden = true;
}

function getCustomPickerSelection() {
  const selected = new Set();
  customGridEl?.querySelectorAll(".custom-racer.selected").forEach((card) => selected.add(card.dataset.id));
  return selected;
}

function getCustomPickerStartPositions(selectedIds) {
  const selected = new Set(selectedIds);
  const starts = {};
  customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
    if (!selected.has(card.dataset.id)) return;
    const position = Number(card.querySelector(".custom-start-select")?.value);
    starts[card.dataset.id] = CUSTOM_START_POSITIONS.includes(position) ? position : 1;
  });
  return starts;
}

function renderCustomPickerSelection(selected) {
  normalizeCustomRankControls(selected);
  customGridEl?.querySelectorAll(".custom-racer").forEach((card) => {
    const isSelected = selected.has(card.dataset.id);
    const isLocked = !isSelected && selected.size >= CUSTOM_SELECTION_SIZE;
    card.classList.toggle("selected", isSelected);
    card.classList.toggle("disabled", isLocked);
    card.setAttribute("aria-pressed", String(isSelected));
    card.setAttribute("aria-disabled", String(isLocked));
    card.querySelectorAll("select").forEach((select) => {
      select.disabled = !isSelected;
    });
  });
  updateCustomRankSelectOptions(selected);
  if (customCountEl) customCountEl.textContent = `${selected.size}/${CUSTOM_SELECTION_SIZE}`;
  if (customSaveButton) customSaveButton.disabled = selected.size !== CUSTOM_SELECTION_SIZE;
}

function saveCustomSelection() {
  const selected = [...getCustomPickerSelection()];
  if (selected.length !== CUSTOM_SELECTION_SIZE) return;
  window.localStorage?.setItem(CUSTOM_GROUP_STORAGE_KEY, JSON.stringify(selected));
  window.localStorage?.setItem(CUSTOM_START_STORAGE_KEY, JSON.stringify(getCustomPickerStartPositions(selected)));
  window.localStorage?.setItem(CUSTOM_STACK_STORAGE_KEY, JSON.stringify(getCustomPickerRankConfig(selected, "stack")));
  window.localStorage?.setItem(CUSTOM_FIRST_QUEUE_STORAGE_KEY, JSON.stringify(getCustomPickerRankConfig(selected, "firstQueue")));
  activeGroupId = CUSTOM_GROUP_ID;
  window.localStorage?.setItem(GROUP_STORAGE_KEY, activeGroupId);
  stopAuto();
  closeEndModal();
  game = createGame();
  resetDice();
  simResultsEl.innerHTML = "";
  closeCustomPicker();
  updateGroupControls();
  render();
}

function createGame() {
  const playerIds = activePlayerIds();
  const diceColors = assignDiceColors(playerIds);
  const customStartPositions = activeGroupId === CUSTOM_GROUP_ID ? loadCustomStartPositions() : {};
  const customStackOrder = activeGroupId === CUSTOM_GROUP_ID ? loadCustomStackOrder() : {};
  const customFirstQueueOrder = activeGroupId === CUSTOM_GROUP_ID ? loadCustomFirstQueueOrder() : {};
  const stacks = Array.from({ length: TRACK_LENGTH + 1 }, () => []);
  const players = {};
  for (const id of playerIds) {
    const startPosition = activeGroupId === CUSTOM_GROUP_ID ? getCustomStartPosition(id, customStartPositions) : 1;
    const needsFullLap = activeGroupId === CUSTOM_GROUP_ID && CUSTOM_FULL_LAP_START_POSITIONS.includes(startPosition);
    players[id] = {
      id,
      position: startPosition,
      diceColor: diceColors[id],
      finished: false,
      needsFullLap,
      finishArmed: !needsFullLap,
      lastRoll: null,
      metBoss: false,
      katUsed: false,
      westMarked: false,
      hasMoved: false,
      skipThisRound: false,
      actLastThisRound: false,
      actLastNextRound: false,
      bottomBonusThisRound: false,
      changliLastChanceNextRound: false,
      anchorUsed: false,
      augustaCooldownThisRound: false,
      augustaCooldownNextRound: false,
    };
  }
  const firstQueue =
    activeGroupId === CUSTOM_GROUP_ID ? buildCustomFirstQueue(playerIds, customFirstQueueOrder) : shuffle(playerIds);
  if (activeGroupId === CUSTOM_GROUP_ID) {
    buildCustomInitialStacks(stacks, players, playerIds, customStackOrder);
  } else {
    for (const id of [...firstQueue].reverse()) {
      const startPosition = players[id].position;
      stacks[startPosition].push(id);
    }
  }
  players.boss = {
    id: "boss",
    position: FINISH,
    finished: false,
    active: false,
    lastRoll: null,
  };
  players.boss.diceColor = DICE_PALETTE.find((color) => color.id === "boss");

  const state = {
    players,
    playerIds,
    stacks,
    round: 1,
    queue: firstQueue,
    roundOrder: [...firstQueue],
    current: null,
    log: [`比賽開始，第一回合順序：${firstQueue.map((id) => NAMES[id]).join("、")}。起點由上到下依此順序堆疊。`],
    finished: false,
    winner: null,
    rankings: [],
    lastEvent: null,
    plannedRolls: {},
  };
  applyGroupCRoundStartRules(state, false);
  state.roundOrder = [...state.queue];
  prepareRoundRolls(state);
  return state;
}

function assignDiceColors(playerIds) {
  const available = shuffle(DICE_PALETTE.filter((color) => color.id !== "boss"));
  return Object.fromEntries(playerIds.map((id, index) => [id, available[index % available.length]]));
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
  if (actor.skipThisRound) {
    const event = skipTurn(state, id, withLog);
    event.newRanks = recordFinishers(state, withLog);
    if (!state.finished && state.queue.length === 0) {
      finishRound(state, withLog);
    }
    state.lastEvent = event;
    return event;
  }
  const event = takeTurn(state, id, withLog);
  event.newRanks = recordFinishers(state, withLog);
  if (!state.finished && state.queue.length === 0) {
    finishRound(state, withLog);
  }
  state.lastEvent = event;
  return event;
}

function finishRound(state, withLog) {
  applyBossRoundEndRule(state, withLog);
  applyGroupCRoundEndRules(state, withLog);
  state.round += 1;
  beginRound(state, withLog);
}

function beginRound(state, withLog) {
  if (state.round === 3 && !state.players.boss.active) {
    state.players.boss.active = true;
    state.stacks[FINISH].unshift("boss");
    addLog(state, "第 3 回合，布大王從終點開始往起點移動。", withLog);
  }

  for (const id of state.playerIds) state.players[id].westMarked = false;
  applyGroupCRoundStartRules(state, withLog);
  markWestTargets(state, withLog);

  const active = state.playerIds.filter((id) => !state.players[id].finished);
  if (state.players.boss.active) active.push("boss");
  state.queue = shuffle(active);
  const lastIds = state.playerIds.filter((id) => state.players[id].actLastThisRound);
  moveQueueIdsToEnd(state.queue, lastIds);
  state.roundOrder = [...state.queue];
  prepareRoundRolls(state);
  addLog(state, `第 ${state.round} 回合順序：${state.queue.map((id) => NAMES[id]).join("、")}。`, withLog);
}

function markWestTargets(state, withLog) {
  const westId = state.playerIds.find((id) => racerSlot(id) === "west" && isGroupA(id));
  if (!westId) return;
  const west = state.players[westId];
  if (west.finished || state.round === 1) return;
  const ranking = getRaceRanking(state);
  const westRank = ranking.indexOf(westId);
  if (westRank <= 0) return;
  const candidates = ranking.slice(Math.max(0, westRank - 2), westRank);
  for (const id of candidates) state.players[id].westMarked = true;
  if (candidates.length) {
    addLog(state, `西格莉卡發動「${SKILL_NAMES[westId]}」，標記 ${candidates.map((id) => NAMES[id]).join("、")}，本回合移動少 1 格。`, withLog);
  }
}

function getRaceRanking(state) {
  return state.playerIds
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
  return raceOrderIndex(state, a) - raceOrderIndex(state, b);
}

function raceOrderIndex(state, id) {
  return id === "boss" ? state.playerIds.length : state.playerIds.indexOf(id);
}

function prepareRoundRolls(state) {
  state.plannedRolls = {};
  for (const id of state.queue) {
    if (id === "boss") {
      state.plannedRolls[id] = rollBossDie();
    } else if (!state.players[id]?.skipThisRound) {
      state.plannedRolls[id] = rollDirectForPlayer(state, id);
    }
  }
}

function rollForPlayer(state, id) {
  if (Object.hasOwn(state.plannedRolls || {}, id)) return state.plannedRolls[id];
  if (id === "boss") return rollBossDie();
  return rollDirectForPlayer(state, id);
}

function rollDirectForPlayer(state, id) {
  const actor = state.players[id];
  const slot = racerSlot(id);
  if (isGroupB(id) && slot === "west") {
    const cycle = [3, 2, 1];
    const index = actor.precisionIndex || 0;
    actor.precisionIndex = index + 1;
    return cycle[index % cycle.length];
  }
  if (isGroupB(id) && slot === "kat") {
    return Math.random() < 0.5 ? 2 : 3;
  }
  return rollDie();
}

function skipTurn(state, id, withLog) {
  const actor = state.players[id];
  actor.skipThisRound = false;
  actor.hasMoved = true;
  const reasons = [`${SKILL_NAMES[id]}：本回合不行動`];
  addLog(state, `${NAMES[id]} 因 ${SKILL_NAMES[id]} 暫停行動。`, withLog);
  applyZeroStepLandingRules(state, id, withLog, reasons);
  return {
    id,
    roll: "-",
    from: actor.position,
    via: actor.position,
    to: actor.position,
    carried: [id],
    wrapped: false,
    reasons,
  };
}

function applyZeroStepLandingRules(state, id, withLog, reasons) {
  if (!(isGroupC(id) && racerSlot(id) === "lu")) return;
  applyJinxiLandingTrigger(state, id, state.players[id].position, withLog, reasons);
}

function takeTurn(state, id, withLog) {
  const actor = state.players[id];
  const roll = rollForPlayer(state, id);
  let delta = id === "boss" ? -roll : roll;
  const reasons = [`擲出 ${roll}`];

  if (id !== "boss") {
    if (isGroupB(id)) {
      delta = applyGroupBTurnRules(state, id, roll, delta, reasons);
    } else if (isGroupC(id)) {
      delta = applyGroupCTurnRules(state, id, roll, delta, reasons);
    } else {
      const slot = racerSlot(id);
      if (slot === "daphne" && actor.lastRoll === roll) {
        delta += 2;
        reasons.push(`${SKILL_NAMES[id]}：連骰同點 +2`);
      }
      if (slot === "snow" && actor.metBoss) {
        delta += 1;
        reasons.push(`${SKILL_NAMES[id]}：遇過布大王 +1`);
      }
      if (slot === "fei" && Math.random() < 0.5) {
        delta += 1;
        reasons.push(`${SKILL_NAMES[id]}：額外前進 +1`);
      }
      if (slot === "kat" && actor.katUsed && Math.random() < 0.6) {
        delta += 2;
        reasons.push(`${SKILL_NAMES[id]}：落後奮起 +2`);
      }
    }
    if (actor.westMarked) {
      delta = Math.max(1, delta - 1);
      reasons.push(`標記 -1`);
    }
  }

  actor.lastRoll = roll;
  const moved = moveStackFrom(state, id, delta);
  const beforeLanding = moved.to;
  applyLandingRules(state, moved.carried, withLog, reasons);
  applyGroupBAfterMoveRules(state, moved.carried, moved.from, reasons);
  applyGroupCAfterMoveRules(state, moved.carried, moved.from, reasons);
  applyJinxiLandingTrigger(state, id, moved.to, withLog, reasons);
  actor.hasMoved = true;
  if (isGroupA(id) && racerSlot(id) === "kat" && !actor.katUsed && actor.position < FINISH && isLastPlace(state, id)) {
    actor.katUsed = true;
    reasons.push(`${SKILL_NAMES[id]}：落後狀態啟動`);
  }
  const finalTo = state.players[id].position;
  const event = {
    id,
    roll,
    from: moved.from,
    via: beforeLanding,
    to: finalTo,
    carried: moved.carried,
    wrapped: moved.wrapped,
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
  const slot = racerSlot(id);
  if (slot === "lu") {
    const rolls = Object.values(state.plannedRolls || {});
    if (roll === Math.min(...rolls)) {
      reasons.push(`${SKILL_NAMES[id]}：本輪最小點數 +2`);
      return delta + 2;
    }
  }
  if (slot === "west") {
    reasons.push(`${SKILL_NAMES[id]}：固定循環點數`);
  }
  if (slot === "daphne") {
    const chance = Math.random();
    if (chance < 0.2) {
      reasons.push(`${SKILL_NAMES[id]}：本回合無法移動`);
      return 0;
    }
    if (chance < 0.8) {
      reasons.push(`${SKILL_NAMES[id]}：雙倍點數`);
      return delta * 2;
    }
  }
  if (slot === "kat") {
    reasons.push(`${SKILL_NAMES[id]}：只會擲出 2 或 3`);
  }
  if (slot === "fei" && Math.random() < 0.28) {
    reasons.push(`${SKILL_NAMES[id]}：雙倍點數`);
    return delta * 2;
  }
  return delta;
}

function applyGroupBAfterMoveRules(state, movedIds, from, reasons) {
  const leader = movedIds[0];
  if (!isGroupB(leader) || racerSlot(leader) !== "snow") return;
  const actor = state.players[leader];
  const midpoint = Math.ceil(FINISH / 2);
  if (actor.electronicGhostUsed || actor.position <= midpoint || actor.position >= FINISH) return;
  const targetPosition = state.playerIds
    .filter((id) => id !== leader && !state.players[id].finished && state.players[id].position > actor.position)
    .map((id) => state.players[id].position)
    .sort((a, b) => a - b)[0];
  if (!targetPosition) return;
  actor.electronicGhostUsed = true;
  teleportCarriedGroup(state, movedIds, targetPosition, leader);
  reasons.push(`${SKILL_NAMES[leader]}：傳送到最近團子頂端`);
}

function applyGroupCRoundStartRules(state, withLog) {
  const lastIds = [];
  for (const id of state.playerIds) {
    const player = state.players[id];
    player.skipThisRound = false;
    player.bottomBonusThisRound = false;
    player.actLastThisRound = false;
    player.augustaCooldownThisRound = player.augustaCooldownNextRound;
    player.augustaCooldownNextRound = false;
    if (player.actLastNextRound) {
      player.actLastThisRound = true;
      player.actLastNextRound = false;
      lastIds.push(id);
    }
    if (player.changliLastChanceNextRound) {
      player.changliLastChanceNextRound = false;
      if (Math.random() < 0.65) {
        player.actLastThisRound = true;
        lastIds.push(id);
      }
    }
  }

  for (const id of state.playerIds) {
    if (!isGroupC(id) || state.players[id].finished) continue;
    const slot = racerSlot(id);
    if (slot === "lu" && !state.players[id].augustaCooldownThisRound && isStackTop(state, id) && hasNonBossStackBelow(state, id)) {
      state.players[id].skipThisRound = true;
      state.players[id].actLastNextRound = true;
      state.players[id].augustaCooldownNextRound = true;
      addLog(state, `${NAMES[id]} 觸發 ${SKILL_NAMES[id]}，本回合不行動，下回合最後行動。`, withLog);
    }
    if (slot === "daphne" && isStackBottom(state, id) && hasStackAbove(state, id)) {
      state.players[id].bottomBonusThisRound = true;
      addLog(state, `${NAMES[id]} 觸發 ${SKILL_NAMES[id]}，本回合移動 +3。`, withLog);
    }
  }

  if (state.queue.length) moveQueueIdsToEnd(state.queue, lastIds);
}

function applyGroupCRoundEndRules(state, withLog) {
  for (const id of state.playerIds) {
    if (!isGroupC(id) || state.players[id].finished) continue;
    const slot = racerSlot(id);
    if (slot === "snow" && hasStackBelow(state, id)) {
      state.players[id].changliLastChanceNextRound = true;
      addLog(state, `${NAMES[id]} 觸發 ${SKILL_NAMES[id]}，下回合可能最後行動。`, withLog);
    }
  }
}

function applyGroupCTurnRules(state, id, roll, delta, reasons) {
  const slot = racerSlot(id);
  const hasBottomBonus = state.players[id].bottomBonusThisRound || (isStackBottom(state, id) && hasStackAbove(state, id));
  if (slot === "daphne" && hasBottomBonus) {
    reasons.push(`${SKILL_NAMES[id]}：額外前進 3 格`);
    return delta + 3;
  }
  if (slot === "fei" && isLastPlaceIncludingBoss(state, id)) {
    reasons.push(`${SKILL_NAMES[id]}：最後一名額外前進 3 格`);
    return delta + 3;
  }
  return delta;
}

function applyGroupCAfterMoveRules(state, movedIds, from, reasons) {
  const leader = movedIds[0];
  if (!isGroupC(leader)) return;
  const slot = racerSlot(leader);
  if (slot === "west") {
    applyYounuoAnchor(state, leader, reasons);
  }
}

function applyJinxiLandingTrigger(state, landingId, landingPos, withLog, reasons) {
  if (landingId === "boss") return;
  const katId = state.playerIds.find((id) => isGroupC(id) && racerSlot(id) === "kat");
  if (!katId) return;
  const katActor = state.players[katId];
  if (katActor.finished || katActor.position !== landingPos) return;
  const stack = state.stacks[landingPos] || [];
  const katIndex = stack.indexOf(katId);
  const landerIndex = stack.indexOf(landingId);
  if (katIndex < 0 || landerIndex < 0 || landerIndex <= katIndex) return;
  if (Math.random() < 0.4) {
    moveToCurrentStackTop(state, katId);
    reasons.push(`${NAMES[katId]} 發動「${SKILL_NAMES[katId]}」，移動到當前堆疊最上方`);
  }
}

function applyYounuoAnchor(state, leader, reasons) {
  const actor = state.players[leader];
  if (actor.anchorUsed || actor.position <= Math.ceil(FINISH / 2) || actor.position >= FINISH) return;
  const frontPositions = collectNonBossStackPositions(state, actor.position, 1, leader);
  const backPositions = collectNonBossStackPositions(state, actor.position, -1, leader);
  if (!frontPositions.length && !backPositions.length) return;

  actor.anchorUsed = true;
  const frontMoved = [];
  const backMoved = [];
  for (const frontPosition of frontPositions) {
    frontMoved.push(...moveStackToYounuoHead(state, frontPosition, actor.position));
  }
  for (const backPosition of backPositions) {
    backMoved.push(...moveStackToYounuoFeet(state, backPosition, actor.position, leader));
  }
  reasons.push(`${SKILL_NAMES[leader]}：傳送前方 ${frontMoved.length} 顆到頭上、後方 ${backMoved.length} 顆到腳下`);
}

function moveQueueIdsToEnd(queue, ids) {
  const idSet = new Set(ids);
  if (!idSet.size) return;
  const tail = [];
  for (let i = queue.length - 1; i >= 0; i--) {
    if (!idSet.has(queue[i])) continue;
    tail.unshift(queue[i]);
    queue.splice(i, 1);
  }
  queue.push(...tail);
}

function isStackTop(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  return stack[stack.length - 1] === id;
}

function isStackBottom(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  return stack[0] === id;
}

function hasStackBelow(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  return stack.indexOf(id) > 0;
}

function hasNonBossStackBelow(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  const index = stack.indexOf(id);
  if (index <= 0) return false;
  return stack.slice(0, index).some((pid) => pid !== "boss");
}

function moveToCurrentStackTop(state, id) {
  const pos = state.players[id].position;
  const stack = state.stacks[pos];
  const index = stack.indexOf(id);
  if (index < 0 || index === stack.length - 1) return;
  stack.splice(index, 1);
  stack.push(id);
}

function hasStackAbove(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  const index = stack.indexOf(id);
  return index >= 0 && index < stack.length - 1;
}

function hasNonBossStackAbove(state, id) {
  const stack = state.stacks[state.players[id].position] || [];
  const index = stack.indexOf(id);
  if (index < 0 || index >= stack.length - 1) return false;
  return stack.slice(index + 1).some((pid) => pid !== "boss");
}

function collectNonBossStackPositions(state, from, direction, excludeId) {
  const positions = [];
  for (let position = from + direction; position >= 1 && position <= FINISH; position += direction) {
    const stack = state.stacks[position] || [];
    if (stack.some((id) => id !== "boss" && id !== excludeId && !state.players[id]?.finished)) positions.push(position);
  }
  return positions;
}

function takeNonBossStack(state, position) {
  const moving = (state.stacks[position] || []).filter((id) => id !== "boss" && !state.players[id]?.finished);
  removeIdsFromStack(state.stacks[position], moving);
  return moving;
}

function moveStackToYounuoHead(state, from, to) {
  const moving = takeNonBossStack(state, from);
  state.stacks[to].push(...moving);
  for (const id of moving) state.players[id].position = to;
  return moving;
}

function moveStackToYounuoFeet(state, from, to, leader) {
  const moving = takeNonBossStack(state, from);
  const stack = state.stacks[to];
  const leaderIndex = stack.indexOf(leader);
  const insertIndex = leaderIndex >= 0 ? leaderIndex : 0;
  stack.splice(insertIndex, 0, ...moving);
  for (const id of moving) state.players[id].position = to;
  return moving;
}

function moveToHighestStackTop(state, id) {
  const target = state.playerIds
    .filter((pid) => !state.players[pid].finished)
    .map((pid) => state.players[pid].position)
    .sort((a, b) => b - a)[0];
  if (!target) return;
  removeIdsFromStack(state.stacks[state.players[id].position], [id]);
  state.stacks[target].push(id);
  state.players[id].position = target;
}

function teleportCarriedGroup(state, movedIds, to, topId = null) {
  const from = state.players[movedIds[0]].position;
  const landingOrder = topId ? [...movedIds.filter((id) => id !== topId), topId] : movedIds;
  removeIdsFromStack(state.stacks[from], movedIds);
  state.stacks[to].push(...landingOrder);
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
    const move = resolveForwardMove(state, id, from, delta, carried);
    const to = move.to;
    stackLanding(state, to, carried, id);
    actor.position = to;
    checkBossMeeting(state, carried, to);
    return { from, to, carried, wrapped: move.wrapped };
  }
  const carried = stack.splice(index);
  const move = resolveForwardMove(state, id, from, delta, carried);
  const to = move.to;

  stackLanding(state, to, carried, id);
  for (const pid of carried) state.players[pid].position = to;
  checkBossMeeting(state, carried, to);
  return { from, to, carried, wrapped: move.wrapped };
}

function stackLanding(state, to, carried, leader) {
  if (leader === "boss") {
    state.stacks[to].unshift(...carried);
  } else {
    state.stacks[to].push(...carried);
  }
}

function resolveForwardMove(state, leader, from, delta, movedIds = [leader]) {
  if (delta <= 0) return { to: clamp(from + delta, 1, FINISH), wrapped: false };
  const actor = state.players[leader];
  if (actor?.needsFullLap && !actor.finishArmed) {
    const rawTo = from + delta;
    if (from === FINISH || rawTo >= FINISH) {
      armFullLapFinish(state, movedIds);
      return { to: ((rawTo - FINISH) % FINISH) + 1, wrapped: true };
    }
    return { to: rawTo, wrapped: false };
  }
  return { to: clamp(from + delta, 1, FINISH), wrapped: false };
}

function armFullLapFinish(state, ids) {
  for (const id of ids) {
    if (state.players[id]?.needsFullLap) state.players[id].finishArmed = true;
  }
}

function canRecordFinish(state, id) {
  const player = state.players[id];
  return !player?.needsFullLap || player.finishArmed;
}

function applyLandingRules(state, movedIds, withLog, reasons) {
  const leader = movedIds[0];
  const actor = state.players[leader];
  if (actor.position >= FINISH) return;

  if (ADVANCE_CELLS.has(actor.position)) {
    const isALu = isGroupA(leader) && racerSlot(leader) === "lu";
    const bonus = isALu ? 3 : 1;
    reasons.push(isALu ? `${SKILL_NAMES[leader]}：推進裝置 +${bonus}` : `推進裝置 +${bonus}`);
    moveWholeCarriedGroup(state, movedIds, bonus);
  } else if (BLOCK_CELLS.has(actor.position)) {
    const isALu = isGroupA(leader) && racerSlot(leader) === "lu";
    const penalty = isALu ? -2 : -1;
    reasons.push(isALu ? `${SKILL_NAMES[leader]}：阻退裝置 ${penalty}` : `阻退裝置 ${penalty}`);
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
  const move = resolveForwardMove(state, movedIds[0], from, delta, group);
  const to = move.to;
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
  if (!boss.active) return;
  const stack = state.stacks[boss.position];
  const bossIndex = stack.indexOf("boss");
  if (bossIndex < 0) return;
  if (!isBossLastPlace(state)) return;

  stack.splice(bossIndex, 1);
  state.stacks[FINISH].unshift("boss");
  boss.position = FINISH;
  addLog(state, "布大王發動「我還會回來的」，傳回終點，下回合重新出發。", withLog);
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
  const finishers = state.playerIds.filter((id) => {
    const player = state.players[id];
    return !player.finished && player.position >= FINISH && canRecordFinish(state, id);
  });
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

function getRaceRankingIncludingBoss(state) {
  const ids = state.playerIds.filter((id) => !state.players[id].finished);
  if (state.players.boss.active && !state.players.boss.finished) ids.push("boss");
  return ids.sort((a, b) => compareStanding(state, a, b));
}

function isLastPlaceIncludingBoss(state, id) {
  const ranking = getRaceRankingIncludingBoss(state);
  return ranking.length > 1 && ranking[ranking.length - 1] === id;
}

function isBossLastPlace(state) {
  return isLastPlaceIncludingBoss(state, "boss");
}

function getLastNonBoss(state) {
  return state.playerIds
    .map((id) => state.players[id])
    .filter((player) => !player.finished)
    .sort((a, b) => a.position - b.position)[0];
}

async function animateTurn(event) {
  applyDiceColor(event.id);
  diceEl.textContent = event.roll;
  diceEl.dataset.value = String(event.roll);
  diceEl.classList.remove("roll");
  void diceEl.offsetWidth;
  diceEl.classList.add("roll");
  await wait(760);
  await showSkillCallouts(getSkillCallouts(event));

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

  const path = buildPath(event.from, event.to, event.wrapped);
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
}

function getSkillCallouts(event) {
  const ids = [...new Set([event.id, ...game.playerIds])];
  return ids
    .map((id) => ({ id, skillName: SKILL_NAMES[id] }))
    .filter(({ skillName }) => skillName && event.reasons.some((reason) => reason.includes(skillName)))
    .map(({ id, skillName }) => ({
      id,
      skillName,
      position: id === event.id ? event.from : game.players[id]?.position,
    }))
    .filter(({ position }) => Number.isFinite(position));
}

async function showSkillCallouts(callouts) {
  if (!callouts.length) return;
  const nodes = callouts.map(({ id, skillName, position }, index) => {
    const point = cellPoint(position);
    const bubble = document.createElement("div");
    bubble.className = "skill-callout";
    bubble.textContent = skillName;
    bubble.style.setProperty("--x", point.x);
    bubble.style.setProperty("--y", point.y);
    bubble.style.setProperty("--z", 420 + index);
    bubble.style.setProperty("--accent", colorFor(id));
    moversEl.appendChild(bubble);
    return bubble;
  });
  await wait(500);
  nodes.forEach((node) => node.remove());
}

function buildPath(from, to, wrapped = false) {
  if (from === to) return [to];
  if (wrapped) {
    const path = [];
    for (let p = from + 1; p <= FINISH; p++) path.push(p);
    for (let p = 1; p <= to; p++) path.push(p);
    return path;
  }
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
  renderStageRanking();
  renderTurnOrder();
  renderPlayers();
  renderLog();
}

function renderCells() {
  if (cellsEl.children.length) return;
  for (let i = 1; i <= TRACK_LENGTH; i++) {
    const cell = document.createElement("div");
    const point = cellPoint(i);
    cell.className = `cell ${getCellClass(i)}`;
    cell.style.setProperty("--x", point.x);
    cell.style.setProperty("--y", point.y);
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

function renderStageRanking() {
  if (!stageRankingEl) return;
  const previousRects = new Map(
    [...stageRankingEl.querySelectorAll(".stage-ranking-item")].map((item) => [
      item.dataset.id,
      item.getBoundingClientRect(),
    ])
  );
  const finishedRanks = game.rankings || [];
  const unfinished = getRaceRanking(game).filter((id) => !finishedRanks.includes(id));
  const rankedIds = [...finishedRanks, ...unfinished].slice(0, game.playerIds.length);

  stageRankingEl.innerHTML = "";
  rankedIds.forEach((id, index) => {
    const row = document.createElement("div");
    row.className = "stage-ranking-item";
    row.dataset.id = id;
    row.style.setProperty("--rank-color", colorFor(id));
    row.innerHTML = `
      <span class="stage-rank-number">${index + 1}</span>
      <img src="${assetFor(id)}" alt="${NAMES[id]}">
      <span class="stage-rank-name">${NAMES[id]}</span>
    `;
    stageRankingEl.appendChild(row);
  });
  animateStageRanking(previousRects);
}

function animateStageRanking(previousRects) {
  if (!stageRankingEl || previousRects.size === 0) return;
  for (const item of stageRankingEl.querySelectorAll(".stage-ranking-item")) {
    const previous = previousRects.get(item.dataset.id);
    if (!previous) continue;
    const current = item.getBoundingClientRect();
    const deltaY = previous.top - current.top;
    if (Math.abs(deltaY) < 1) continue;
    item.style.transform = `translateY(${deltaY}px)`;
    item.style.transition = "transform 0s";
    requestAnimationFrame(() => {
      item.style.transform = "";
      item.style.transition = "";
      item.classList.add("rank-shift");
      window.setTimeout(() => item.classList.remove("rank-shift"), 520);
    });
  }
}

function renderTurnOrder() {
  if (!turnOrderEl) return;
  const order = game.roundOrder?.length ? game.roundOrder : game.queue;
  turnOrderEl.innerHTML = `
    <div class="turn-order-title">本輪行動順序</div>
    <div class="turn-order-track"></div>
  `;
  const track = turnOrderEl.querySelector(".turn-order-track");
  for (const id of order) {
    const completed = !game.queue.includes(id);
    const card = document.createElement("div");
    card.className = "turn-order-card";
    card.classList.toggle("is-complete", completed);
    card.dataset.id = id;
    card.style.cssText = diceStyleFor(id);
    card.innerHTML = `
      <div class="turn-order-die" aria-label="${NAMES[id]} 的骰子">
        <span>${plannedRollLabel(id)}</span>
      </div>
      <img class="turn-order-avatar" src="${assetFor(id)}" alt="${NAMES[id]}">
    `;
    track.appendChild(card);
  }
}

function plannedRollLabel(id) {
  const roll = game.plannedRolls?.[id];
  if (roll) return roll;
  return id === "boss" ? "?" : "?";
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
      <span class="player-die" style="${diceStyleFor(id)}" aria-label="${NAMES[id]} 的骰子"></span>
      <div class="player-main">
        <div class="player-name" style="color:${colorFor(id)}">${NAMES[id]}</div>
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
        <div class="player-name" style="color:${colorFor(id)}">${NAMES[id]}</div>
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
  const playerIds = activePlayerIds();
  const wins = Object.fromEntries(playerIds.map((id) => [id, 0]));
  const rankTotals = Object.fromEntries(playerIds.map((id) => [id, 0]));
  const topFour = Object.fromEntries(playerIds.map((id) => [id, 0]));
  for (let i = 0; i < count; i++) {
    const sim = createGame();
    while (!sim.finished) stepGame(sim, false);
    wins[sim.rankings[0]] += 1;
    sim.rankings.forEach((id, index) => {
      const rank = index + 1;
      rankTotals[id] += rank;
      if (rank <= 4) topFour[id] += 1;
    });
  }

  simResultsEl.innerHTML = "";
  playerIds
    .map((id) => ({
      id,
      rate: wins[id] / count,
      avgRank: rankTotals[id] / count,
      topFourRate: topFour[id] / count,
    }))
    .sort((a, b) => b.rate - a.rate)
    .forEach(({ id, rate, avgRank, topFourRate }, index) => {
      const row = document.createElement("div");
      row.className = "result-row";
      row.innerHTML = `
        <span class="rank">#${index + 1}</span>
        <img class="avatar" src="${assetFor(id)}" alt="${NAMES[id]}">
        <div class="sim-result-main">
        <div class="player-name">${NAMES[id]}　<strong>${(rate * 100).toFixed(2)}%</strong></div>
        <div class="bar"><div class="bar-fill" style="width:${rate * 100}%;background:${colorFor(id)}"></div></div>
        <div class="sim-stats">
          <span>平均排名 ${avgRank.toFixed(2)}</span>
          <span>前四 ${(topFourRate * 100).toFixed(2)}%</span>
        </div>
        </div>
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

function updateGroupControls() {
  if (customGroupButton) {
    const isCustom = activeGroupId === CUSTOM_GROUP_ID;
    customGroupButton.classList.toggle("active", isCustom);
    customGroupButton.setAttribute("aria-pressed", String(isCustom));
  }
  if (groupSelectEl && GROUPS[activeGroupId]) groupSelectEl.value = activeGroupId;
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
