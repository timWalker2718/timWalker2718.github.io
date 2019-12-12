/*global Phaser*/
export default class Intro extends Phaser.Scene {
  constructor () {
    super('Intro');
    this.currentFrame = 0
  }

  init(data) {
    this.controls = data.controls
    console.log(this.controls)
  }

  preload () {
    // Preload assets
    this.load.image("comic1", "../assets/comic/final/comic1final.png")
    this.load.image("comic2", "../assets/comic/final/comic2final.png")
    this.load.image("comic3", "../assets/comic/final/comic3final.png")
    this.load.image("comic4", "../assets/comic/final/comic4final.png")
  }

  create (data) {
    var cam = this.cameras.main
    this.comic1 = this.add.sprite(cam.centerX, cam.centerY, 'comic1');
    this.comic2 = this.add.sprite(cam.centerX, cam.centerY, 'comic2');
    this.comic3 = this.add.sprite(cam.centerX, cam.centerY, 'comic3');
    this.comic4 = this.add.sprite(cam.centerX, cam.centerY, 'comic4');
    this.comic1.alpha = 0
    this.comic2.alpha = 0
    this.comic3.alpha = 0
    this.comic4.alpha = 0

    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.add.text(650, 20, "(press esc to skip)", {
      font: "12px monospace",
      fill: "#ffffff",
      align: "center"
      // boundsAlignH: "center",
      // boundsAlignV: "middle",
      // padding: { x: 20, y: 10 },
      // backgroundColor: "#ffffff"
    })
    .setScrollFactor(0);
  }

  update (time, delta) {
    this.currentFrame++
    this.comic1.alpha += 0.005
    if (this.currentFrame > 400) {
      this.comic2.alpha += 0.005
    }

    if (this.currentFrame > 800) {
      this.comic3.alpha += 0.005
    }

    if (this.currentFrame > 1200) {
      this.comic4.alpha += 0.005
    }

    if (this.currentFrame > 1600 || this.escKey.isDown) {
      this.scene.start("TutorialScene", {controls: this.controls})
    }
  }
}
