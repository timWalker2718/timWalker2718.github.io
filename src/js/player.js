export default class Player {
  constructor(scene, x, y) {

    // attributes
    this.maxHealth = 4;
    this.health = this.maxHealth;
    this.controls = scene.controls

    // location stuff
    this.scene = scene;
    this.tileX;
    this.tileY;
    this.room = null

    // invincibility stuff
    this.iframe = false;
    this.iframeNum = 0;
    this.numIframesPerHit = 50;

    // pew pew stuff
    this.bullets;
    this.bulletSpeed = 400;
    this.bulletPower = 1;
    this.weapon = null; // will use this later to set whether player has weapon, which weapon, etc.
    this.weaponLastUsedOnFrame = 0;
    this.weaponCanFireFrameDelta = 25;

    const anims = this.scene.anims;
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


    this.sprite = this.scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(18, 28)
      .setOffset(23, 27);

    //this.attackRing = scene.add.sprite(x, y + 12, "semicircle", 0)
    this.resetBullets()

    this.sprite.anims.play("player-walk-back");

    //this.otherKeys = scene.input.keyboard.addKeys({keyA: Phaser.Input.Keyboard.KeyCodes.A, keyD: Phaser.Input.Keyboard.KeyCodes.D})
    this.keys = this.scene.input.keyboard.addKeys({
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

    this.updatePos()
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update() {
    //console.log(this.controls)
    var currentFrame = this.scene.currentFrame
    var scene = this.scene

    // update the player tile position
    this.updatePos()
    this.updateIframe()
    this.updateHasDied()

    // wrap input and configure player speed
    const keys = this.keys;
    const sprite = this.sprite;
    const speed = 300;
    const bullets = this.bullets
    const bulletSpeed = this.bulletSpeed

    // record previous velocity foor idle frame purposes
    const prevVelocity = sprite.body.velocity.clone();

    // halt any movement from previous frame
    sprite.body.setVelocity(0)


    // Horizontal movement
    if (keys.a.isDown) {
      sprite.body.setVelocityX(-speed);
    } else if (keys.d.isDown) {
      sprite.body.setVelocityX(speed);
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

    // update direction player is facing
    // give shoot animations precedence over move animations
    const controlsAreArrowKeys = (this.controls == "arrow keys")
    if (keys.left.isDown && controlsAreArrowKeys){
    //if (this.scene.input.x + this.scene.cameras.main.scrollX < this.sprite.x)
      sprite.setFlipX(true)
    } else if (keys.right.isDown && controlsAreArrowKeys) {
      sprite.setFlipX(false)
    } else if (keys.a.isDown) {
      sprite.setFlipX(true)
    } else if (keys.d.isDown) {
      sprite.setFlipX(false)
    }

    // play movement animation, giving left/right/down movement precedence over up
    if ((keys.left.isDown || keys.right.isDown || keys.down.isDown) && controlsAreArrowKeys) {
      sprite.anims.play(walkAnim, true);
    } else if (keys.up.isDown && controlsAreArrowKeys) {
      sprite.anims.play(walkBackAnim, true);
    } else if (keys.a.isDown || keys.d.isDown || keys.s.isDown){
      sprite.anims.play(walkAnim, true);
    } else if (keys.w.isDown) {
      sprite.anims.play(walkBackAnim, true);
    }

    // if player is not moving (but is perhaps shooting), stop the animation
    if (!(keys.a.isDown || keys.d.isDown || keys.s.isDown || keys.w.isDown)) {
      sprite.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.y < 0) sprite.setTexture(idleFrame, 65);
      else sprite.setTexture(idleFrame, 46);
    }

    if (this.controls == "arrow keys") {
      //fire bullets
      if (currentFrame - this.weaponLastUsedOnFrame > this.weaponCanFireFrameDelta) {
        if (keys.right.isDown) {
          bullets.fireBullet(sprite.x, sprite.y, 0, bulletSpeed)
          this.weaponLastUsedOnFrame = currentFrame
        }
        else if (keys.left.isDown) {
          bullets.fireBullet(sprite.x, sprite.y, 180, bulletSpeed)
          this.weaponLastUsedOnFrame = currentFrame
        }
        else if (keys.up.isDown) {
          bullets.fireBullet(sprite.x, sprite.y, -90, bulletSpeed)
          this.weaponLastUsedOnFrame = currentFrame
        }
        else if (keys.down.isDown) {
          bullets.fireBullet(sprite.x, sprite.y, 90, bulletSpeed)
          this.weaponLastUsedOnFrame = currentFrame
        }
      }
    }

    else if (this.controls == "mouse") {

      if (this.scene.input.activePointer.isDown && currentFrame - this.weaponLastUsedOnFrame > this.weaponCanFireFrameDelta)
      {
          this.shoot();
      }
    }

  }

  shoot() {
  // configure weapon
      this.bullets.fireBullet(this.sprite.x, this.sprite.y, 0, this.bulletSpeed);
      this.weaponLastUsedOnFrame = this.scene.currentFrame;
  }

  destroy() {
    this.sprite.destroy();
  }

  // CALL WHENEVER ENEMY ADDED TO UPDATE BULLET COLLISIONS
  // ENEMY SHOULD HAVE A takeDamage() FUNCTION
  resetBullets() {
    this.bullets = new Bullets(this.scene)
  }

  // update position attributes
  updatePos() {
    this.tileX = this.scene.groundLayer.worldToTileX(this.sprite.x);
    this.tileY = this.scene.groundLayer.worldToTileY(this.sprite.y);
    try {
      this.room = this.scene.dungeon.getRoomAt(this.tileX, this.tileY)
    } catch{}
  }

  updateIframe() {
    if ((this.scene.currentFrame - this.iframeNum) > this.numIframesPerHit) {
      this.iframe = false
    }
  }

  updateHasDied() {
    if (this.health <= 0) {
      this.scene.scene.start("DeathScene");
      return;
    }
  }

  takeDamage() {

    if (this.iframe == false) {
      this.health--
      this.iframe = true;
      this.iframeNum = this.scene.currentFrame
    }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
        this.scene = scene
        scene.physics.add.collider(this, this.scene.groundLayer, this.hitWall, null, this)
        // for (var i = 0; i < scene.enemies.length; i++) {
        //
        //   scene.physics.add.overlap(this, this.scene.enemies[i].sprite, function(){this.hitEnemy(i-1)}, null, this)
        //   console.log("collision added to enemy", i)
        //
        // }
        if (scene.butler) {
        scene.physics.add.overlap(this, scene.butler.sprite,
          function(){
            scene.butler.takeDamage(scene.player.bulletPower);
            this.setActive(false);
            this.setVisible(false)},
          null, this)
        //scene.physics.add.overlap(this, scene.snake.sprite, scene.snake.takeDamage, null, this)
        }

        if (scene.snake) {
          scene.physics.add.overlap(this, scene.snake.sprite,
            function(){
              scene.snake.takeDamage(scene.player.bulletPower);
              this.setActive(false);
              this.setVisible(false)},
            null, this)
          //scene.physics.add.overlap(this, scene.snake.sprite, scene.snake.takeDamage, null, this)
          }

          if (scene.cook) {
            scene.physics.add.overlap(this, scene.cook.sprite,
              function(){
                scene.cook.takeDamage(scene.player.bulletPower);
                this.setActive(false);
                this.setVisible(false)},
              null, this)
            //scene.physics.add.overlap(this, scene.snake.sprite, scene.snake.takeDamage, null, this)
            }
            if (scene.boss) {
              scene.physics.add.overlap(this, scene.boss.sprite,
                function(){
                  scene.boss.takeDamage(scene.player.bulletPower);
                  this.setActive(false);
                  this.setVisible(false)},
                null, this)
              //scene.physics.add.overlap(this, scene.snake.sprite, scene.snake.takeDamage, null, this)
              }

    }

    // fire bullet at a given angle
    fire (x, y, angle, speed)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        // kinda unnecessary now that we're shooting in cardinal directions but it still works
        if (this.scene.controls == "arrow keys") {
          this.setVelocityY(speed * Math.sin(angle * Math.PI/180));
          this.setVelocityX(speed * Math.cos(angle * Math.PI/180));
        } else {
          this.scene.physics.moveTo(this, this.scene.input.x + this.scene.cameras.main.scrollX, this.scene.input.y + this.scene.cameras.main.scrollY, speed);
        }
    }

    // callback for when bullet hits wall
    hitWall() {
      this.setActive(false);
      this.setVisible(false);
    }

    // callback for when bullet hits enemy
    hitEnemy(i) {
      //try {
      // console.log(i)
      // console.log(this.scene.enemies[i-1])
        //this.scene.enemies[i].takeDamage(this.scene.player.bulletPower)
      // } catch {
      //  console.log("enemy bullet collision error")
      // }
      this.setActive(false);
      this.setVisible(false);
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
class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);
        this.scene = scene

        this.createMultiple({
            frameQuantity: 10,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });

    }

    fireBullet (x, y, angle, speed)
    {
        let bullet = this.getFirstDead(false);
        this.scene.pop.play()
        if (bullet)
        {
            bullet.fire(x, y, angle, speed);
        }
    }
}
