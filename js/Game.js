/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function rand (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'playScreen');
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'playScreen');
var test;
var wKey;
var aKey;
var sKey;
var dKey;
var spaceKey;
var muteKey;

var tri;

var wave = 0;

var powerups = [];

var waveTimer = 0;
var waveSpawn = 0;
var score = 0;
var kills = 0;


var enemies = [];
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var enemiesMax = 20;

var enemyText;
var waveText;
var scoreText;
var healthText;
var overloadText;
var restartText;
var twitterButton;
var musicOn = true;

var main = {

  create: function() {
    this.game.world.setBounds(0, 0 ,1600,1200);

    // Music
    this.music = this.game.add.sound('music');
    this.music.volume = 0.5;
    this.music.play('',0,1,true);

    this.space = this.game.add.tileSprite(0,0,1600,1200,'background');

    tri.create();

    this.powerup_s = this.game.add.sound('powerup');
    this.powerup_s.volume = 0.2;
    waveTimer = game.time.now + 3000;

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'ebullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyShip(i, this.game, tri, enemyBullets));
    }


    //Setup WASD and extra keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);

    //Setup Messages
    enemiesText = game.add.text(16, 16, '', { font: "18px Helvetica", fill: "#ffffff" });
    enemiesText.fixedToCamera = true;

    waveText = game.add.text(w/2, h/2, '', { font: "36px Helvetica", fill: "#ffffff", align: "center", fontWeight: 'bold', fill: "#DF0101"});
    waveText.font = 'Helvetica';
    waveText.fontWeight = 'bold';
    waveText.anchor.set(0.5);
    waveText.fixedToCamera = true;

    scoreText = game.add.text(w*0.8, 16, '', { font: "18px Helvetica", fill: "#ffffff" });
    waveText.anchor.set(0.5);
    scoreText.fixedToCamera = true;

    restartText = game.add.text(w/2, h/2, '', { font: "32px Helvetica", fill: "#ffffff", align: "center"});
    restartText.font = 'Helvetica';
    restartText.anchor.set(0.5);
    restartText.fixedToCamera = true;
    restartText.visible = false;


  },

  update: function() {

    tri.update();

    //Check Enemies for hits or collisions
    enemiesAlive = 0;
    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            this.game.physics.arcade.overlap(tri.bullets, enemies[i].ship, this.bulletHitEnemy, null, this);
            enemies[i].update();
        }

    }

    //Respawn
    if (enemiesAlive === 0){
      this.respawn();
    }

    for (var i=0; i < powerups.length;i++){
      powerups[i].sprite.rotation += 0.05;
      this.game.physics.arcade.overlap(tri.sprite, powerups[i].sprite, this.hitPowerUp, null, this);
    }

    if ((waveTimer - game.time.now) > 0) {
      waveText.visible = true;
      waveText.setText('Incoming in: ' + (waveTimer - game.time.now));
    }else {
        waveText.visible = false;
    }


    // Reset Game
    if (tri.alive == false) {
      msg =  "Your Score: " + score + "\n";
      msg += "You Killed: " + kills + "!\n";
      msg += "~Press Space to Restart~\n";
      msg += "Tweet your highscore!";
      restartText.setText(msg);
      restartText.visible = true;

      twitterButton = game.add.button(w/2, h/2+110,'twitter', this.twitter, this);
      twitterButton.anchor.setTo(0.5,0.5);
      twitterButton.fixedToCamera = true;

      if (spaceKey.isDown ) {
        this.reset();
      }
    }

    // Toggle Music
    muteKey.onDown.add(this.toggleMute, this);

    // HUD
    enemiesText.setText('Enemies Detected: ' + enemiesAlive);
    scoreText.setText('Score '+score);
  },
  respawn: function() {
    //Respawn Enemies in 3 seconds
    if (waveTimer === 0) {
      waveTimer = game.time.now+3000;
    }
    else if (game.time.now > waveTimer) {
      prevEnemiesTotal = enemiesTotal;
      if (prevEnemiesTotal < 60){
          waveSpawn += 2;
      }
      enemiesTotal += waveSpawn;
      wave += 1;
      for (var i = prevEnemiesTotal; i < enemiesTotal; i++)
      {
          enemiesAlive++;
          enemies.push(new EnemyShip(i, this.game, tri, enemyBullets));
      }
      waveTimer = 0;
    }
  },
  toggleMute: function() {
    if (musicOn == true) {
      musicOn = false;
      this.music.volume = 0;
    }else {
      musicOn = true;
      this.music.volume = 0.5;
    }
  },
  reset: function() {
    this.music.stop();
    tri.alive = true;
    tri.health = 10;

    //Reset Variables
    powerups = [];
    waveTimer = 0;
    waveSpawn = 0;
    enemies = []
    enemiesAlive = 1;
    enemiesTotal = 1;
    score = 0;



    this.game.state.start('main');
  },
  twitter: function() {
    window.open('http://twitter.com/share?text=I+just+scored+'+score+'+in+"Tri"+See+if+you+can+beat+it+at&via=rantt_&url=http://www.divideby5.com/games/tri/', '_blank');
  },
  hitPowerUp:  function(tri_sprite,powerup) {
    this.powerup_s.play();
    powerup.kill();
    if (powerup.name === 0 && tri.health < 20) {
      tri.health += 2;
    }else if (powerup.name === 1) {
      tri.powerupTimer = game.time.now + 5000;
    }
  },

  bulletHitEnemy: function(ship,bullet) {

    bullet.kill();

    var destroyed = enemies[ship.name].damage();

  },

  // render: function() {
  //   game.debug.text('Health: ' + tri.health, 32, 96);
  //   game.debug.text('Kills: ' + kills, 32, 112);
  //   game.debug.text('test: ' + test, 32, 112);
  //   game.debug.text('wave: ' + wave, 32, 124);
  //   if ((waveTimer - game.time.now) > 0) {
  //     game.debug.text('respan in:' + (waveTimer - game.time.now),32,132);
  //   }
  //
  // }

}

game.state.add('Boot', Game.Boot);
game.state.add('Load', Game.Load);
game.state.add('Menu', Game.Menu);
game.state.add('main',main);

game.state.start('Boot');
