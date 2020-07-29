import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import * as Phaser from 'phaser';
import { GameScene } from './game';

const DPR:number = 2;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  config: Phaser.Types.Core.GameConfig;

  game: Phaser.Game;

  constructor(private plt: Platform) {
    this.config = {
      type: Phaser.AUTO,
      width: window.innerWidth * DPR,
      height: window.innerHeight * DPR,
      parent: 'gameContainer',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {y:0},
          debug: false
        }
      },
      scene: GameScene
    };
  }

  ngOnInit() {
    this.game = new Phaser.Game(this.config);
  }

  ngOnDestroy() {
    this.game.destroy(true, false);
  }
}
