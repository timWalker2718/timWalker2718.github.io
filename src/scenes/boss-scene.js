import Player from "../js/player.js";
import Boss from "../js/enemyBoss.js";

/**
 * Scene that generates a new dungeon
 */

export default class BossScene extends Phaser.Scene {
  constructor() {
    super("BossScene");

   this.healthDisplay;
   this.arrows;
   this.listOfArrows = [];

   this.map;

   this.currentFrame = 1;
   this.enemies = []
  }

  init (data) {
    this.playerHealth = data.health;
    this.bulletPower = data.power;
    this.bulletSpeed = data.speed;
    this.bulletCooldown = data.cooldown;
    this.controls = data.controls
  }

  preload() {

    this.load.audio("pop", "../assets/audio/pop.ogg");
    this.load.audio("enemyHit", "../assets/audio/enemyHit.ogg");

    this.load.image("boss-tiles", "../assets/tilesets/interior.png"); // 32 pixels each
    this.load.image("warmup", "../assets/orange.png");
    this.load.image("attack", "../assets/red.png");
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/boss-room.json");
    this.load.spritesheet(
      "hearts",
      "../assets/spritesheets/hearts.png",
      {
        frameWidth: 128,
        frameHeight: 32
      }
    );
    this.load.spritesheet(
      'arrow',
      '../assets/spritesheets/arrow.png',
      {
        frameWidth: 70,
        frameHeight: 30
      }
    );
    this.load.spritesheet(
      "boss",
      "../assets/spritesheets/priest.png",
      {
        frameWidth: 80,
        frameHeight: 80
      }
    );
  }

  create() {
    this.map = this.make.tilemap({ key: "map" });
    const bossTileset = this.map.addTilesetImage("interior", "boss-tiles");

    this.groundLayer = this.map.createDynamicLayer("Ground", bossTileset, 0, 0);
    const decoLayer = this.map.createStaticLayer("Decoration", bossTileset, 0, 0);
    decoLayer.depth = 5;

    this.player = new Player(this, 1350, 140);
    this.player.health = this.playerHealth;
    this.player.bulletPower = this.bulletPower;
    this.player.bulletSpeed = this.bulletSpeed;
    this.player.bulletCooldown = this.bulletCooldown;
    this.player.depth = 8;

    this.boss = new Boss(this, 1077, 135);
    this.boss.sprite.setScale(1.4);
    this.boss.depth = 12;
    this.boss.attackTile.depth = 11;
    this.boss.warmupTile.depth = 11;

    this.enemies.push(this.boss);
    this.player.resetBullets();

    this.arrows = this.add.group();
    this.anims.create({
              key: "arrowAnim",
              frames: this.anims.generateFrameNumbers("arrow"),
              frameRate: 10,
              repeat: -1
            })

    for (var i = 0; i < 4; i++) {
      this.listOfArrows.push(this.arrows.create(0, 0, 'sprites'));
      this.listOfArrows[i].angle = i * 90;
      this.listOfArrows[i].depth = 12;
      this.listOfArrows[i].play("arrowAnim").setActive(false);
    }

    const aboveLayer = this.map.createStaticLayer("Above", bossTileset, 0, 0);
    aboveLayer.depth = 10;

    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    camera.startFollow(this.player.sprite);

    this.groundLayer.setCollisionByProperty({ collides: true });
    decoLayer.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, decoLayer);
    this.physics.add.collider(this.player.sprite, this.boss); // can't let boss do contact damage, there's a chance of him teleporting directly onto the player with no warning

    this.physics.add.overlap(this.player.sprite, this.boss.attackTile, this.takeDamage, null, this);

  this.healthDisplay = this.add.sprite(70, 20, "hearts");
  this.healthDisplay.setTexture("hearts", 0);
  this.healthDisplay.fixedToCamera = true;
  this.healthDisplay.setScrollFactor(0);
  this.healthDisplay.depth = 13;

  this.pop = this.sound.add("pop");
    this.enemyHit = this.sound.add("enemyHit");
}

  update(time, delta) {
    this.currentFrame++;

    this.player.update(this, this.currentFrame);
    this.healthDisplay.setTexture("hearts", 4 - this.player.health);

    this.boss.update(this, this.currentFrame);

    if (this.player.health <= 0) {
      this.scene.start("DeathScene");
      return;
    }

    if (this.boss.sprite.x <= -350) {
      this.scene.start("WinScene");
      return;
    }

    //if (this.boss.inCamera == false) {
      this.locationIndicator();
    //}  shows where boss is relative to player
  }

  takeDamage() {
    this.player.takeDamage(this.currentFrame);
    this.healthDisplay.setTexture("hearts", 4 - this.player.health);
  }

  locationIndicator() {
    if (this.boss.sprite.x < this.player.sprite.x - 400) {
      this.locationIndicator_helper(1, -380, 0);
    } else {
      this.listOfArrows[1].setAlpha(0).setActive(false);
    }

    if (this.boss.sprite.x > this.player.sprite.x + 400) {
      this.locationIndicator_helper(3, 380, 0);
    } else {
      this.listOfArrows[3].setAlpha(0).setActive(false);
    }

    if (this.boss.sprite.y < this.player.sprite.y - 300) {
      this.locationIndicator_helper(2, 0, -270);
    } else {
      this.listOfArrows[2].setAlpha(0).setActive(false);
    }

    if (this.boss.sprite.y > this.player.sprite.y + 300) {
      this.locationIndicator_helper(0, 0, 270);
    } else {
      this.listOfArrows[0].setAlpha(0).setActive(false);
    }
  }

  locationIndicator_helper(number, x_, y_) {
      this.listOfArrows[number].setActive(true).setAlpha(1);
      this.listOfArrows[number].x = this.player.sprite.x + x_;
      this.listOfArrows[number].y = this.player.sprite.y + y_;
  }
}
