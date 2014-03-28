PowerUp = function(enemy, game) {
  this.game = game;

  this.sprite = game.add.sprite(enemy.x, enemy.y, 'powerup');
  this.sprite.anchor.setTo(0.5,0.5);

  //name: 0 for health and 1 for rapidfire
  this.sprite.name = rand(0,1);
  this.sprite.frame = this.sprite.name;

  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
};
