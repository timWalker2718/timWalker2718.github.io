/*global Phaser*/
var oh;

export default class WinScene extends Phaser.Scene {
  constructor () {
    super('WinScene');
  }

  init (data) {
    // Initialization code goes here
    // data that carries between scenes
  }

  preload () {
    // Preload assets
    this.load.audio("music", "../assets/audio/Memoraphile - Spooky Dungeon.mp3")
  }

  create (data) {
    //Create the scene
    oh = this.add.text(330, 290, 'You won!', { fontSize: '20px', fill: '#fff' });
    // const music = this.sound.add('music');
    // music.stop();
    //
    // this.registry.destroy();
    // this.events.off();
    //
    // let start_over = [this.scene.get('BossScene'), this.scene.get('Dungeon'), this.scene.get("Intro"), this.scene.get("TutorialScene")];
    // for (let i = 0; i < start_over.length; i++) {
    //   console.log(i);
    //   start_over[i].scene.restart();
    //   start_over[i].scene.stop();
    // }

  }

  update (time, delta) {
    // this.input.keyboard.on('keydown', function (event) {
    //   this.scene.start('Start');
    //   }, this);﻿
  }
}
