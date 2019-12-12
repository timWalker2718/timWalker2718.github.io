/*global Phaser*/


export default class Start extends Phaser.Scene {
  constructor () {
    super('Start');
    this.currentFrame = 0
    this.selection = "start"
    this.controls = "arrow keys"
  }

  preload () {
    // Preload assets
    this.load.spritesheet(
      "charactersBIG",
      "../assets/spritesheets/buch-characters-64px-extruded3BIG.png",
      {
        frameWidth: 64*4,
        frameHeight: 64*4
      }
    );

    this.load.image("title", "../assets/title.png")
  }

  create (data) {
    var cam = this.cameras.main
    const anims = this.anims;
    anims.create({
      key: "start-walk",
      frames: anims.generateFrameNumbers("charactersBIG", { start: 46, end: 49 }),
      frameRate: 3,
      repeat: -1
    });

    this.sprite = this.physics.add
      .sprite(cam.centerX, cam.centerY - 60, "charactersBIG", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    this.title = this.add.sprite(cam.centerX, cam.centerY - 200, "title", 0)
    this.sprite.anims.play("start-walk");

    this.startOption = this.add.text(cam.centerX - 60 , cam.centerY + 100, ">start", {
      font: "20px monospace",
      fill: "#ffffff",
      align: "center"
      // boundsAlignH: "center",
      // boundsAlignV: "middle",
      // padding: { x: 20, y: 10 },
      // backgroundColor: "#ffffff"
    })
    .setScrollFactor(0);

    this.controlOption = this.add.text(cam.centerX - 60 , cam.centerY + 120, " controls: " + this.controls, {
      font: "20px monospace",
      fill: "#ffffff",
      align: "center"
      // boundsAlignH: "center",
      // boundsAlignV: "middle",
      // padding: { x: 20, y: 10 },
      // backgroundColor: "#ffffff"
    })
    .setScrollFactor(0);

    this.arrowKeyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    this.arrowKeyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // let start_over = [this.scene.get("WinScene"), this.scene.get("DeathScene")];
    // for (let i = 0; i < start_over.length; i++) {
    //   start_over[i].scene.restart();
    //   start_over[i].scene.stop();
    // }
  }

  update (time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.selection == "start") {
        this.scene.start("Intro", {controls: this.controls});
        this.sprite.destroy()
      }
      else if (this.selection == "controls") {
        if (this.controls == "mouse") {
          this.controls = "arrow keys"
          console.log(this.controls)
        }
        else if (this.controls == "arrow keys") {
          this.controls = "mouse"
          console.log(this.controls)
        }
        this.controlOption.setText(">controls: " + this.controls)
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.arrowKeyDown)) {
      this.selection = "controls"
      this.startOption.setText(" start")
      this.controlOption.setText(">controls: " + this.controls)
    }

    if (Phaser.Input.Keyboard.JustDown(this.arrowKeyUp)) {
      this.selection = "start"
      this.controlOption.setText(" controls: " + this.controls)
      this.startOption.setText(">start")
    }





  }
}
