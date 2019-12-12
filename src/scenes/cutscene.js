/*global Phaser*/
export default class Cutscene extends Phaser.Scene {
  constructor () {
    super('Cutscene');
    this.currentFrame = 0
  }

  init(data) {
    this.playerHealth = data.health;
    this.bulletPower = data.power;
    this.bulletSpeed = data.speed;
    this.bulletCooldown = data.cooldown;
    this.controls = data.controls
  }


  preload () {
    // Preload assets
    this.load.image("comic21", "../assets/comic/final2/comic1final.png")
    this.load.image("comic22", "../assets/comic/final2/comic2final.png")
    this.load.image("comic23", "../assets/comic/final2/comic3final.png")
  }

  create (data) {
    var cam = this.cameras.main
    this.comic21 = this.add.sprite(cam.centerX, cam.centerY, 'comic21');
    this.comic22 = this.add.sprite(cam.centerX, cam.centerY, 'comic22');
    this.comic23 = this.add.sprite(cam.centerX, cam.centerY, 'comic23');
    this.comic21.alpha = 0
    this.comic22.alpha = 0
    this.comic23.alpha = 0

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
    this.comic21.alpha += 0.005
    if (this.currentFrame > 200) {
      this.comic22.alpha += 0.005
    }

    if (this.currentFrame > 400) {
      this.comic23.alpha += 0.005
    }

    if (this.currentFrame > 800 || this.escKey.isDown) {
      this.scene.start("BossScene", {controls: this.controls, health: this.playerHealth, power: this.bulletPower, speed: this.bulletSpeed, cooldown: this.weaponCanFireFrameDelta});
    }
  }
}
