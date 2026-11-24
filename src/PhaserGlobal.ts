import Phaser from "phaser";

// Phaser 4's ES module build doesn't create the global `Phaser`, but scene and component files
// use the global namespace (they extend Phaser classes at load time). main.ts imports this first.
(window as unknown as { Phaser: typeof Phaser }).Phaser = Phaser;
