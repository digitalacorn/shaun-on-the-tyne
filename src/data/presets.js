export const presets = [
  {
    name: 'Clear',
    data: {
      start: 0,
      finish: 0,
      clusters: [],
    },
  },
  {
    name: 'Airport->Gosforth',
    data: {
      start: 27,
      finish: 45,
      clusters: [
        [19, 39],
        [2, 18, 28, 43, 1, 4, 20],
        [17, 31, 36, 48, 37, 24, 6, 13, 41, 34],
        [44, 15, 38, 3, 9, 29, 23],
        [5, 21],
        [47, 30, 16],
      ],
    },
  },

  {
    name: 'Airport->Newburn',
    data: {
      start: 27,
      finish: 12,
      clusters: [
        [45, 19, 39],
        [2, 18, 28, 43, 1, 4],
        [17, 31, 36, 48, 37, 24, 6, 13],
        [44, 15, 38, 3, 9, 29, 23],
        [5, 21],
      ],
    },
  },
  {
    name: 'Newburn loop',
    data: {
      start: 12,
      finish: 12,
      clusters: [
        [45, 19, 39],
        [2, 18, 28, 43, 1, 4],
        [17, 31, 36, 48, 37, 24, 6, 13],
        [44, 15, 38, 3, 9, 29, 23],
        [5, 21],
        [14, 42, 35, 22],
      ],
    },
  },
];

export const defaultPreset = 1;
