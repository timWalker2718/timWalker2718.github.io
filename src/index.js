/*global Phaser, window*/
import DungeonScene from './scenes/dungeon-scene.js';
import BossScene from './scenes/boss-scene.js';
import WinScene from './scenes/WinScene.js';
import DeathScene from './scenes/DeathScene.js';
import Config from './config/config.js';
import TutorialScene from './scenes/Tutorial.js'
import Intro from './scenes/intro.js'
import Start from './scenes/start.js'
import Cutscene from './scenes/cutscene.js'


class Game extends Phaser.Game {
  constructor () {
    super(Config);
    this.scene.add('Dungeon', DungeonScene);
    this.scene.add('BossScene', BossScene);
    this.scene.add('WinScene', WinScene);
    this.scene.add('DeathScene', DeathScene);
    this.scene.add('TutorialScene', TutorialScene)
    this.scene.add('Intro', Intro)
    this.scene.add("Start", Start)
    this.scene.add("Cutscene", Cutscene)
    this.scene.start('Start');
  }

}

window.game = new Game();
