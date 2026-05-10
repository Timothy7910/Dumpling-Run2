const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_TRACK_CONFIG,
  STORAGE_KEY,
  createTrackConfig,
  loadTrackConfig,
  serializeTrackConfig,
  validateTrackConfig,
} = require("../track-data.js");

test("default track has 32 numbered points and expected special cells", () => {
  const config = validateTrackConfig(DEFAULT_TRACK_CONFIG);

  assert.equal(config.length, 32);
  assert.equal(config.finish, 32);
  assert.deepEqual([...config.advanceCells], [3, 11, 16, 23]);
  assert.deepEqual([...config.blockCells], [10, 28]);
  assert.deepEqual([...config.timeCells], [6, 20]);
  assert.equal(config.backgroundImage, "public/maps/reference-map.png");
  assert.equal(config.points[0].index, 1);
  assert.equal(config.points[0].x, 79.909);
  assert.equal(config.points[0].y, 52.329);
  assert.equal(config.points[31].index, 32);
});

test("createTrackConfig accepts annotated points and custom cell types", () => {
  const points = Array.from({ length: 32 }, (_, index) => ({
    index: index + 1,
    x: 4 + index,
    y: 8 + index,
  }));

  const config = createTrackConfig({
    points,
    advanceCells: [2],
    blockCells: [8],
    timeCells: [13],
    finish: 32,
    backgroundImage: "public/maps/reference-map.png",
  });

  assert.equal(config.points[1].x, 5);
  assert.equal(config.points[1].y, 9);
  assert.deepEqual([...config.advanceCells], [2]);
  assert.deepEqual([...config.blockCells], [8]);
  assert.deepEqual([...config.timeCells], [13]);
  assert.equal(config.backgroundImage, "public/maps/reference-map.png");
});

test("loadTrackConfig falls back to defaults when saved data is invalid", () => {
  const storage = {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return JSON.stringify({ points: [{ index: 1, x: 50, y: 50 }] });
    },
  };

  const config = loadTrackConfig(storage);

  assert.equal(config.length, 32);
  assert.deepEqual([...config.advanceCells], [3, 11, 16, 23]);
});

test("loadTrackConfig ignores unversioned saved configs so baked map is used", () => {
  const points = Array.from({ length: 32 }, (_, index) => ({
    index: index + 1,
    x: 50,
    y: 50,
  }));
  const storage = {
    getItem() {
      return JSON.stringify({
        points,
        advanceCells: [],
        blockCells: [],
        timeCells: [5],
        finish: 32,
      });
    },
  };

  const config = loadTrackConfig(storage);

  assert.equal(config.points[0].x, 79.909);
  assert.deepEqual([...config.timeCells], [6, 20]);
});

test("loadTrackConfig accepts current-version saved configs", () => {
  const points = Array.from({ length: 32 }, (_, index) => ({
    index: index + 1,
    x: index + 1,
    y: index + 2,
  }));
  const storage = {
    getItem() {
      return JSON.stringify({
        version: 2,
        points,
        advanceCells: [2],
        blockCells: [3],
        timeCells: [4],
        finish: 32,
      });
    },
  };

  const config = loadTrackConfig(storage);

  assert.equal(config.points[0].x, 1);
  assert.deepEqual([...config.timeCells], [4]);
});

test("serializeTrackConfig accepts a validated config with Set special cells", () => {
  const config = createTrackConfig();
  const serialized = JSON.parse(serializeTrackConfig(config));

  assert.deepEqual(serialized.advanceCells, [3, 11, 16, 23]);
  assert.deepEqual(serialized.blockCells, [10, 28]);
  assert.deepEqual(serialized.timeCells, [6, 20]);
});
