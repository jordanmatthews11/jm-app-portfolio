/**
 * Block Dude puzzle levels. Tiles: W=wall, space=empty, F=floor, B=block, D=door, P=player start.
 * Player must move blocks to build stairs and reach the door.
 */
export const LEVELS = [
  {
    map: [
      'WWWWWWWWWWWW',
      'W          W',
      'W   B      W',
      'WWWW  WWWWWW',
      'W    D     W',
      'WWWWWWWWWWWW',
    ],
    playerStart: { row: 2, col: 1 },
  },
  {
    map: [
      'WWWWWWWWWWWWW',
      'W     B     W',
      'W           W',
      'WWWWW   WWWWW',
      'W   B   D   W',
      'WWWWWWWWWWWWW',
    ],
    playerStart: { row: 2, col: 1 },
  },
  {
    map: [
      'WWWWWWWWWWWWWW',
      'W    B  B    W',
      'W             W',
      'WWWWWW   WWWWWW',
      'W      B      W',
      'WWWWWW   WWWWWW',
      'W   B   D     W',
      'WWWWWWWWWWWWWW',
    ],
    playerStart: { row: 2, col: 1 },
  },
  {
    map: [
      'WWWWWWWWWWWWWWW',
      'W   B   B     W',
      'W             W',
      'W             W',
      'WWWWWW   WWWWWWW',
      'W    B        W',
      'WWWWWW   WWWWWWW',
      'W   B   D     W',
      'WWWWWWWWWWWWWWW',
    ],
    playerStart: { row: 2, col: 1 },
  },
  {
    map: [
      'WWWWWWWWWWWWWWWW',
      'W  B   B   B   W',
      'W               W',
      'W               W',
      'WWWWWWW   WWWWWWWW',
      'W     B         W',
      'WWWWWWW   WWWWWWWW',
      'W   B   B       W',
      'WWWWWWW   WWWWWWWW',
      'W       D       W',
      'WWWWWWWWWWWWWWWW',
    ],
    playerStart: { row: 2, col: 1 },
  },
  {
    map: [
      'WWWWWWWWWWWWW',
      'W           W',
      'W   W WW WW W',
      'W   W W W W W',
      'W W W W W W W',
      'W WWW W   W W',
      'W    B     DW',
      'F B BBB     F',
      'FFFFFFFFFFFFF',
    ],
    playerStart: { row: 4, col: 3 },
  },
]
