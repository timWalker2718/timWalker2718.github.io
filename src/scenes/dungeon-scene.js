import Player from "../js/player.js";
import Cook from "../js/enemyCook.js";
import Snake from "../js/enemySnake.js";
import Butler from "../js/enemyButler.js";
import powerUp from "../js/powerUp.js";
import TILES from "../js/tile-mapping.js";
import TilemapVisibility from "../js/tilemap-visibility.js";

/**
 * Scene that generates a new dungeon
 */
var currentPath = null
export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super();
    this.level = 0;
    this.totalLevels = 2;
    this.iframeNum = 0
    this.enemies = []
    this.currentFrame = 1
    this.healthDisplay;
    this.butlerMessage
    this.yawn
    this.tutorial_end = 400;

    this.notifs;
    this.upgradeFrame;

    // carry over between scenes
    this.health = 4;
    this.bulletCooldown;
    this.bulletSpeed;
    this.bulletPower;
  }

  init(data) {
    this.controls = data.controls
  }

  preload() {

    this.load.audio("pop", "../assets/audio/pop.ogg")
    this.load.audio("enemyHit", "../assets/audio/enemyHit.ogg")
    this.load.audio("music", "../assets/audio/Memoraphile - Spooky Dungeon.mp3")
    this.load.audio("yawn", "../assets/audio/Yawn.wav")
    this.load.image("tiles", "../assets/tilesets/interior.png");
    this.load.spritesheet(
      "characters",
      "../assets/spritesheets/buch-characters-64px-extruded3.png",
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );
    this.load.spritesheet(
      "damaged",
      "../assets/spritesheets/buch-characters-64px-extruded3 - damaged.png",
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );
    this.load.spritesheet(
      "hearts",
      "../assets/spritesheets/hearts.png",
      {
        frameWidth: 128,
        frameHeight: 32
      }
    );
    this.load.image("semicircle", "../assets/semicircle.png")
    this.load.image("bullet", "../assets/bullet.png")
    this.load.image("spoon", "../assets/spoon.png")
    this.load.image("heartPower", "../assets/heart.png")
  }

  create() {
    this.level++;
    if (this.level > 1) {
      this.tutorial_end = 0;
    }
    this.hasPlayerReachedStairs = false;

    // Generate a random world with a few extra options:
    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    this.dungeon = new Dungeon({
      width: 40,
      height: 40,
      doorPadding: 3,
      rooms: {
        width: { min: 9, max: 15, onlyOdd: true },
        height: { min: 9, max: 15, onlyOdd: true }
      }
    });

    this.dungeon.drawToConsole();

    // Creating a blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 32, 32, 0, 0);
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    this.topLayer = map.createBlankDynamicLayer("TableTop", tileset);
    const shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(TILES.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
      // See "Weighted Randomize" example for more information on how to use weightedRandomize.
      this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

      // Place the room corners tiles
      this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
      this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

      // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
      this.groundLayer.fill(TILES.WALL.TOP, left + 1, top, width - 2, 1); // Top
      this.groundLayer.fill(TILES.WALL.BOTTOM, left + 1, bottom, width - 2, 1); // Bottom
      this.groundLayer.fill(TILES.WALL.LEFT, left, top + 1, 1, height - 2); // Left
      this.groundLayer.fill(TILES.WALL.RIGHT, right, top + 1, 1, height - 2); // Right

      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location. Each direction has a different door to tile mapping.
      var doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
      for (var i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].y === room.height - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].x === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
        } else if (doors[i].x === room.width - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
        }
      }
    });

    // Separate out the rooms into:
    //  - The starting room (index = 0)
    //  - A random room to be designated as the end room (with stairs and nothing else)
    //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const enemyRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const butlerRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);

    //random chance for powerUp
    const rand = Math.random();
    if (rand <= 0.5) {
      const heartRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
      this.heartPowerUp = new powerUp(this, this.groundLayer.tileToWorldX(heartRoom.centerX), this.groundLayer.tileToWorldY(heartRoom.centerY), "heartPower");
    } if (rand <= 0.5) {
      const spoonRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
      this.spoonPowerUp = new powerUp(this, this.groundLayer.tileToWorldX(spoonRoom.centerX), this.groundLayer.tileToWorldY(spoonRoom.centerY), "spoon");
    }

    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

    // Place the stairs
    this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

    this.createEnemyRoom(rooms, enemyRoom, TILES.KITCHEN.ENEMYFLOOR, TILES.KITCHEN.MIDDLE, TILES.KITCHEN.TOP_FIRST, TILES.KITCHEN.TOP_SECOND, TILES.KITCHEN.LEFT, TILES.KITCHEN.ITEM, TILES.KITCHEN.RIGHT);
    this.createEnemyRoom(rooms, butlerRoom, TILES.BUTLER_ROOM.ENEMYFLOOR, TILES.BUTLER_ROOM.MIDDLE, TILES.BUTLER_ROOM.TOP_FIRST, TILES.BUTLER_ROOM.TOP_SECOND, TILES.BUTLER_ROOM.LEFT, TILES.BUTLER_ROOM.ITEM, TILES.BUTLER_ROOM.RIGHT);

    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach(room => {
      var rand = Math.random();
      if (rand <= 0.25) {
        // 25% chance of skull
        this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
      } else if (rand <= 0.5) {
        // 50% chance of a pot anywhere in the room... except don't block a door!
        const x = Phaser.Math.Between(room.left + 2, room.right - 2);
        const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
      } else {
        // 25% of either 2 or 4 towers, depending on the room size
        if (room.height >= 9) {
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        }
      }
    });

    // Not exactly correct for the tileset since there are more possible floor tiles, but this will
    // do for the example.
    this.groundLayer.setCollisionByExclusion([-1, 64, 65, 80, 81, 48, 49]);
    this.stuffLayer.setCollisionByExclusion([-1, 64, 65, 80, 81, 48, 49]);

    this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
      this.hasPlayerReachedStairs = true;
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        if (this.level < this.totalLevels) {
          this.health = this.player.health;
          this.bulletCooldown = this.player.weaponCanFireFrameDelta;
          this.bulletPower = this.player.bulletPower;
          this.bulletSpeed = this.player.bulletSpeed;
          this.scene.restart();
        } else {
        this.scene.start("Cutscene", {controls: this.controls, health: this.player.health, power: this.player.bulletPower, speed: this.player.bulletSpeed, cooldown: this.player.weaponCanFireFrameDelta})
        //this.scene.start("BossScene", { health: this.player.health, power: this.player.bulletPower, speed: this.player.bulletSpeed, cooldown: this.player.weaponCanFireFrameDelta});
      }
        return;
      });
    });

    // Place the player in the first room
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX);
    const y = map.tileToWorldY(playerRoom.centerY);
    console.log(startRoom)
    this.player = new Player(this, x, y);
    if (this.level != 1) {
      this.player.health = this.health;
      this.player.weaponCanFireFrameDelta = this.bulletCooldown;
      this.player.bulletPower = this.bulletPower;
      this.player.bulletSpeed = this.bulletSpeed;
      this.player.controls = this.controls
      console.log(this.controls)
    }

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, this.stuffLayer);

    if (this.heartPowerUp !== undefined) {
    this.physics.add.overlap(this.player.sprite, this.heartPowerUp.sprite, this.healthUpgrade, null, this);
    console.log("health");
  }
  if (this.spoonPowerUp !== undefined) {
    this.physics.add.overlap(this.player.sprite, this.spoonPowerUp.sprite, this.spoonUpgrade, null, this);
    console.log("spoon upgrade");
  }

    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player.sprite);

    // Help text that has a "fixed" position on the screen
    // this.healthDisplay = this.add.text(16, 16, "HP: " + this.player.health + "\nFind the stairs.", {
    //     font: "18px monospace",
    //     fill: "#000000",
    //     padding: { x: 20, y: 10 },
    //     backgroundColor: "#ffffff"
    //   })
    //   .setScrollFactor(0);
    // this.healthDisplay.depth = 13;

    this.healthDisplay = this.add.sprite(70, 20, "hearts")
    this.healthDisplay.setTexture("hearts", 0)
    this.healthDisplay.fixedToCamera = true;
    this.healthDisplay.setScrollFactor(0)


    // ENEMIES
    this.cook = new Cook(this,
      this.groundLayer.tileToWorldX(enemyRoom.centerX),
      this.groundLayer.tileToWorldY(enemyRoom.centerY))
      // this.groundLayer.tileToWorldX(startRoom.right - 1) + 20,
      // this.groundLayer.tileToWorldX(startRoom.bottom - 1))
    this.enemies.push(this.cook)
    this.butler = new Butler(this,
      this.groundLayer.tileToWorldX(startRoom.left + 1) + 20,
      this.groundLayer.tileToWorldX(startRoom.bottom - 1))
    this.enemies.push(this.butler)
    //this.player.resetBullets()
    //this.physics.add.collider(this.cook.sprite, this.stuffLayer);
    this.physics.add.overlap(this.butler.sprite, this.player.sprite, function(){if (this.butler.iframe == false) {this.player.takeDamage(this.currentFrame)}}, null, this)

    // this.snake = new Snake(this,
    //   this.groundLayer.tileToWorldX(startRoom.right - 2) + 20,
    //   this.groundLayer.tileToWorldX(startRoom.bottom - 2))
    // this.enemies.push(this.snake)
    //
    // this.physics.add.collider(this.snake.sprite, this.groundLayer, this.snake.flipDirec, null, this)
    this.player.resetBullets()
    // pathfinding stuff
    this.finder = new EasyStar.js()
    var grid = [];
    for(var i = 0; i < map.height; i++){
      var col = [];
      for(var j = 0; j < map.width; j++){
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
      if (!(map.getLayer(0).collideIndexes.includes(i))) {
          acceptableTiles.push(i)
      }
    }
    this.finder.setAcceptableTiles(acceptableTiles)

    //sounds
    const music = this.sound.add('music');
    if (this.level == 1) {
    music.play({
      volume: 0.5,
      loop: true
    })
  }

    this.yawn = this.sound.add("yawn");
    this.pop = this.sound.add("pop");
    this.enemyHit = this.sound.add("enemyHit");

    this.notifs = this.add.text(500, 16, "Lorum ipsum.", {
         font: "18px monospace",
         fill: "#000000",
         padding: { x: 20, y: 10 },
         backgroundColor: "#ffffff"
       })
       .setScrollFactor(0);
     this.notifs.depth = 13;
     this.notifs.visible = false;

  }

  update(time, delta) {



    // housekeeping
    this.currentFrame++
    this.tilemapVisibility.setActiveRoom(this.player.room);
    if (this.level == 1) {
      if (this.currentFrame > 50) {
        this.cameras.main.pan(this.butler.sprite.x, this.butler.sprite.y)

      }

      if (this.currentFrame == 120) {
        this.butlerMessage = this.add.text(this.butler.sprite.x - 230, this.butler.sprite.y + 200, "Find the stairs before the butler catches you.", {
          font: "18px monospace",
          fill: "#ffffff",
          align: "center"
          // boundsAlignH: "center",
          // boundsAlignV: "middle",
          // padding: { x: 20, y: 10 },
          // backgroundColor: "#ffffff"
        })
      }

      if (this.currentFrame == 400) {
        //this.butlerMessage.setText(" ")
        this.butlerMessage.destroy()

      }
    }

    if (this.currentFrame > this.tutorial_end) {
    this.cameras.main.startFollow(this.player.sprite)
    // player has reached stairs
    if (this.hasPlayerReachedStairs) return;

    // player has died
    if (this.player.health <= 0) {
      this.scene.start("DeathScene");
      //this.scene.restart();
      return;
    }

    // update the player
    this.player.update(this);
    this.healthDisplay.setTexture("hearts", 4 - this.player.health)

    // move enemies
    if (this.currentFrame == 500) {
      this.yawn.play()
    }
    if (this.currentFrame > 500){
      if (this.currentFrame % 20 == 0) {
        currentPath = this.pathFind(this.butler.tileX, this.butler.tileY, this.player.tileX, this.player.tileY)
      }
      this.butler.update(currentPath);
    }

    this.cook.update();
    //this.snake.update()

    if (typeof this.heartPowerUp !== 'undefined') {
      this.heartPowerUp.update();
      if (this.player.room == this.heartPowerUp.room) {
        this.heartPowerUp.discovered = true
      } else {
        this.heartPowerUp.discovered = false
      }
    }

    if (typeof this.spoonPowerUp !== 'undefined') {
      this.spoonPowerUp.update();
      if (this.player.room == this.spoonPowerUp.room) {
        this.spoonPowerUp.discovered = true
      } else {
        this.spoonPowerUp.discovered = false
      }
    }

    if (this.currentFrame - this.upgradeFrame > 400) {
      this.notifs.visible = false;
    }

    // set visibility/discovery of enemies
    if (this.player.room == this.cook.room) {
      this.cook.discovered = true
    }

  }}

//create enemy Rooms
createEnemyRoom(rooms, enemyRoom, floorTiles, middleTiles, TOP_FIRST, TOP_SECOND, LEFT, ITEM, RIGHT) {

// Place enemy room contents
  this.groundLayer.weightedRandomize(enemyRoom.x + 1, enemyRoom.y + 1, enemyRoom.width - 2, enemyRoom.height - 2, floorTiles);
  this.stuffLayer.putTilesAt(middleTiles, enemyRoom.centerX - 1, enemyRoom.centerY - 1);

  var enemyDoor = enemyRoom.getDoorLocations(); // → Returns an array of {x, y} objects

  for(var i = 0; i <enemyDoor.length; i++) {
    if (enemyDoor[i].y === 0){
      var doorIsTop = true
    } if (enemyDoor[i].x === 0){
      var doorIsLeft = true
    } if (enemyDoor[i].x === enemyRoom.width - 1) {
      var doorIsRight = true
    }

  };

  for (var i = 0; i < enemyDoor.length; i++) {
    if (doorIsTop != true) {
      this.stuffLayer.weightedRandomize(enemyRoom.x + 2, enemyRoom.y, enemyRoom.width - 4, 1, TOP_FIRST);
      this.stuffLayer.weightedRandomize(enemyRoom.x + 2, enemyRoom.y + 1, enemyRoom.width - 4, 1, TOP_SECOND);
    } if (doorIsLeft != true) {
      this.stuffLayer.putTilesAt(LEFT, enemyRoom.x + 1, enemyRoom.centerY - 1);
      this.topLayer.putTileAt(ITEM, enemyRoom.x + 1, enemyRoom.centerY + 1 );
    } if (doorIsRight != true) {
      this.stuffLayer.putTilesAt(RIGHT, enemyRoom.right - 1, enemyRoom.centerY - 1);
    }
  };
}

// pathfinding functions
getTileID(x,y) {
  var tile = this.groundLayer.getTileAt(x, y)
  return tile.index
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

healthUpgrade() {
  if (this.player.health < this.player.maxHealth) {
    this.player.health++;
    this.heartPowerUp.sprite.destroy();
  }
}

spoonUpgrade() {
  let upgrade_type = Phaser.Math.Between(0, 2);
  if (upgrade_type == 0) { // decrease bullet cooldown
    this.player.weaponCanFireFrameDelta -= 4;
    this.notifs.text = "Bullet fire rate\nincreased.";
  } else if (upgrade_type == 1) { // increase bullet damage
    this.player.bulletPower += 1;
    this.notifs.text = "Bullet damage\nincreased.";
  } else if (upgrade_type == 2) { // increase bullet movement speed
    this.player.bulletSpeed += 80;
    this.notifs.text = "Bullet velocity\nincreased.";
  }
  this.notifs.visible = true;
  this.upgradeFrame = this.currentFrame;
  this.spoonPowerUp.sprite.destroy();
}


}
