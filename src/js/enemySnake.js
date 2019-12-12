export default class Snake {
  constructor(scene, x, y) {

    // attributes
    this.discovered = false
    this.health = 1

    // location stuff
    this.scene = scene;
    this.tileX
    this.tileY
    this.room = null
    this.direc = Math.round(Math.random())
    this.prevPos = []

    // invincibility stuff
    this.iframe = false
    this.iframeNum = 0
    this.numIframesPerHit = 50


    const anims = scene.anims;

    // left/right walk anims
    anims.create({
      key: "snake-walk",
      frames: anims.generateFrameNumbers("characters", { start: 69, end: 72}),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "snake-walk-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 69, end: 72}),
      frameRate: 8,
      repeat: -1
    })

    // // up walk anim
    // anims.create({
    //   key: "snake-walk-back",
    //   frames: anims.generateFrameNumbers("characters", { start: 111, end: 114}),
    //   frameRate: 8,
    //   repeat: -1
    // });
    // anims.create({
    //   key: "snake-walk-back-damaged",
    //   frames: anims.generateFrameNumbers("damaged", { start: 111, end: 114 }),
    //   frameRate: 8,
    //   repeat: -1
    // });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    this.sprite.anims.play("snake-walk");

    this.updatePos()
    this.updateVisibility()

    //this.spoons = new Spoons(this.scene)
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update(move) {
    this.updateHasDied()

    if (this.health > 0) {
    const sprite = this.sprite;
    const speed = 100;

    sprite.body.setVelocity(0);
    if (this.prevPos == [this.sprite.x, this.sprite.y]) {
      console.log("stuck")
      this.direc = !(this.direc)
    }
    this.prevPos = [sprite.x, sprite.y]
    console.log(this.prevPos, [sprite.x, sprite.y])

    if (this.direc == 0) {
      sprite.setFlipX(true);
      if (move) {
        sprite.body.setVelocityY(-speed)
      } else {
        sprite.body.setVelocityY(speed)
      }
    } else {
      sprite.setFlipX(false);
      if (move) {
        sprite.body.setVelocityX(-speed)
      } else {
        sprite.body.setVelocityX(speed)
      }
    }
    // update the player tile position
    //this.updatePos()
    this.updateIframe(this.scene.currentFrame)
    this.updateVisibility()

      // const myX = this.tileX
      // const myY = this.tileY
      // const sprite = this.sprite;
      // const speed = 100;
      // const prevVelocity = sprite.body.velocity.clone();
      //
      // // Stop any previous movement from the last frame
      // sprite.body.setVelocity(0);
      //
      // if (path[0].y == myY && path[0].x == myX) {
      //   path.shift()
      // }
      //
      // if (this.room == this.scene.player.room) {
      //   var goRight = this.scene.player.sprite.x - this.sprite.x > 5
      //   var goLeft = this.sprite.x - this.scene.player.sprite.x > 5
      //   var goUp = this.sprite.y - this.scene.player.sprite.y > 5
      //   var goDown = this.scene.player.sprite.y - this.sprite.x > 5
      // }
      // else {
      // // determine which directon to move
      // var goRight = (myX < path[0].x) || (myX < path[1].x)
      // var goLeft = (myX > path[0].x) || (myX > path[1].x)
      // var goUp = (myY > path[0].y) || (myY > path[1].y)
      // var goDown = (myY < path[0].y) || (myY < path[1].y)
      // }
      //
      // // Horizontal movement
      // if (goLeft) {
      //
      //   sprite.body.setVelocityX(-speed);
      //   sprite.setFlipX(true);
      // }
      // if (goRight) {
      //   sprite.body.setVelocityX(speed);
      //   sprite.setFlipX(false);
      // }
      //
      // // Vertical movement
      // if (goUp) {
      //   sprite.body.setVelocityY(-speed);
      // }
      // if (goDown) {
      //   sprite.body.setVelocityY(speed);
      // }
      //
      // // Normalize and scale the velocity so that sprite can't move faster along a diagonal
      // sprite.body.velocity.normalize().scale(speed);

      // determine whether to play damaged or normal animation
      if (this.iframe) {
        sprite.anims.play("snake-walk-damaged", true);
      } else {
        sprite.anims.play("snake-walk", true);
      }

      // Update the animation last and give left/right animations precedence over up/down animations
      // if (goLeft || goRight || goDown) {
      //   sprite.anims.play(walkAnim, true);
      // } else if (goUp) {
      //   sprite.anims.play(walkBackAnim, true);
      // } else {
      //   sprite.anims.stop();

        // If we were moving, pick and idle frame to use
        //if (prevVelocity.y < 0) sprite.setTexture(idleFrame, 111);
        //else

    }
  }

  updatePos() {
    this.tileX = this.scene.groundLayer.worldToTileX(this.sprite.x);
    this.tileY = this.scene.groundLayer.worldToTileY(this.sprite.y);
    try {
      this.room = this.scene.dungeon.getRoomAt(this.tileX, this.tileY)
    } catch {}
  }

  updateVisibility() {
    if (this.room != null) {
      if (!(this.room == this.scene.player.room)) {
        this.sprite.visible = false
      } else {
        this.discovered = true
        this.sprite.visible = true
      }
    } else {
      this.sprite.visible = true
    }
  }

  updateIframe(currentFrame) {
    if ((currentFrame - this.iframeNum) > this.numIframesPerHit) {
      this.iframe = false
    }
  }

  updateHasDied() {
    if (this.health <= 0) {
      this.sprite.alpha = 0
      this.destroy()
      return;
    }
  }

  destroy() {
    this.sprite.destroy();
  }

  takeDamage(damage) {
    if (this.iframe == false) {
      this.health -= damage;
      this.iframe = true;
      this.iframeNum = this.scene.currentFrame
      console.log("snake has", this.health, "health")
      this.scene.enemyHit.play();
    }
  }

  flipDirec() {
    this.direc = !(this.direc)
  }
}
