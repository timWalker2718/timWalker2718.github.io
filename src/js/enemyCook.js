export default class Cook {
  constructor(scene, x, y) {

    // attributes
    this.discovered = false
    this.health = 3

    // location stuff
    this.scene = scene;
    this.tileX
    this.tileY
    this.room = null

    // invincibility stuff
    this.iframe = false
    this.iframeNum = 0
    this.numIframesPerHit = 50

    this.numFramesPerShot = 75

    const anims = scene.anims;

    // left/right walk anims
    anims.create({
      key: "enemy1-walk",
      frames: anims.generateFrameNumbers("characters", { start: 92, end: 95}),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "enemy1-walk-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 92, end: 95}),
      frameRate: 8,
      repeat: -1
    })

    // up walk anim
    anims.create({
      key: "enemy1-walk-back",
      frames: anims.generateFrameNumbers("characters", { start: 111, end: 114}),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "enemy1-walk-back-damaged",
      frames: anims.generateFrameNumbers("damaged", { start: 111, end: 114 }),
      frameRate: 8,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    this.sprite.anims.play("enemy1-walk-back");

    this.updatePos()
    this.updateVisibility()

    this.spoons = new Spoons(this.scene)
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update() {
    this.updateHasDied()
    // update the player tile position
    //this.updatePos()
    if (this.health > 0) {
    this.updateIframe(this.scene.currentFrame)
    this.updateVisibility()
    if ((this.room == null || this.room == this.scene.player.room) &&
        (this.scene.currentFrame %  this.numFramesPerShot == 0))
    {
      this.spoons.fireSpoon(this.sprite.x, this.sprite.y, 90, 200)
    }
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
        // var walkAnim = "enemy1-walk-damaged"
        // var walkBackAnim = "enemy1-walk-back-damaged"
        var idleFrame = "damaged"
      } else {
        // var walkAnim = "enemy1-walk"
        // var walkBackAnim = "enemy1-walk-back"
        var idleFrame = "characters"
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
        this.sprite.setTexture(idleFrame, 92);
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
      console.log("cook has", this.health, "health")
      //this.scene.enemyHit.play();
    }
  }
}

class Spoon extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'spoon', );
        this.scene = scene
        scene.physics.add.collider(this, this.scene.groundLayer, this.hitWall, null, this)
        scene.physics.add.overlap(this, scene.player.sprite, this.hitPlayer, null, this)
    }

    // fire bullet at a given angle
    fire (x, y, angle, speed)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        // kinda unnecessary now that we're shooting in cardinal directions but it still works
        this.setVelocityY(speed * Math.sin(angle * Math.PI/180));
        this.setVelocityX(speed * Math.cos(angle * Math.PI/180));
    }

    // callback for when bullet hits wall
    hitWall() {
      this.setActive(false);
      this.setVisible(false);
    }

    // callback for when bullet hits player
    hitPlayer() {
      this.scene.player.takeDamage()
      this.setActive(false);
      this.setVisible(false);
      return
    }
    preUpdate() {
        this.angle += 10
    }

  // not sure what this is for or if we still need it
    // preUpdate (time, delta)
    // {
    //     super.preUpdate(time, delta);
    //     if (this.dest) {
    //       this.setActive(false);
    //       this.setVisible(false);
    //     }
    //     this.dest = false
    // }
}

// create a group of bullets
class Spoons extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);
        this.scene = scene

        this.createMultiple({
            frameQuantity: 10,
            key: 'spoon',
            active: false,
            visible: false,
            classType: Spoon
        });

    }

    fireSpoon (x, y, angle, speed)
    {
        let spoon = this.getFirstDead(false);
        this.scene.pop.play()
        if (spoon)
        {
            spoon.fire(x, y, angle, speed);
        }
    }
}
