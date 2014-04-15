Tri = function(game) {
  this.game = game;
  this.sprite = null;
  this.shieldBar = null;
  this.bullets = null;
  this.health = 10;
  this.alive = true;
  this.currentSpeed = 0;
  this.fireRate = 250;
  this.nextFire = 0;
  this.powerupTimer = 0;
  this.emitter = null;
  this.overloadTimer = 0;
};

Tri.prototype = {
  preload: function() {
    this.game.load.atlasXML('tri','assets/tri_sheet.png','assets/tri_sheet.xml');

    this.game.load.atlasXML('shieldBar','assets/shield_sheet.png','assets/shield_sheet.xml');

    this.game.load.audio('shield_hit','assets/shield.wav');
    this.game.load.audio('player_dead', 'assets/player_dead.wav');
    this.game.load.audio('shot', 'assets/laser_shoot.wav');
    this.game.load.audio('overload', 'assets/overload.wav');

    this.game.load.image('pixel2','assets/player_pixel.png'); //Explode into little triangles

  },
  create: function() {

    //Sounds
    this.playerDead_s = this.game.add.sound('player_dead');
    this.playerDead_s.volume = 0.2;

    this.shieldHit_s = this.game.add.sound('shield_hit');
    this.shieldHit_s.volume = 0.5;

    this.overload_s = this.game.add.sound('overload');
    this.overload_s.volume = 0.3;

    this.sprite = this.game.add.sprite(this.game.world.centerX,this.game.world.centerY,'tri');
    this.sprite.anchor.setTo(0.5,0.5);


    shieldText =  this.game.add.text(16,36, 'Shields', { font: '18px Arial', fill: '#FFFFFF' });
    shieldText.fixedToCamera = true;
    this.shieldBar = this.game.add.sprite(90,36,'shieldBar');
    this.shieldBar.fixedToCamera = true;

    this.sprite.animations.add('shields_up',[1,2,3,4],true);

    // Setup ship movement, decelerate when not moving forward
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.drag.set(0.5);
    this.sprite.body.maxVelocity.setTo(800, 800);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.scale.x = 1.2;
    this.sprite.scale.y = 1.2;

    //Add Some Bullets
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'pbullet', 0, false);
    this.bullets.setAll('anchor.x', 0);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
    this.shoot_s = this.game.add.sound('shot');
    this.shoot_s.volume = 0.2;

    //Particle emitter for Player Explosion
    this.emitter = this.game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel2');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);


    //Set Camera to follow Player
    this.game.camera.follow(this.sprite, Phaser.Camera.FOLLOW_TOPDOWN);

    //Accept Arrow Keys as input
    this.cursors = game.input.keyboard.createCursorKeys();

    overloadText = game.add.text(w/2, h/2+200, 'Not Enough Shield Energy', { font: "36px Helvetica", fill: "#ffffff", align: "center"});
    overloadText.font = 'Helvetica';
    overloadText.fontWeight = 'bold';
    overloadText.anchor.set(0.5);
    overloadText.fixedToCamera = true;
    overloadText.visible = false;

  },
  update: function() {

    //  Show a white shield bar if Player has enough shield to overload
    if (this.health > 3) {
      this.shieldBar.scale.x = this.health/20;
      this.shieldBar.frame = 0;
    }else {
      this.shieldBar.scale.x = this.health/20;
      this.shieldBar.frame = 1;
    }

    //  Show Tri without shields if they've been knocked out
    if (this.health > 0)
      this.sprite.play('shields_up',15,true);
    else
      this.sprite.frame = 0;


    // Check for bullet hits
    this.game.physics.arcade.overlap(enemyBullets, this.sprite, this.bulletHitTri, null, this);

    // Controls
    if (this.cursors.left.isDown || aKey.isDown)
        this.sprite.angle -= 4.5;
    else if (this.cursors.right.isDown || dKey.isDown)
        this.sprite.angle += 4.5;

    if (this.cursors.up.isDown || wKey.isDown)
        this.currentSpeed = 550;
    else if (this.cursors.down.isDown || sKey.isDown)
      this.currentSpeed = 0; //Drift
    else
        if (this.currentSpeed > 0)
            this.currentSpeed -= 12;

    spaceKey.onDown.add(this.overloadShield, this);

    // Show Message if can't overload
    if ((this.overloadTimer - game.time.now) > 0)
      overloadText.visible = true;
    else
      overloadText.visible = false;


    if (this.currentSpeed > 0)
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.currentSpeed, this.sprite.body.velocity);

    if (game.input.activePointer.isDown && this.alive == true)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
          this.shoot_s.play();
          this.nextFire = this.game.time.now + this.fireRate;
          var bullet = this.bullets.getFirstExists(false);
          bullet.reset(this.sprite.x, this.sprite.y);
          bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 2000);
        }
    }

    //  Increate firerate while powerupTimer is active
    if (game.time.now < this.powerupTimer)
      this.fireRate = 80;
    else
      this.fireRate = 250;

  },
  overloadShield: function(){
    if (this.alive == true){
      if (this.health > 3  ) {
        this.health -= 3;
        this.overload_s.play();

        //Destroy All Enemies
        for (var i = 0; i < enemies.length; i++)
        {
            if (enemies[i].alive)
            {
                score += 150; //Add points you'd normally get for 3 hits
                enemies[i].destroyed();
            }

        }
      }else {
        this.overloadTimer = game.time.now+1000;
      }
    }
  },
  bulletHitTri: function (sprite, bullet) {
    bullet.kill();
    this.health -= 1;

    if (this.health < 0)
    {
        this.alive = false;
        sprite.kill();
        this.shieldBar.kill();

        this.playerDead_s.play();

        //BOOOOOM
        this.emitter.x = sprite.x;
        this.emitter.y = sprite.y;
        this.emitter.start(true, 5000, null, 1000);

    }else {
      this.shieldHit_s.play();
    }
  },
}
