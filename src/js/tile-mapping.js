// Our custom tile mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILE_MAPPING = {
  BLANK: 19,
  WALL: {
    TOP_LEFT: 33,
    TOP_RIGHT: 32,
    BOTTOM_RIGHT: 16,
    BOTTOM_LEFT: 17,
    TOP: 35,
    LEFT: 20,
    RIGHT: 18,
    BOTTOM: 3
  },
  FLOOR: [{ index: 48, weight: 9 }, { index: 49, weight: 0.25 }],

  BUTLER_ROOM: {
  TOP_FIRST: [{ index: 55, weight: 1}, { index: 56, weight: 1}, { index: 57, weight: 1}, { index: 58, weight: 1}],

  TOP_SECOND: [{ index: 66, weight: 1}, { index: 67, weight: 1}, { index: 70, weight: 1}],

  LEFT: [
    [131],
    [147],
    [132],
    [148]
  ],

  RIGHT: [
    [53],
    [69],
    [85],
  ],

  MIDDLE: [
    [134, 134],
    [150, 150]
  ],

  ITEM: [
    [7],
    [8]
  ],

  ENEMYFLOOR: [{ index: 65, weight: 9 }, { index: 81, weight: 0.25 }],
},

  KITCHEN: {
    TOP_FIRST: [{ index: 83, weight: 1}, { index: 50, weight: 1}, { index: 51, weight: 1}, { index: 82, weight: 1}, { index: 84, weight: 1}, { index: 52, weight: 1}],

    TOP_SECOND: [{ index: 66, weight: 1}, { index: 67, weight: 1}, { index: 86, weight: 1}, { index: 68, weight: 1}],

    LEFT: [
      [13],
      [29],
      [45]
    ],

    RIGHT: [
      [12],
      [28],
      [98],
      [114]
    ],

    MIDDLE: [
      [176, 177],
      [192, 193]
    ],

    ITEM: 6,

    ENEMYFLOOR: [{ index: 64, weight: 9 }, { index: 80, weight: 0.25 }],
},
  POT: [{ index: 160, weight: 1 }, { index: 161, weight: 1 }, { index: 45, weight: 1 }],
  DOOR: {
    TOP: [36, 48, 48, 34],
    // prettier-ignore
    LEFT: [
      [36],
      [48],
      [48],
      [4]
    ],
    BOTTOM: [4, 48, 48, 2],
    // prettier-ignore
    RIGHT: [
      [34],
      [48],
      [48],
      [2]
    ]
  },
  CHEST: 25,
  STAIRS: 1,
  // prettier-ignore
  TOWER: [
    [14],
    [30],
    [46]
  ]
};

export default TILE_MAPPING;
