Game = {};

var w = 800;
var h = 600;

Game.Boot = function(game) {
  this.game = game;
}

Game.Boot.prototype = {
  preload: function() {
		this.game.stage.backgroundColor = '#FFF';
		this.game.load.image('loading', 'assets/loading.png');
  },
  create: function() {
   this.game.state.start('Load');
  }
}

Game.Load = function(game) {
  this.game = game;
}

Game.Load.prototype = {
  preload: function() {

    //Loading Screen Message/bar
    loading_text = this.game.add.text(w/2, h/2, 'Please Wait...', { font: '30px Helvetica', fill: '#000' });
  	loading_text.anchor.setTo(0.5, 0.5);
  	preloading = this.game.add.sprite(w/2-64, h/2+50, 'loading');
  	this.game.load.setPreloadSprite(preloading);

    //Load images
    this.game.load.image('background','assets/background.png');
    this.game.load.image('title','assets/title.png');
    this.game.load.image('instructions','assets/instructions.png');

    tri = new Tri(game);
    tri.preload();

    this.game.load.image('bullet','assets/bullet.png');
    this.game.load.atlasXML('enemy','assets/enemy_sheet.png','assets/enemy_sheet.xml');
    this.game.load.image('pixel','assets/pixel.png');
    this.game.load.atlasXML('powerup','assets/powerup_sheet.png','assets/powerup_sheet.xml');

    //Load sound
    this.game.load.audio('enemy_hit', 'assets/enemy_hit.wav');
    this.game.load.audio('enemy_dead', 'assets/enemy_dead.wav');
    this.game.load.audio('enemy_shoot', 'assets/enemy_shoot.wav');
    this.game.load.audio('powerup','assets/powerup.wav');
    this.game.load.audio('music','assets/a_journey_awaits.mp3'); //A Journey Awaits by lemon42 from http://opengameart.org/content/a-journey-awaits

  },
  create: function() {
    this.game.state.start('Menu');
  }
}
