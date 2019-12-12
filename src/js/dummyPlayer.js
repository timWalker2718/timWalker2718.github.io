export default class Dummy {
  constructor(scene, x, y) {
    this.scene = scene;
    this.iframe = false

    const anims = scene.anims;
    anims.create({
      key: "player-walk",
      frames: anims.generateFrameNumbers("characters", { start: 46, end: 49 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "player-walk-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 46, end: 49 }),
      frameRate: 8,
      repeat: -1
    })
    anims.create({
      key: "player-walk-back",
      frames: anims.generateFrameNumbers("characters", { start: 65, end: 68 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "player-walk-back-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 65, end: 68 }),
      frameRate: 8,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    this.sprite.anims.play("player-walk-back");
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    })
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update(moveHorizontal, moveVertical) {
    // -1 -> move left/up
    //  1 -> move right/down
    const keys = this.keys
    const sprite = this.sprite;
    const speed = 300;
    const prevVelocity = sprite.body.velocity.clone();

    sprite.body.setVelocity(0)

    // Horizontal movement
    if (keys.a.isDown) {
      sprite.body.setVelocityX(-speed);
      sprite.setFlipX(true);
    } else if (keys.d.isDown) {
      sprite.body.setVelocityX(speed);
      sprite.setFlipX(false);
    }

    // Vertical movement
    if (keys.w.isDown) {
      sprite.body.setVelocityY(-speed);
    } else if (keys.s.isDown) {
      sprite.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that sprite can't move faster along a diagonal
    sprite.body.velocity.normalize().scale(speed);

    // if player invincible, play damaged animation
    if (this.iframe) {
      var walkAnim = "player-walk-damaged"
      var walkBackAnim = "player-walk-back-damaged"
      var idleFrame = "damaged"
    } else {
      var walkAnim = "player-walk"
      var walkBackAnim = "player-walk-back"
      var idleFrame = "characters"
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (keys.a.isDown || keys.s.isDown || keys.d.isDown) {
      sprite.anims.play(walkAnim, true);
    } else if (keys.w.isDown == -1) {
      sprite.anims.play(walkBackAnim, true);
    } else {
      sprite.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.y < 0) sprite.setTexture(idleFrame, 65);
      else sprite.setTexture(idleFrame, 46);
    }
  }


  destroy() {
    this.sprite.destroy();
  }
}
