export default class Butler {
  constructor(scene, x, y) {

    // attributes
    this.discovered = true
    this.health = 3
    this.test = "butler"

    // location stuff
    this.scene = scene;
    this.tileX
    this.tileY
    this.room = null

    // invincibility stuff
    this.iframe = false
    this.iframeNum = 0
    this.numIframesPerHit = 1000
    this.speed = 100



    const anims = scene.anims;

    // left/right walk anims
    anims.create({
      key: "butler-walk",
      frames: anims.generateFrameNumbers("characters", { start: 92+23, end: 95+23 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "butler-walk-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 92+23, end: 95+23}),
      frameRate: 8,
      repeat: -1
    })

    // up walk anim
    anims.create({
      key: "butler-walk-back",
      frames: anims.generateFrameNumbers("characters", { start: 111+23, end: 114+23}),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "butler-walk-back-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 111+23, end: 114+23}),
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: "butler-sleeping",
      frames: anims.generateFrameNumbers("characters", {start: 96+23, end: 97+23}),
      frameRate: 1,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    this.sprite.anims.play("butler-sleeping");

    this.updatePos()
    this.updateVisibility()
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update(path) {

    // update the player tile position


    try {

      const currentFrame = this.scene.currentFrame
      const myX = this.tileX
      const myY = this.tileY
      const sprite = this.sprite;
      const speed = this.speed;
      const prevVelocity = sprite.body.velocity.clone();

      this.updatePos()
      this.updateIframe(currentFrame)
      this.updateVisibility()

      // Stop any previous movement from the last frame
      sprite.body.setVelocity(0);

      if (this.iframe) {
        sprite.anims.play("butler-sleeping", true)
      }

      else {
        if (path[0].y == myY && path[0].x == myX) {
          path.shift()
        }

        // determine which directon to move
        if (this.room == this.scene.player.room) {
          var goRight = this.scene.player.sprite.x - this.sprite.x > 5
          var goLeft = this.sprite.x - this.scene.player.sprite.x > 5
          var goUp = this.sprite.y - this.scene.player.sprite.y > 5
          var goDown = this.scene.player.sprite.y - this.sprite.y > 5
        }
        else {
          var goRight = (myX < path[0].x) || (myX < path[1].x)
          var goLeft = (myX > path[0].x) || (myX > path[1].x)
          var goUp = (myY > path[0].y) || (myY > path[1].y)
          var goDown = (myY < path[0].y) || (myY < path[1].y)
        }

        // Horizontal movement
        if (goLeft) {
          sprite.body.setVelocityX(-speed);
          sprite.setFlipX(true);
        }
        if (goRight) {
          sprite.body.setVelocityX(speed);
          sprite.setFlipX(false);
        }

        // Vertical movement
        if (goUp) {
          sprite.body.setVelocityY(-speed);
        }
        if (goDown) {
          sprite.body.setVelocityY(speed);
        }

        // Normalize and scale the velocity so that sprite can't move faster along a diagonal
        sprite.body.velocity.normalize().scale(speed);


        var walkAnim = "butler-walk"
        var walkBackAnim = "butler-walk-back"
        var idleFrame = "characters"

        // Update the animation last and give left/right animations precedence over up/down animations
        if (goLeft || goRight || goDown) {
          sprite.anims.play(walkAnim, true);
        } else if (goUp) {
          sprite.anims.play(walkBackAnim, true);
        } else {
          sprite.anims.stop();

          // If we were moving, pick and idle frame to use
          if (prevVelocity.y < 0) sprite.setTexture(idleFrame, 111 + 23);
          else sprite.setTexture(idleFrame, 92 + 23);
        }


        if ((currentFrame % 10 == 0) && (this.speed < 350)) {

          this.speed += 5
          //console.log(this.speed)
        }
      }

    } catch {}
    this.updateIframe()
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

  updateIframe() {
    if (this.iframe && ((this.scene.currentFrame - this.iframeNum) > this.numIframesPerHit)) {
      this.iframe = false
      this.scene.yawn.play()
    }
  }

  destroy() {
    this.sprite.destroy();
  }

  takeDamage(damage) {
    if (this.iframe == false && this.numIframesPerHit > 0) {
      console.log("slept butler")
      this.iframe = true;
      this.iframeNum = this.scene.currentFrame
      this.numIframesPerHit -= (400 - ((damage - 1) * 50))
      this.scene.enemyHit.play();

    }
  }
}
