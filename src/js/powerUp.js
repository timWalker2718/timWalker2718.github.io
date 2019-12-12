export default class powerUp {
  constructor(scene, x, y, image) {
    this.scene = scene;
    this.sprite = this.scene.physics.add.sprite(x, y, image).setSize(32, 32);
    this.sprite.visible = false;
    this.discovered = false;
  }

  update() {
    this.updatePos();
    this.updateVisibility();

  }

  updateVisibility() {
    if (this.discovered == true) {
      this.sprite.visible = true
    } else {
      this.sprite.visible = false;
    }
  }

  updatePos() {
    this.tileX = this.scene.groundLayer.worldToTileX(this.sprite.x);
    this.tileY = this.scene.groundLayer.worldToTileY(this.sprite.y);
    try {
      this.room = this.scene.dungeon.getRoomAt(this.tileX, this.tileY)
    } catch {}
  }
}
