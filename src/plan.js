// Measurements shared by every file that builds the flat. All in metres.
//
// The floor plan. X runs left to right (west to east), Z runs top to bottom
// (north to south). "=" is a doorway.
//
//             x=0          x=4.2  x=5.7        x=8.1  x=9.3
//   z=0        +------------+------+-------------------+
//              |            |      |                   |
//              |   STUDY    =      =    BEDROOM 2      |
//              |  (the PC)  |      |  (empty: the old  |
//   z=3.4      +------------+  C   |   flatmate's)     |
//              |            |  O   +------------+------+ z=3.6
//              | BEDROOM 1  =  R   =   BATH     |
//              |            |  R   +------------+ z=6.2
//   z=7.2      +------------+  I   =   STORE    |
//              |            |  D   +------------+ z=8.2
//              |  KITCHEN      O   |
//              |  + DINING     R   |
//              |            |      |
//   z=12       +------------+-door-+
//
// Windows: study, bedroom 1 and the kitchen (two) on the west wall, looking
// across a lane at the buildings opposite. Bedroom 2 has one on the east
// wall, curtains shut.
export const CEILING = 2.8; // floor to ceiling
export const DOOR_HEIGHT = 2.1;
export const WALL = 0.12; // wall thickness
export const HALF = WALL / 2;

// Where the street lamp outside hangs. Its light comes in through the west windows.
export const STREET_LAMP = [-5.9, 1.38, 6.0];
