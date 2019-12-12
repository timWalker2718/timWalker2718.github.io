/*global Phaser*/
import Player from "../js/player.js";
import Cook from "../js/enemyCook.js";
var currentPath = null
export default class TutorialScene extends Phaser.Scene {
  constructor () {
    super('TutorialScene');
    this.currentFrame = 1
    this.iframeNum = 0
    this.enemies = []
  }

  init(data) {
    this.controls = data.controls
    console.log(this.controls)
  }

  preload () {
    this.load.audio("pop", "../assets/audio/pop.ogg")
    this.load.image("tiles", "../assets/tilesets/interior.png");
    this.load.tilemapTiledJSON("tutMap", "../assets/tilemaps/tutorial-room.json");
    this.load.spritesheet(
      "characters",
      "../assets/spritesheets/buch-characters-64px-extruded3.png",
      {
        frameWidth: 64,
        frameHeight: 64
      })
    this.load.spritesheet(
      "damaged",
      "../assets/spritesheets/buch-characters-64px-extruded3 - damaged.png",
      {
        frameWidth: 64,
        frameHeight: 64
      }
    )
    this.load.image("bullet", "../assets/bullet.png")
    this.load.image("spoon", "../assets/spoon.png")
  }

  create (data) {

    var cam = this.cameras.main

    let mapX = 90
    let mapY = 100
    const tutMap = this.make.tilemap({ key: "tutMap" });
    const tileset = tutMap.addTilesetImage("interior-tiles", "tiles");
    this.groundLayer = tutMap.createStaticLayer("Ground", tileset, mapX, mapY);
    const deco1Layer = tutMap.createStaticLayer("Decoration1", tileset, mapX, mapY);
    const deco2Layer = tutMap.createStaticLayer("Decoration2", tileset, mapX, mapY);

    this.groundLayer.setCollisionByProperty({ collides: true });
    deco1Layer.setCollisionByProperty({ collides: true });
    deco2Layer.setCollisionByProperty({ collides: true });

    this.tutMessage = this.add.text(340, 500, "Move with WASD.", {
        font: "18px monospace",
        fill: "#ffffff",
        align: "center"
        // boundsAlignH: "center",
        // boundsAlignV: "middle",
        // padding: { x: 20, y: 10 },
        // backgroundColor: "#ffffff"
      })
      .setScrollFactor(0);

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

    this.player = new Player(this, 410, 300)

    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, deco1Layer);

    //pathfinding stuff
    this.finder = new EasyStar.js()
    var grid = [];
    for(var i = 0; i < tutMap.height; i++){
    var col = [];
    for(var j = 0; j < tutMap.width; j++){
        // In each cell we store the ID of the tile, which corresponds
        // to its index in the tileset of the map ("ID" field in Tiled)
        col.push(this.getTileID(j,i));
    }
    grid.push(col);
    }

    this.finder.setGrid(grid);

    // set tiles considered "walkable"
    var acceptableTiles = []

    for (var i = tileset.firstgid; i < tileset.total; i++) {
    //for (var n = 0; i < map.getLayer(0).collideIndexes.length)
      if (!(tutMap.getLayer(0).collideIndexes.includes(i))) {
          acceptableTiles.push(i)
      }
    }
    this.finder.setAcceptableTiles(acceptableTiles);

    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    //sounds
    this.pop = this.sound.add("pop");

  }

  update (time, delta) {

    if (this.escKey.isDown) {
      this.scene.start("Dungeon", {controls: this.controls});
    }

    this.currentFrame++

    // make sure the player can't die during the tutorial
    this.player.health = 3
    this.player.update()

    if (this.currentFrame == 300) {
      this.tutMessage.setText("Shoot with the " + this.controls + ".")
      this.tutMessage.x = 300
    }

    let spawnEnemyFrame = 600
    if (this.currentFrame == spawnEnemyFrame) {
      this.cook = new Cook(this, 300, 300)
      this.enemies.push(this.cook)
      this.player.resetBullets()

      this.physics.add.overlap(this.cook.sprite, this.player.sprite, function() {this.player.takeDamage(this.currentFrame)}, null, this)
      this.tutMessage.setText("Watch out for enemies!")
      this.tutMessage.x = 305
    }

    // reset player vulnerability
    if ((this.currentFrame - this.iframeNum) == 50) {
      this.player.iframe = false
    }



    if (this.currentFrame > spawnEnemyFrame) {
      var playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
      var playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
      var cookTileX = this.groundLayer.worldToTileX(this.cook.sprite.x);
      var cookTileY = this.groundLayer.worldToTileY(this.cook.sprite.y);

      // move enemy
      if (this.currentFrame % 30 == 0) {
        this.pathFind(cookTileX, cookTileY, playerTileX, playerTileY)
      }

      this.cook.update();

    }
    if (this.currentFrame > 1000) {
      this.scene.start("Dungeon", {controls: this.controls});
    }
  }

  pathFind(fromX, fromY, toX, toY) {
    this.finder.findPath(fromX, fromY, toX, toY, function( path ) {
        if (path === null) {
            console.warn("Path was not found.");
        } else {

            currentPath = path
        }
    });
    this.finder.calculate();
  }

  getTileID(x,y) {
    var tile = this.groundLayer.getTileAt(x, y)
    return tile.index
  }

  takeDamage() {
    if (!this.player.iframe) {
      this.player.iframe = true;
      this.iframeNum = this.currentFrame
    }
  }

}
