const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("game page exposes an A/B group selector beside the title", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.match(html, /id="groupSelect"/);
  assert.doesNotMatch(html, /<option value="custom"/);
  assert.match(html, /id="customGroupButton"/);
  assert.match(html, /id="customModal"/);
  assert.match(html, />A組</);
  assert.match(html, />B組</);
});

test("B group is the default group for new page visits", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  assert.match(script, /DEFAULT_GROUP_ID = "b"/);
  assert.match(script, /normalizeGroupId\(saved \|\| DEFAULT_GROUP_ID\)/);
});

test("B group defines the requested dango racers and assets", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  for (const name of ["千咲團子", "莫寧團子", "琳奈團子", "愛彌斯團子", "守岸人團子", "珂萊塔團子"]) {
    assert.match(script, new RegExp(name));
  }

  for (const asset of ["chisa", "moning", "linai", "aiyisi", "shorekeeper", "cartethyia"]) {
    assert.match(script, new RegExp(`public/dangos/${asset}-raw\\.png`));
    assert.ok(fs.existsSync(path.join(root, "public", "dangos", `${asset}-raw.png`)));
  }
});

test("B group has behavior hooks for its custom dice and movement rules", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  assert.match(script, /isGroupB/);
  assert.match(script, /rollForPlayer/);
  assert.match(script, /applyGroupBTurnRules/);
  assert.match(script, /applyGroupBAfterMoveRules/);
});

test("stage overlay controls scale with the map on narrow screens", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.match(script, /--stage-scale/);
  assert.match(script, /updateStageScale/);
  assert.match(styles, /\.dice[\s\S]*--stage-scale/);
  assert.match(styles, /\.stage-controls[\s\S]*--stage-scale/);
  assert.match(styles, /\.cell[\s\S]*--stage-scale/);
});

test("custom map keeps coordinate overlays aligned on mobile", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.match(styles, /\.game-body \.stage\.custom-map[\s\S]*background:[\s\S]*100% 100% no-repeat/);
  assert.doesNotMatch(styles, /@media \(max-width: 560px\)[\s\S]*\.game-body \.stage\.custom-map\s*\{[\s\S]*height:\s*100%/);
});

test("transparent racer pieces avoid rectangular image shadows", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const pieceRule = styles.match(/\.piece,\s*\.moving-piece\s*\{[\s\S]*?\n\}/)?.[0] || "";

  assert.doesNotMatch(pieceRule, /box-shadow/);
  assert.match(styles, /\.piece,\s*\.moving-piece,[\s\S]*filter:[\s\S]*drop-shadow/);
});

test("custom group can select six racers from both groups", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  assert.match(script, /CUSTOM_GROUP_ID = "custom"/);
  assert.match(script, /CUSTOM_SELECTION_SIZE = 6/);
  assert.match(script, /getCustomRacerOptions/);
  assert.match(script, /activePlayerIds/);
  assert.match(script, /racerSourceGroup/);
  assert.match(script, /racerSlot/);
});

test("custom group can assign starting positions from the allowed late-race cells", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.match(script, /CUSTOM_START_POSITIONS = \[29, 30, 31, 32, 1\]/);
  assert.match(script, /CUSTOM_START_STORAGE_KEY/);
  assert.match(script, /loadCustomStartPositions/);
  assert.match(script, /getCustomPickerStartPositions/);
  assert.match(script, /stacks\[startPosition\]\.push\(id\)/);
  assert.match(script, /class="custom-start-select"/);
  assert.match(styles, /\.custom-start-control/);
});

test("custom racers starting near the finish must complete a full lap before finishing", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  assert.match(script, /CUSTOM_FULL_LAP_START_POSITIONS = \[29, 30, 31, 32\]/);
  assert.match(script, /needsFullLap/);
  assert.match(script, /finishArmed/);
  assert.match(script, /resolveForwardMove/);
  assert.match(script, /armFullLapFinish/);
  assert.match(script, /canRecordFinish/);
  assert.match(script, /rawTo >= FINISH/);
  assert.match(script, /player\.position >= FINISH && canRecordFinish\(state, id\)/);
  assert.match(script, /buildPath\(event\.from, event\.to, event\.wrapped\)/);
  assert.match(script, /if \(wrapped\)/);
});

test("win-rate simulation reports average rank and top-four rate", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.match(script, /rankTotals/);
  assert.match(script, /topFour/);
  assert.match(script, /avgRank/);
  assert.match(script, /topFourRate/);
  assert.match(script, /平均排名/);
  assert.match(script, /前四/);
  assert.match(styles, /\.sim-stats/);
});

test("B snow teleports onto the nearest racer ahead and lands on top", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

  assert.match(script, /position > actor\.position/);
  assert.match(script, /\.sort\(\(a, b\) => a - b\)\[0\]/);
  assert.match(script, /teleportCarriedGroup\(state, movedIds, targetPosition, leader\)/);
  assert.match(script, /topId \? \[\.\.\.movedIds\.filter\(\(id\) => id !== topId\), topId\] : movedIds/);
});

test("map removes transient text overlays and first-place spotlight", () => {
  const script = fs.readFileSync(path.join(root, "game.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.doesNotMatch(html, /id="skillNotice"/);
  assert.doesNotMatch(html, /id="spotlight"/);
  assert.doesNotMatch(script, /showSkillNotice/);
  assert.doesNotMatch(script, /showSpotlight/);
  assert.doesNotMatch(script, /cell\.textContent/);
});
