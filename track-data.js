(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DangoTrack = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const TRACK_LENGTH = 32;
  const STORAGE_KEY = "dango-race-track-config";
  const TRACK_VERSION = 2;
  const DEFAULT_ADVANCE_CELLS = [3, 11, 16, 23];
  const DEFAULT_BLOCK_CELLS = [10, 28];
  const DEFAULT_TIME_CELLS = [6, 20];

  const defaultPoints = [
    { index: 1, x: 79.909, y: 52.329 },
    { index: 2, x: 86.858, y: 58.904 },
    { index: 3, x: 89.728, y: 69.863 },
    { index: 4, x: 85.801, y: 80.822 },
    { index: 5, x: 75.076, y: 69.041 },
    { index: 6, x: 69.486, y: 78.356 },
    { index: 7, x: 60.574, y: 71.507 },
    { index: 8, x: 51.964, y: 71.507 },
    { index: 9, x: 42.598, y: 76.438 },
    { index: 10, x: 31.873, y: 86.849 },
    { index: 11, x: 20.091, y: 86.849 },
    { index: 12, x: 8.157, y: 89.589 },
    { index: 13, x: 4.985, y: 76.712 },
    { index: 14, x: 5.74, y: 63.836 },
    { index: 15, x: 16.767, y: 50.411 },
    { index: 16, x: 24.924, y: 42.74 },
    { index: 17, x: 31.873, y: 37.26 },
    { index: 18, x: 37.764, y: 33.699 },
    { index: 19, x: 41.239, y: 29.041 },
    { index: 20, x: 39.577, y: 23.288 },
    { index: 21, x: 36.858, y: 18.904 },
    { index: 22, x: 37.764, y: 14.247 },
    { index: 23, x: 39.879, y: 13.151 },
    { index: 24, x: 44.713, y: 14.247 },
    { index: 25, x: 50, y: 13.699 },
    { index: 26, x: 55.136, y: 13.699 },
    { index: 27, x: 59.97, y: 13.699 },
    { index: 28, x: 62.387, y: 18.904 },
    { index: 29, x: 64.804, y: 24.384 },
    { index: 30, x: 65.861, y: 29.589 },
    { index: 31, x: 69.637, y: 40.548 },
    { index: 32, x: 75.227, y: 47.671 },
  ];

  const DEFAULT_TRACK_CONFIG = Object.freeze({
    length: TRACK_LENGTH,
    version: TRACK_VERSION,
    finish: TRACK_LENGTH,
    backgroundImage: "public/maps/reference-map.png",
    points: defaultPoints,
    advanceCells: DEFAULT_ADVANCE_CELLS,
    blockCells: DEFAULT_BLOCK_CELLS,
    timeCells: DEFAULT_TIME_CELLS,
  });

  function createTrackConfig(input = {}) {
    return validateTrackConfig({
      ...DEFAULT_TRACK_CONFIG,
      ...input,
      points: input.points || DEFAULT_TRACK_CONFIG.points,
      advanceCells: input.advanceCells || DEFAULT_TRACK_CONFIG.advanceCells,
      blockCells: input.blockCells || DEFAULT_TRACK_CONFIG.blockCells,
      timeCells: input.timeCells || DEFAULT_TRACK_CONFIG.timeCells,
    });
  }

  function validateTrackConfig(input) {
    if (!input || !Array.isArray(input.points)) {
      throw new Error("Track config must include a points array.");
    }

    const length = Number(input.length || input.points.length);
    if (length !== TRACK_LENGTH || input.points.length !== TRACK_LENGTH) {
      throw new Error("Track config must contain exactly 32 points.");
    }

    const seen = new Set();
    const points = input.points.map((point, arrayIndex) => {
      const index = Number(point.index || arrayIndex + 1);
      const x = Number(point.x);
      const y = Number(point.y);

      if (!Number.isInteger(index) || index < 1 || index > TRACK_LENGTH || seen.has(index)) {
        throw new Error("Track points must use unique indexes from 1 to 32.");
      }
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
        throw new Error("Track point coordinates must be percentages from 0 to 100.");
      }

      seen.add(index);
      return { index, x: roundPercent(x), y: roundPercent(y) };
    });

    points.sort((a, b) => a.index - b.index);

    return {
      length: TRACK_LENGTH,
      version: Number(input.version || 0),
      finish: normalizeCell(input.finish || TRACK_LENGTH),
      backgroundImage: typeof input.backgroundImage === "string" ? input.backgroundImage : "",
      points,
      advanceCells: normalizeCells(input.advanceCells || []),
      blockCells: normalizeCells(input.blockCells || []),
      timeCells: normalizeCells(input.timeCells || []),
    };
  }

  function loadTrackConfig(storage) {
    const store = storage || (typeof window !== "undefined" ? window.localStorage : null);
    if (!store) return createTrackConfig();

    try {
      const saved = store.getItem(STORAGE_KEY);
      if (!saved) return createTrackConfig();
      const parsed = JSON.parse(saved);
      return parsed.version === TRACK_VERSION ? createTrackConfig(parsed) : createTrackConfig();
    } catch (error) {
      return createTrackConfig();
    }
  }

  function serializeTrackConfig(config) {
    const safe = validateTrackConfig(config);
    return JSON.stringify(
      {
        version: TRACK_VERSION,
        length: safe.length,
        finish: safe.finish,
        backgroundImage: safe.backgroundImage,
        points: safe.points,
        advanceCells: [...safe.advanceCells],
        blockCells: [...safe.blockCells],
        timeCells: [...safe.timeCells],
      },
      null,
      2
    );
  }

  function normalizeCells(cells) {
    const unique = [...new Set(Array.from(cells).map(normalizeCell))];
    unique.sort((a, b) => a - b);
    return new Set(unique);
  }

  function normalizeCell(cell) {
    const value = Number(cell);
    if (!Number.isInteger(value) || value < 1 || value > TRACK_LENGTH) {
      throw new Error("Special cell indexes must be integers from 1 to 32.");
    }
    return value;
  }

  function roundPercent(value) {
    return Math.round(value * 1000) / 1000;
  }

  return {
    STORAGE_KEY,
    TRACK_LENGTH,
    TRACK_VERSION,
    DEFAULT_TRACK_CONFIG,
    createTrackConfig,
    loadTrackConfig,
    serializeTrackConfig,
    validateTrackConfig,
  };
});
