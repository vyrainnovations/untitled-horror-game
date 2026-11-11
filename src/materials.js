// Materials: what each surface is made of. A material is a texture plus how
// it reacts to light.
//
//   matte   lit by the room lights, no shine. Walls, wood, cloth.
//   glossy  lit, with a highlight where a light reflects. Tiles, steel, enamel.
//   lit     glows by itself and ignores the room lights and the fog. Screens,
//           LEDs, lamps, and everything outside the windows.
import * as THREE from 'three';
import { createTextures } from './textures.js';

export function createMaterials() {
  const T = createTextures();

  // A repeating texture knows its real-world size. Pass that on to the
  // material, so the builder can lay it out at the right scale.
  const keepTile = (material, map) => {
    if (map && map.userData.tile) material.userData.tile = map.userData.tile;
    return material;
  };
  const matte = (map, opts = {}) => keepTile(new THREE.MeshLambertMaterial({ map, ...opts }), map);
  const glossy = (map, shininess, specular = 0x333333, opts = {}) =>
    keepTile(new THREE.MeshPhongMaterial({ map, shininess, specular, ...opts }), map);
  const lit = (color, map = null) => new THREE.MeshBasicMaterial({ color, map, fog: false });
  const haze = (color, opacity) =>
    new THREE.SpriteMaterial({ map: T.glow, color, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const both = THREE.DoubleSide; // cloth is seen from both sides

  return {
    // --- Walls, ceilings, floors ---
    studyWall: matte(T.studyWall),
    bed1Wall: matte(T.bed1Wall),
    bed2Wall: matte(T.bed2Wall),
    hallWall: matte(T.hallWall),
    kitchenWall: matte(T.kitchenWall),
    storeWall: matte(T.storeWall),
    bathWall: glossy(T.bathWall, 50, 0x2a2a2a),
    ceiling: matte(T.ceiling),
    plaster: matte(T.plaster),
    outside: new THREE.MeshLambertMaterial({ color: 0x141416 }),
    mosaic: glossy(T.mosaic, 18, 0x141414),
    kitchenFloor: glossy(T.kitchenFloor, 35, 0x222222),
    bathFloor: glossy(T.bathFloor, 60, 0x3a3a3a),
    cement: matte(T.cement),
    backsplash: glossy(T.backsplash, 40, 0x2a2a2a),
    stone: matte(T.plaster, { color: 0x707070 }),

    // --- Wood ---
    woodDark: matte(T.woodDark),
    woodMid: matte(T.woodMid),
    woodLight: matte(T.woodLight),
    laminate: matte(T.laminate),

    // --- Cloth ---
    sheet: matte(T.sheet),
    blanket: matte(T.blanket, { side: both }),
    curtain: matte(T.curtain, { side: both, emissive: 0x241103 }), // glows a little: the lamp behind it
    curtainShut: matte(T.curtain, { side: both, emissive: 0x1a0d03 }),
    towel: matte(T.towel),
    napkin: matte(T.napkin),
    clothDark: matte(T.clothDark),
    clothOlive: matte(T.clothOlive),
    clothBlue: matte(T.clothBlue),
    clothGrey: matte(T.clothGrey),
    clothRed: matte(T.clothGrey, { color: 0xa04038 }),
    dustSheet: matte(T.clothGrey, { color: 0xe6e2d6, side: both }),
    sack: matte(T.clothGrey, { color: 0xc8b48a }),

    // --- Metal, stone, plastic, china ---
    steel: glossy(T.steel, 50, 0x666666),
    darkMetal: glossy(T.darkMetal, 30, 0x222222),
    granite: glossy(T.granite, 70, 0x444444),
    cardboard: matte(T.cardboard),
    whitePlastic: glossy(T.whitePlastic, 30, 0x222222),
    blackPlastic: glossy(T.blackPlastic, 40, 0x2a2a2a),
    redPlastic: glossy(T.whitePlastic, 30, 0x222222, { color: 0xb5362c }),
    bluePlastic: glossy(T.whitePlastic, 30, 0x222222, { color: 0x3466a0 }),
    greenPlastic: glossy(T.whitePlastic, 30, 0x222222, { color: 0x3f7a50 }),
    yellowPlastic: glossy(T.whitePlastic, 30, 0x222222, { color: 0xc9a030 }),
    ceramic: glossy(T.ceramic, 70, 0x555555),
    enamel: glossy(T.whitePlastic, 25, 0x222222, { color: 0x6a7462 }), // painted steel
    paper: matte(T.paper),
    rubber: new THREE.MeshLambertMaterial({ color: 0x1c2a3a }),
    leaf: new THREE.MeshLambertMaterial({ color: 0x2f4a2c, side: both }),
    earth: new THREE.MeshLambertMaterial({ color: 0x2a1f16 }),
    terracotta: new THREE.MeshLambertMaterial({ color: 0x8a4a2c }),
    liquid: glossy(null, 90, 0x666666, { color: 0x0a1014 }),
    chai: glossy(null, 60, 0x333333, { color: 0x6a4424 }),
    glass: new THREE.MeshPhongMaterial({ map: T.grime, transparent: true, depthWrite: false, shininess: 90, specular: 0x555555 }),
    bulbOff: new THREE.MeshLambertMaterial({ color: 0x8a8778 }),

    // --- Painted to fit one object ---
    doorWood: matte(T.doorWood),
    doorFront: matte(T.doorFront),
    doorBath: glossy(T.doorBath, 20, 0x1a1a1a),
    cupboard: glossy(T.cupboard, 25, 0x222222),
    cabinetsLow: matte(T.cabinetsLow),
    cabinetsWest: matte(T.cabinetsWest),
    cabinetsHigh2: matte(T.cabinetsHigh2),
    cabinetsHigh3: matte(T.cabinetsHigh3),
    drawers: matte(T.drawers),
    sideboard: matte(T.sideboard),
    tallUnit: matte(T.tallUnit),
    wardrobe: matte(T.wardrobe),
    fridge: glossy(T.fridge, 40, 0x333333),
    microwave: glossy(T.microwave, 60, 0x444444),
    washer: glossy(T.washer, 40, 0x333333),
    tube: glossy(T.tube, 60, 0x444444),
    tapes: matte(T.tapes),
    posterMoon: matte(T.posterMoon),
    posterDoor: matte(T.posterDoor),
    posterFest: matte(T.posterFest),
    pinboard: matte(T.pinboard),
    calendar: matte(T.calendar),
    clock: matte(T.clock),
    landscape: matte(T.landscape),
    familyPhoto: matte(T.familyPhoto),
    certificate: matte(T.certificate),
    abstractArt: matte(T.abstractArt),
    forest: matte(T.forest),
    ghost: matte(T.ghost, { transparent: true, depthWrite: false }),
    keyboard: matte(T.keyboard),
    books: T.books.map((map) => matte(map)),
    switchboard: matte(T.switchboard),
    stoveTop: glossy(T.stoveTop, 40, 0x333333),
    newspaper: matte(T.newspaper),
    mirror: glossy(T.mirror, 120, 0x888888),
    airCon: matte(T.airCon),
    fuseBox: matte(T.fuseBox),
    rug: matte(T.rug),
    doormat: matte(T.doormat),
    boxSide: matte(T.boxSide),
    purifier: matte(T.purifier),
    exhaust: matte(T.exhaust),
    sinkSteel: glossy(T.sinkSteel, 60, 0x555555),
    sinkCeramic: glossy(T.sinkCeramic, 70, 0x555555),
    drain: matte(T.drain),
    pillow: matte(T.pillow),

    // --- Glowing things ---
    screen: lit(0xffffff, T.screen),
    digits: lit(0xffffff, T.digits),
    digitsGreen: lit(0xffffff, T.digitsGreen),
    ledRed: lit(0xff2a14),
    ledGreen: lit(0x3cff6a),
    ledBlue: lit(0x4a9cff),
    ledAmber: lit(0xffa030),
    bulbOn: lit(0xffe2b0),
    tubeOn: lit(0xcfe6c8),
    lampHead: lit(0xffb060),
    hazeWarm: haze(0xffb060, 0.5),
    hazeCold: haze(0xbfe0b8, 0.35),
    hazeBlue: haze(0x8fb0e8, 0.25),
    hazeOrange: haze(0xff8a30, 0.8),

    // --- Outside the windows (painted, not lit) ---
    facade: lit(0xffffff, T.facade),
    lane: lit(0xffffff, T.lane),
    silhouette: lit(0x050608),
  };
}
