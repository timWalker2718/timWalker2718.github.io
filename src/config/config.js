/*global Phaser*/

export default {
  type: Phaser.AUTO,
  backgroundColor: "#000",
  parent:"game-container",
  pixelArt: true,
  scale: {
    parent: "game-container",
    mode: Phaser.Scale.FIT,
    width: 800,
    height: 600
  },
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 }
    }
  }
};
