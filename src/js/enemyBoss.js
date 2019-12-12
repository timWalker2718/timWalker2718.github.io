export default class Boss {
  constructor(scene, x, y) {

    // attributes
    this.first = true;
    this.animate = true;
    this.order;
    this.attack = false;
    this.attack_type = 0;
    this.phase2_set = 0;

    this.teleport_x;
    this.teleport_y;

    this.temp_x;
    this.temp_y;
    this.prev_tempx;
    this.prev_tempy;

    this.attackStart;
    this.introTime = 1600;
    this.attackTime_1 = 3800;
    this.attackTime_2 = 3900;
    this.attackTime_3 = 6000;
    this.attackTime_4 = 6000;

    this.attack1_switch;

    this.attack2_n;
    this.attack2_s;
    this.attack2_e;
    this.attack2_w;
    this.attack2_counter;
    this.attack2_counter2;

    this.attack3_list;

    this.maxHealth = 22;
    this.health = this.maxHealth;

    this.attackTile;
    this.warmupTile;

    // location stuff
    this.scene = scene;

    // invincibility stuff
    this.iframe = false;
    this.iframeNum = 0;
    this.numIframesPerHit = 40;

    const anims =this.scene.anims;

    // idle animation
    anims.create({
      key: "bossAnim",
      frames: anims.generateFrameNumbers("boss", { start: 1, end: 10 }),
      frameRate: 4,
      repeat: -1
    });

    // defeat animation
    anims.create({
      key: "bossEnd",
      frames: anims.generateFrameNumbers("boss", { start: 11, end: 16 }),
      frameRate: 6,
      repeat: 0
    });

    this.sprite =this.scene.physics.add.sprite(x, y, 'boss');

    this.attackTile =this.scene.physics.add.staticGroup();
    this.warmupTile =this.scene.physics.add.staticGroup();
  }

  update() {
    this.sprite.body.moves = false;

    if (this.health > 0) {
      if (!this.attack) {
        this.attackManager();
      } else {
        if (this.attack_type == 0) {
          this.intro();
        } else if (this.attack_type == 1) {
          this.attack1(); // random
        } else if (this.attack_type == 2) {
          this.attack2(); // lines
        } else if (this.attack_type == 3) {
          this.attack3(); // rectangles
        } else if (this.attack_type == 4) {
          this.attack4(); // followers
        }
      }
    }

    //if (this.phase2_set == 2) {
    //  this.attack4();
    //}

    if (this.phase2_set == 0 && this.health <= this.maxHealth / 2) {
      this.phase2_set = 1;
    }

    if (this.health <= 0) {
      if (!this.animate) {
        this.sprite.play("bossEnd");
        this.warmupTile.clear(true, true);
        this.attackTile.clear(true, true);
        this.animate = true;
      }
      this.sprite.x -= 8;
    }

    this.updateIframe();
  }

  attackManager() {
    if (!this.first) {
      if (this.animate) {
        this.sprite.play("bossAnim");
        this.animate = false;
      }
      if (this.health <= 0) {
        this.sprite.x =this.scene.map.widthInPixels / 2 - 20;
        this.sprite.y =this.scene.map.heightInPixels / 2 - 6;
        return;
      }
      // if (this.health > this.maxHealth / 2) {
         this.attack_type = Phaser.Math.Between(1,2);
      // } else {
          // this.attack_type = Phaser.Math.Between(2,3);
      // }
      if (this.phase2_set == 1) {
        this.phase2_set = 2;
      }
       if (this.attack_type == 2) {
         this.attack2_e = false;
         this.attack2_n = false;
         this.attack2_w = false;
         this.attack2_n = false;
         this.attack2_counter = 0;
       }
      if (this.attack_type == 3) {
        this.sprite.x =this.scene.map.widthInPixels / 2 - 20;
        this.sprite.y =this.scene.map.heightInPixels / 2 - 6;
        this.attack3_list = [];
      } else {
        this.teleport_x = Phaser.Math.Between(100, this.scene.map.widthInPixels - 100, 50);
        this.teleport_y = Phaser.Math.Between(100, this.scene.map.heightInPixels - 100, 50);
        this.sprite.x = (Math.floor(this.teleport_x / 50)) * 50;
        this.sprite.y = (Math.floor(this.teleport_y / 50)) * 50;
    }
    } else {
      this.attack_type = 0;
      this.first = false;
    }
    this.attackTile.clear(true, true);
    this.attackStart =this.scene.time.now;
    this.order = 0;
    this.attack = true;
   }

   intro() {
     if (this.scene.time.now - this.attackStart >= this.introTime) {
       this.attack = false;
     }
   }

  // fills map with randomly placed attacks
  // phase 2: faster
   attack1() {
     var random;

     if (this.health > this.maxHealth / 2) {
       this.attack1_switch = 2300;
     } else {
       this.attack1_switch = 1400;
     }

     if (this.scene.time.now - this.attackStart >= this.attackTime_1) {
       this.attack = false;
     }

     if (this.order == 0 && this.scene.time.now - this.attackStart < this.attack1_switch) {
       for (var i = 100; i < this.scene.map.widthInPixels - 50; i += 50) {
         for (var j = 100; j < this.scene.map.heightInPixels - 100; j += 50) {
           random = Phaser.Math.Between(0, 2);
           if (random < 2) {
             this.warmupTile.create(i, j, 'warmup');
           }
         }
       }
     this.order = 1;
     }

     if (this.order == 1 && this.scene.time.now - this.attackStart >= this.attack1_switch) {
       this.warmupTile.getChildren().forEach(function(warm) {
         this.attackTile.create(warm.x, warm.y, 'attack').setAlpha(.8);
         warm.destroy();
         }, this);
     }
   }

  // phase 1: boss doesn't teleport, sends out two attacks in straight lines
  // phase 2: boss doesn't teleport, sends out four straight lines, then four diagonal lines, then four straight lines
   attack2() {
     if (this.health > (this.maxHealth / 2)) {
       if (this.scene.time.now - this.attackStart >= this.attackTime_2 / 2) {
       this.attack = false;
     }
   } else {
     if (this.scene.time.now - this.attackStart >= this.attackTime_2) {
       this.attack = false
     }
   }

     if (this.health > (this.maxHealth / 2)) {
       if (this.order == 0) {
         if (this.scene.player.sprite.x < this.sprite.x) {
           this.warmupTile.create(this.sprite.x - 50, this.sprite.y, 'warmup');
           this.attack2_w = true;
         } else {
           this.warmupTile.create(this.sprite.x + 50, this.sprite.y, 'warmup');
           this.attack2_e = true;
         }
         if (this.scene.player.sprite.y < this.sprite.y) {
           this.warmupTile.create(this.sprite.x, this.sprite.y - 50, 'warmup');
           this.attack2_n = true;
         } else {
           this.warmupTile.create(this.sprite.x, this.sprite.y + 50, 'warmup');
           this.attack2_s = true;
         }
         this.order = 1;
       }

       if (this.order > 0 && this.order < 3 && this.scene.time.now - this.attackStart >= 800) {
         this.warmupTile.clear(true, true);
         if (this.attack2_w == true) {
           for (var i = this.sprite.x - 50; i > 50; i -= 50) {
             this.attackTile.create(i, this.sprite.y, 'attack').setAlpha(.8);
             if (i == 100) {
               this.order += 1;
             }
           }
         } else if (this.attack2_e == true) {
           for (var i = this.sprite.x + 50; i < this.scene.map.widthInPixels - 50; i += 50) {
             this.attackTile.create(i, this.sprite.y, 'attack').setAlpha(.8);
             if (i ==this.scene.map.widthInPixels - 100) {
               this.order += 1;
             }
           }
         }
         if (this.attack2_n == true) {
           for (var i = this.sprite.y - 50; i > 50; i -= 50) {
             this.attackTile.create(this.sprite.x, i, 'attack').setAlpha(.8);
             if (i == 100) {
               this.order += 1;
             }
           }
         } else if (this.attack2_s == true) {
           for (var i = this.sprite.y + 50; i < this.scene.map.heightInPixels - 100; i += 50) {
             this.attackTile.create(this.sprite.x, i, 'attack').setAlpha(.8);
             if (i ==this.scene.map.heightInPixels - 150) {
               this.order += 1;
             }
           }
         }
       }
     } else {
       if (this.order == 0 || (this.order == 7 && this.scene.time.now - this.attackStart >= 2600)) {

         this.attackTile.clear(true, true);
         this.attack2_counter = 0;

         this.warmupTile.create(this.sprite.x - 50, this.sprite.y, 'warmup');
         this.warmupTile.create(this.sprite.x + 50, this.sprite.y, 'warmup');
         this.warmupTile.create(this.sprite.x, this.sprite.y + 50, 'warmup');
         this.warmupTile.create(this.sprite.x, this.sprite.y - 50, 'warmup');

         if (this.order == 0) {
           this.order = 1;
         } else if (this.order == 7 && this.attackTile.getLength() == 0) {
           this.order = 8;
         }
       }

       if (this.order == 5 && this.scene.time.now - this.attackStart >= 1300) {
         this.attackTile.clear(true, true);

         this.warmupTile.create(this.sprite.x - 50, this.sprite.y + 50, 'warmup');
         this.warmupTile.create(this.sprite.x - 50, this.sprite.y - 50, 'warmup');
         this.warmupTile.create(this.sprite.x + 50, this.sprite.y + 50, 'warmup');
         this.warmupTile.create(this.sprite.x + 50, this.sprite.y - 50, 'warmup');

         this.attack2_counter2 = 1;
         this.attack2_counter = 1;
         this.order = 6;
       }

       if (this.order > 5 && this.order < 7 && this.scene.time.now - this.attackStart >= 2000) {
         this.warmupTile.clear(true, true);

         for (var i = this.sprite.x - 50; i > 50; i -= 50) {
           if (this.sprite.y + (50 * this.attack2_counter2) < this.scene.map.heightInPixels - 100) {
             this.attackTile.create(i, this.sprite.y + (50 * this.attack2_counter2), 'attack').setAlpha(.8);
           }
           if (this.sprite.y - (50 * this.attack2_counter2) > 50) {
             this.attackTile.create(i, this.sprite.y - (50 * this.attack2_counter2), 'attack').setAlpha(.8);
           }
           this.attack2_counter2 += 1;
           if (i == 100) {
             this.order += 1;
           }
         }

         for (var i = this.sprite.x + 50; i < this.scene.map.widthInPixels - 50; i += 50) {
           if (this.sprite.y + (50 * this.attack2_counter) < this.scene.map.heightInPixels - 100) {
             this.attackTile.create(i, this.sprite.y + (50 * this.attack2_counter), 'attack').setAlpha(.8);
           }
           if (this.sprite.y - (50 * this.attack2_counter) > 50) {
             this.attackTile.create(i, this.sprite.y - (50 * this.attack2_counter), 'attack').setAlpha(.8);
           }
           this.attack2_counter += 1;
           if (i == 100) {
             this.order += 1;
           }
         }
       }

       if ((this.order > 0 && this.order < 5 && this.scene.time.now - this.attackStart >= 700) || (this.order > 7 &&this.scene.time.now - this.attackStart >= 3300)) {
         this.warmupTile.clear(true, true);

         for (var i = this.sprite.x - 50; i > 50; i -= 50) {
           this.attackTile.create(i, this.sprite.y, 'attack').setAlpha(.8);
           if (i == 100) {
             this.order += 1;
           }
         }

         for (var i = 1; i < 30; i++) {
           if (this.sprite.x + (50 * i) < this.scene.map.widthInPixels - 50) {
             this.attackTile.create(this.sprite.x + (50 * i), this.sprite.y, 'attack').setAlpha(.8);
           } else if (this.sprite.x + (50 * i) == this.scene.map.widthInPixels - 50) {
             this.attack2_counter += 1;
           }
           if (this.sprite.x - (50 * i) > 50) {
             this.attackTile.create(this.sprite.x - (50 * i), this.sprite.y, 'attack').setAlpha(.8);
           } else if (this.sprite.x - (50 * i) == 50) {
             this.attack2_counter += 1;
           }
           if (this.sprite.y - (50 * i) > 50) {
             this.attackTile.create(this.sprite.x, this.sprite.y - (50 * i), 'attack').setAlpha(.8);
           } else if (this.sprite.y - (50 * i) == 50) {
             this.attack2_counter += 1;
           }
           if (this.sprite.y + (50 * i) < this.scene.map.heightInPixels - 100) {
             this.attackTile.create(this.sprite.x, this.sprite.y + (50 * i), 'attack').setAlpha(.8);
           } else if (this.sprite.y + (50 * i) == this.scene.map.heightInPixels - 100) {
             this.attack2_counter += 1;
           }

           if (this.attack2_counter == 4) {
             break;
           }
         }
       }
     }
   }

  // boss teleports to middle of room, creates damaging rectangles that expand outwards from him
  // (in progress)
   attack3() {
     var random;

     if (this.scene.time.now - this.attackStart >= this.attackTime_3) {
       this.attack = false;
     }

     for (var i = 0; i < 8; i++) {
       if (i == 7 && this.attack3_list.includes(0) == false) {
         this.attack3_list.push(0);
       } else {
         random = Phaser.Math.Between(0, 8);
         this.attack3_list.push(random);
       }
     }

     if (this.order == 0) {
       this.this.attack3_helper(2, this.attack3_list, [], 0, 0, this.sprite.x + 50, this.sprite.y,this.scene.time.now, 600);
       this.order += 1;
     }
   }

   attack3_helper(rec_size, rec_list, new_rec_list, turn_order, turn_counter, start_x, start_y, startTime, duration) {
     for (var i = 0; i < rec_list.length; i++) {
       if (turn_counter == rec_size) {
         turn_this.order += 1;
         new_rec_list.push(1);
         new_rec_list.push(1);
         turn_counter = 0;
       }

       if (turn_order == 0) {
           start_y -= 50;
           turn_counter -= 1;
           turn_this.order += 1;
       } else if (turn_order == 1) {
           start_x -= 50;
       } else if (turn_order == 2) {
           start_y += 50;
       } else if (turn_order == 3) {
           start_x += 50;
       } else if (turn_order == 4) {
           start_y -= 50;
       }

       if (rec_list[i] == 0) {
         new_rec_list.push(0);
       } else {
         new_rec_list.push(this.attackTile.create(start_x, start_y, 'attack').setAlpha(.8));
       }
       turn_counter += 1;

       if (i == rec_list.length - 1) {
         turn_order = 5;
       }
     }

     if (turn_order == 5) {
       for (var i = 0; i < rec_list.length; i++) {
         if (rec_list[i] != 0 && rec_size != 2) {
           rec_list[i].sprite.destroy();
         }
       }
         return rec_size += 2, new_rec_list, start_x, start_y;
       }

   }

  // attacks at the player's position
  // phase 2: faster
   attack4() {
     var temp_player = this.scene.player.sprite;
     var order = this.order;
     var temp_x = this.temp_x;
     var temp_y = this.temp_y;
     var prev_tempx = this.prev_tempx;
     var prev_tempy = this.prev_tempy
     var warmupTile = this.warmupTile;
     var attackTile = this.attackTile;

     if (this.phase2_set != 2 &&this.scene.time.now - this.attackStart >= this.attackTime_4) {
       this.attack = false;
     }

       function attack4_loop (i, time, time_backup) {
          setTimeout(function () {
            time = time_backup;
             if (i == 0 || i % 2 == 0) {
                   if (order != 1) {
                     prev_tempx = temp_x;
                     prev_tempy = temp_y;
                   }

                   if (temp_player.x % 50 < 25) {
                     temp_x = temp_player.x - (temp_player.x % 50);
                   } else {
                     temp_x = temp_player.x + (50 - (temp_player.x % 50));
                   }
                   if (temp_player.y % 50 < 25) {
                     temp_y = temp_player.y - (temp_player.y % 50);
                   } else {
                     temp_y = temp_player.y + (50 - (temp_player.y % 50));
                   }

                warmupTile.create(temp_x, temp_y, 'warmup');
                order = 3;
              } else {
                var a = attackTile.create(prev_tempx, prev_tempy, 'attack').setAlpha(.8);
                warmupTile.getChildren().forEach(function(warm) {
                    if (warm.x == a.x && warm.y == a.y) {
                      warm.destroy();
                    }
                }, this);
                time = 30;
                order = 4;
              }
             i++;
             if (this.phase2_set == 2) {
                attack4_loop(i, time, time_backup);
             } else {
                if ((i * time_backup) <= 5400) {
                  attack4_loop(i, time, time_backup);
                }
              }
          }, time)
        }

     if (this.order == 0) {
       if (this.health > this.maxHealth / 2) {
         attack4_loop(0, 420, 420);
       } else {
         order = attack4_loop(0, 300, 300);
       }
       this.order = 1;
     }

     //this.order = order;

     if (this.order < 5 && this.scene.time.now - this.attackStart >= 4600) {
        if (this.order == 3) {
          var a = this.attackTile.create(this.prev_tempx, this.prev_tempy, 'attack').setAlpha(.8);
          this.warmupTile.getChildren().forEach(function(warm) {
              if (warm.x == a.x && warm.y == a.y) {
                warm.destroy();
              }
          }, this);
          if (this.scene.time.now - this.attackStart >= 4850) {
            this.order = 4;
          }
        } else if (this.order == 4) {
          this.attackTile.create(this.temp_x, this.temp_y, 'attack').setAlpha(.8);
          this.warmupTile.clear(true, true);
          this.order = 5;
        }
      }
    }

  updateIframe() {
    if (this.iframe && ((this.scene.currentFrame - this.iframeNum) > this.numIframesPerHit)) {
      this.iframe = false;
    }
  }

  destroy() {
    this.sprite.destroy();
  }

  takeDamage(damage) {
    if (this.iframe == false) {
      console.log(this.health + "/" + this.maxHealth);
      this.iframe = true;
      this.iframeNum = this.scene.currentFrame;
      this.health -= damage;
      this.scene.enemyHit.play();
    }
  }
}
