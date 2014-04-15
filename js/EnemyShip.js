EnemyShip = function (index, game, tri, bullets) {

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.ship = game.add.sprite(x, y, 'enemy');
    this.ship.animations.add('warp-in',[3,4,5,6,7,8,0],true);

    this.ship.animations.play('warp-in',7);

    this.spawnTimer = game.time.now;

    this.ship.frame = 0;
    this.game = game;
    this.health = 3;
    this.tri = tri;
    this.bullets = bullets;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.ship.anchor.set(0.5,0.5);

    this.ship.name = index.toString();
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(1, 1);

    this.ship.angle = game.rnd.angle();

    this.emitter = game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);

    this.enemyHit_s = this.game.add.sound('enemy_hit');
    this.enemyHit_s.volume = 0.2;

    this.enemyDead_s = this.game.add.sound('enemy_dead');
    this.enemyDead_s.volume = 0.2;

    this.enemyShoot_s = this.game.add.sound('enemy_shoot');
    this.enemyShoot_s.volume = 0.2;

    // 50% Chance to spawn heading toward Tri
    if (rand(0,1) === 1) {
      game.physics.arcade.velocityFromRotation(this.ship.rotation, 100, this.ship.body.velocity);
    }else {
      game.physics.arcade.velocityFromRotation(game.physics.arcade.angleBetween(this.ship, this.tri.sprite), 150, this.ship.body.velocity);
    }


};

EnemyShip.prototype = {
  damage: function() {
    this.health -= 1;
    score += 50;

    if (this.health == 2)
    {
      this.ship.frame = 1; //cracked
    }
    else if (this.health == 1){
      this.ship.frame = 2; //more cracked
    }

    if (this.health <= 0)
    {
      this.destroyed(); //Boom!!
    }else {
      this.enemyHit_s.play()
    }

    return false;
  },
  destroyed: function() {
    score += 50;
    enemiesAlive -= 1;
    kills += 1;

    this.alive = false;
    this.emitter.x = this.ship.x;
    this.emitter.y = this.ship.y;
    this.emitter.start(true, 1000, null, 128);

    // 50% PowerUp drop rate
    if ((rand(1,2) % 2) && (powerupsTotal < powerupsMax) && (this.tri.overload == false)) {
        powerups.push(new PowerUp(this.ship, game));
        powerupsTotal += 1;
    }

    this.enemyDead_s.play()
    this.ship.kill();

    return true;
  },
  update: function() {
    // Wait 3 seconds before attacking
    if (game.time.now >= this.spawnTimer+3000) {
      this.ship.rotation = game.physics.arcade.angleBetween(this.ship, this.tri.sprite);

      // if try is withing 300px turn and fire
      if (game.physics.arcade.distanceBetween(this.ship, this.tri.sprite) < 300)
      {
          if (game.time.now > this.nextFire && this.bullets.countDead() > 0)
          {
              if (this.tri.alive == true){
                this.nextFire = game.time.now + this.fireRate;
                this.enemyShoot_s.play();

                var bullet = this.bullets.getFirstDead();
                bullet.reset(this.ship.x, this.ship.y);
                bullet.rotation = game.physics.arcade.moveToObject(bullet, this.tri.sprite, 500);
              }
          }
      }
    }
  }

}
