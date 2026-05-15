const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_TRACK_CONFIG,
  DEFAULT_TRACK_ID,
  TRACKS,
  STORAGE_KEY,
  createTrackConfig,
  getTrackStorageKey,
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

test("track definitions include separate group and knockout maps", () => {
  assert.equal(DEFAULT_TRACK_ID, "group");
  assert.equal(TRACKS.group.backgroundImage, "public/maps/reference-map.png");
  assert.equal(TRACKS.knockout.backgroundImage, "public/maps/knockout-map.png");
  assert.equal(getTrackStorageKey("group"), STORAGE_KEY);
  assert.equal(getTrackStorageKey("knockout"), `${STORAGE_KEY}:knockout`);
});

test("loadTrackConfig reads the requested track storage key", () => {
  const points = Array.from({ length: 32 }, (_, index) => ({
    index: index + 1,
    x: index + 1,
    y: index + 2,
  }));
  const storage = {
    getItem(key) {
      assert.equal(key, `${STORAGE_KEY}:knockout`);
      return JSON.stringify({
        version: 2,
        backgroundImage: "public/maps/knockout-map.png",
        points,
        advanceCells: [2],
        blockCells: [3],
        timeCells: [4],
        finish: 32,
      });
    },
  };

  const config = loadTrackConfig(storage, "knockout");

  assert.equal(config.backgroundImage, "public/maps/knockout-map.png");
  assert.equal(config.points[0].x, 1);
  assert.deepEqual([...config.timeCells], [4]);
});

test("knockout track falls back to baked knockout coordinates when no saved data exists", () => {
  const storage = {
    getItem(key) {
      assert.equal(key, `${STORAGE_KEY}:knockout`);
      return null;
    },
  };

  const config = loadTrackConfig(storage, "knockout");

  assert.equal(config.backgroundImage, "public/maps/knockout-map.png");
  assert.equal(config.points[0].x, 85.115);
  assert.equal(config.points[0].y, 47.951);
  assert.equal(config.points[9].x, 37.948);
  assert.equal(config.points[9].y, 81.496);
  assert.equal(config.points[31].x, 79.466);
  assert.equal(config.points[31].y, 41.209);
  assert.deepEqual([...config.advanceCells], [4, 10, 20]);
  assert.deepEqual([...config.blockCells], [16, 26, 30]);
  assert.deepEqual([...config.timeCells], [6, 14, 23]);
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
