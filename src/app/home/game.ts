import * as Phaser from 'phaser';
const SCALED_CORRECTION = 1.75;
const SCALED = 0.20 * SCALED_CORRECTION;
const BLOCK_X_CORRECTION = 60;
const START_X = (window.innerWidth/2) + 150;
const PAD_START_Y = window.innerHeight +400;
const BALL_START_Y = window.innerHeight + 300;

export class GameScene extends Phaser.Scene {

  //emitters
  private emitter0;
  private emitter1;
  private blueBallEmitter;

  //normal blocks types
  private blueBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedBlocks: Phaser.Physics.Arcade.StaticGroup;
  private limeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedLimeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private purpleBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedPurpleBlocks: Phaser.Physics.Arcade.StaticGroup;
  private orangeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedOrangeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private lightOrangeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedLightOrangeBlocks: Phaser.Physics.Arcade.StaticGroup;
  private ligthBlueBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedLightBlueBlocks: Phaser.Physics.Arcade.StaticGroup;
  private yellowBlocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedYellowBlocks: Phaser.Physics.Arcade.StaticGroup;
  
  //special block types
  private expandedBlocks: Phaser.Physics.Arcade.StaticGroup;
  private shrinkBlocks: Phaser.Physics.Arcade.StaticGroup;
  private gunBlocks: Phaser.Physics.Arcade.StaticGroup;
  private multiBlocks: Phaser.Physics.Arcade.StaticGroup;
  private paddle: Phaser.Physics.Arcade.Sprite;

  //balls
  private balls: Phaser.Physics.Arcade.Group;
  private ball: Phaser.Physics.Arcade.Image;

  //variables
  public gameStarted:Boolean = false;
  public lives:number = 3;
  public gameOverText;
  public openingText;
  public livesText;
  public scoreText;
  public playerWonText;
  public score = 0;

  public dragObj;
  public checkObject;

  public started = false;

  public ball_crack_brick_sound;
  public ball_kill_brick_sound;
  public ball_hit_paddle_sound;

  public restartButton;
  public nextLevelButton;

  public level_Json;

  public level = 1;
  public numLevels;

  constructor() {
    super({ key: 'game' });
  }

  //PRELOAD: PHASER METHOD//////////////////////////////////////////////////////////////////////////////
  preload() {
    //load particles images
    this.load.image('spark0', 'assets/particles/blue.png');
    this.load.image('spark1', 'assets/particles/red.png');

    this.load.setPath('assets/imgs/');
    this.load.image('background', 'galaxy.png');
    //set path for all 
    this.load.setPath('assets/imgs/Breakout_TileSet_Free/PNG/');
    //blue block image
    this.load.image('blueBlock','01-Breakout-Tiles.png');
    //cracked blue block image
    this.load.image('crackedBlue','02-Breakout-Tiles.png');

    this.load.image('limeBlock', '03-Breakout-Tiles.png' );
    this.load.image('crackedLimeBlock', '04-Breakout-Tiles.png');
    this.load.image('purpleBlock', '05-Breakout-Tiles.png');
    this.load.image('crackedPurpleBlock', '06-Breakout-Tiles.png');
    this.load.image('orangeBlock', '07-Breakout-Tiles.png');
    this.load.image('crackedOrangeBlock', '08-Breakout-Tiles.png');
    this.load.image('lightOrangeBlock', '09-Breakout-Tiles.png');
    this.load.image('crackedLightOrangeBlock', '10-Breakout-Tiles.png');
    this.load.image('lightBlueBlock', '11-Breakout-Tiles.png');
    this.load.image('crackedLightBlueBlock', '12-Breakout-Tiles.png');
    this.load.image('yellowBlock', '13-Breakout-Tiles.png');
    this.load.image('crackedYellowBlock', '14-Breakout-Tiles.png');

    //ball image
    this.load.image('ball','58-Breakout-Tiles.png');
    //paddle image
    this.load.image('paddle','50-Breakout-Tiles.png');
    //audio
    this.load.setPath('assets/audio/');
    this.load.audio('ballCrackBrickSound', 
            'zapsplat_impact_rock_small_hit_solid_ground_004_11181.mp3');
    this.load.audio('ballKillBrickSound', 
            'zapsplat_impact_rock_small_hit_solid_ground_001_11178.mp3');
    this.load.audio('ballHitPaddleSound',
            'tom_chapman_impact_stone_on_frozen_lake_ice_thrown_skim_contact_microphone_002.mp3');
    //json path for levels
    this.load.setPath('assets/Levels/');
    this.load.json('lvlsJson', 'lvls.json'); 
  }

  //CREATE: PHASER METHOD///////////////////////////////////////////////////////////////////////////////
  create(){
    this.level_Json = this.cache.json.get('lvlsJson');
    this.numLevels = this.level_Json.length;
    this.add.image(0, 0, 'background').setOrigin(0);
    this.addBlocks();
    this.addPaddle();
    this.addBall();
    this.addColliders();
    this.addTextObjects();
    this.addInputCallBacks();
    this.addAudio();
    //placed far away so you can't see it
    this.emitter0 = this.add.particles('spark0').createEmitter({
      x: -4000,
      y: -3000,
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'SCREEN',
      //active: false,
      lifespan: 1000,
      gravityY: 500
  });
  //placed far away so you can't see it
  this.emitter1 = this.add.particles('spark1').createEmitter({
      x: -4000,
      y: -3000,
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      blendMode: 'SCREEN',
      //active: false,
      lifespan: 1000,
      gravityY: 500
  });

  //particle emitter to follow ball
  let ballParticle = this.add.particles('spark0');
  this.blueBallEmitter = ballParticle.createEmitter({
    speed:1,
    scale:{ start:0.5,end:0.1},
    blendMode: 'ADD'
  });
  this.blueBallEmitter.startFollow(this.ball);

  }

  //add call backs for the in-built pointer
  addInputCallBacks(){
    this.input.on('pointerdown',this.startDrag, this);
    this.input.once('pointerup', this.start, this);
  }

  //sets the boolean for game started to true
  start(pointer){
    this.started = true;
  }

  //call back method for the beginning of the dragging on screen
  startDrag(pointer, targets){
    this.input.off('pointerdown',this.startDrag, this);
    this.dragObj = targets[0];
    //console.log(this.dragObj);
    this.input.on('pointermove', this.doDrag, this);
    this.input.on('pointerup', this.stopDrag, this);
  }

  //call back method for while dragging touch on screen is happening
  doDrag(pointer){ 
    this.paddle.x = pointer.x;
  }

  //call back for pointer input when drag has stopped
  stopDrag(){
    this.input.on('pointerdown',this.startDrag, this);
    this.input.off('pointermove', this.doDrag, this);
    this.input.off('pointerup', this.stopDrag, this);
  }

  //call back for hovering with mouse over restartButton styling
  enterButtonHoverState() {
    this.restartButton.setStyle({ fill: '#ff0'});
  }

  //call back for entering button with mouse pointer styling
  enterButtonRestState() {
    this.restartButton.setStyle({ fill: '#0f0' });
  }

  //adds all the audio-files
  addAudio(){
    this.ball_crack_brick_sound = this.sound.add('ballCrackBrickSound');
    this.ball_kill_brick_sound = this.sound.add('ballKillBrickSound');
    this.ball_hit_paddle_sound = this.sound.add('ballHitPaddleSound');
  }

  //wrapper method for the Text objects of the game
  addTextObjects(){
    this.gameOverText =this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Game Over',
      {
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '50px',
        fill: '#fff'
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    this.livesText = this.add.text(this.physics.world.bounds.width - 200 ,50,
      "Lives: " + this.lives,
      {
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '30px',
        fill: '#fff'
      }
    );
    this.scoreText = this.add.text(20,50,"Score: " + this.score,
      {
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '30px',
        fill: '#fff'
      }
    );
    this.openingText = this.add.text(this.physics.world.bounds.width / 2,
      (this.physics.world.bounds.height / 2) + 200 ,
      'Tap To Start',
      {
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '50px',
        fill: '#fff'
      }
    );
    this.openingText.setOrigin(0.5);
    this.playerWonText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'You won!',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff'
    }
  );
    this.playerWonText.setOrigin(0.5);
    this.playerWonText.setVisible(false);

    this.restartButton = this.add.text(this.physics.world.bounds.width / 3,
        this.physics.world.bounds.height / 1.5,
        'RESTART', 
      {
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '50px',
        fill: '#fff' 
      }
      );
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown',() => {
      this.reBoot();
      });
    this.restartButton.on('pointerover',() => {
      this.enterButtonHoverState();
      });
    this.restartButton.on('pointerout',() => {
      this.enterButtonRestState();
      });
    this.restartButton.setVisible(false);

    this.nextLevelButton = this.add.text(this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'TOUCH HERE TO START\nLEVEL ', 
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff' 
    }
    );
    this.nextLevelButton.setInteractive();
    this.nextLevelButton.on('pointerdown',() => {
      this.goToNextLevel();
      });
    this.nextLevelButton.setOrigin(0.5);
    this.nextLevelButton.setVisible(false);
  }

  //wrapper method for adding the collider call backs on the other elements of the game
  //solid and cracked blocks have same for all coloured blocks
  addColliders(){
    this.physics.world.checkCollision.down = false;
    this.physics.add.collider(this.balls, this.blueBlocks, this.hitSolidBlueBlock, null, this);
    this.physics.add.collider(this.balls, this.crackedBlocks, this.hitCrackedBlueBlock, null, this);
    this.physics.add.collider(this.balls,this.limeBlocks, this.hitSolidBlueBlock, null,this);
    this.physics.add.collider(this.balls, this.crackedLimeBlocks, this.hitCrackedBlueBlock, null, this);
    this.physics.add.collider(this.balls,this.purpleBlocks,this.hitSolidBlueBlock,null,this);
    this.physics.add.collider(this.balls,this.crackedPurpleBlocks,this.hitCrackedBlueBlock,null,this);
    this.physics.add.collider(this.paddle, this.balls, this.hitPlayer, null, this);
  }

  //wrapper method for creating the ball
  addBall(){
    this.balls = this.physics.add.group();
    this.ball = this.balls.create(START_X, BALL_START_Y,'ball').setScale(0.25).refreshBody();
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);
  }

  //wrapper method for creating the player/paddle
  addPaddle(){
    this.paddle = this.physics.add.sprite(START_X, PAD_START_Y, 'paddle').setScale((SCALED-0.05) * 2/1.75).refreshBody();
    this.paddle.setImmovable(true);
    this.paddle.body.setMass(600);
    this.paddle.setCollideWorldBounds(true);
    this.paddle.setInteractive();
  }

  //wrapper method for creating blocks for the lvl
  addBlocks(){
    this.blueBlocks = this.physics.add.staticGroup();
    this.crackedBlocks = this.physics.add.staticGroup();

    this.limeBlocks = this.physics.add.staticGroup();
    this.crackedLimeBlocks = this.physics.add.staticGroup();
    this.purpleBlocks = this.physics.add.staticGroup();
    this.crackedPurpleBlocks = this.physics.add.staticGroup();
    this.orangeBlocks = this.physics.add.staticGroup();
    this.crackedOrangeBlocks = this.physics.add.staticGroup();
    this.lightOrangeBlocks = this.physics.add.staticGroup();
    this.crackedLightOrangeBlocks = this.physics.add.staticGroup();
    this.ligthBlueBlocks = this.physics.add.staticGroup();
    this.crackedLightBlueBlocks = this.physics.add.staticGroup();
    this.yellowBlocks = this.physics.add.staticGroup();
    this.crackedYellowBlocks = this.physics.add.staticGroup();
    
    this.shrinkBlocks = this.physics.add.staticGroup();
    this.expandedBlocks = this.physics.add.staticGroup();
    this.gunBlocks = this.physics.add.staticGroup();
    this. multiBlocks = this.physics.add.staticGroup();
    this.loadLevel(this.level);
  }

  //Adds the blocks from the Json objects based upon the lvl number
  loadLevel(lvl){
    
    this.blueBlocks.clear(true,true);
    this.crackedBlocks.clear(true,true);

    this.limeBlocks.clear(true,true);
    this.crackedLimeBlocks.clear(true,true);
    this.purpleBlocks.clear(true,true),
    this.crackedPurpleBlocks.clear(true,true);
    this.orangeBlocks.clear(true,true);
    this.crackedOrangeBlocks.clear(true,true);
    this.lightOrangeBlocks.clear(true,true);
    this.crackedLightOrangeBlocks.clear(true,true);
    this.ligthBlueBlocks.clear(true,true);
    this.crackedLightBlueBlocks.clear(true,true);
    this.yellowBlocks.clear(true,true);
    this.crackedYellowBlocks.clear(true,true);

    this.shrinkBlocks.clear(true,true);
    this.multiBlocks.clear(true,true);
    this.gunBlocks.clear(true,true);
    this.expandedBlocks.clear(true,true);
    

    //load the cracked blocks for the level
    let blueCrackedList = this.level_Json[lvl-1]['crackedBlocks'];
    for(let i = 0 ; i < blueCrackedList.length ; i++){
      let x = parseInt(blueCrackedList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(blueCrackedList[i].split(',')[1]);
      this.crackedBlocks.create(x,y,'crackedBlue').setScale(SCALED).refreshBody();
    }
    //load blue blocks for the level
    let blueList = this.level_Json[lvl-1]['blueBlocks'];
    for(let i = 0 ; i < blueList.length ; i++){
      let x = parseInt(blueList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(blueList[i].split(',')[1]);
      this.blueBlocks.create(x,y,'blueBlock').setScale(SCALED).refreshBody();
    }

    //load crackedLimeBlocks
    let crackedLimeList = this.level_Json[lvl-1]['limeBlocks'];
    for(let i = 0 ; i < crackedLimeList.length ; i++){
      let x = parseInt(crackedLimeList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(crackedLimeList[i].split(',')[1]);
      this.crackedLimeBlocks.create(x,y,'crackedLimeBlock').setScale(SCALED).refreshBody();
    }

    //load lime blocks for the level
    let limeList = this.level_Json[lvl-1]['limeBlocks'];
    for(let i = 0 ; i < limeList.length ; i++){
      let x = parseInt(limeList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(limeList[i].split(',')[1]);
      this.limeBlocks.create(x,y,'limeBlock').setScale(SCALED).refreshBody();
    }

    //load crackedLimeBlocks
    let crackedPurpleList = this.level_Json[lvl-1]['crackedPurpleBlocks'];
    for(let i = 0 ; i < crackedPurpleList.length ; i++){
      let x = parseInt(crackedPurpleList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(crackedPurpleList[i].split(',')[1]);
      this.crackedPurpleBlocks.create(x,y,'crackedPurpleBlock').setScale(SCALED).refreshBody();
    }

    //load lime blocks for the level
    let purpleList = this.level_Json[lvl-1]['purpleBlocks'];
    for(let i = 0 ; i < purpleList.length ; i++){
      let x = parseInt(purpleList[i].split(',')[0]) + BLOCK_X_CORRECTION;
      let y = parseInt(purpleList[i].split(',')[1]);
      this.purpleBlocks.create(x,y,'purpleBlock').setScale(SCALED).refreshBody();
    }
  }

  //call back method for collider of ball on paddle
  hitPlayer(){
    this.ball_hit_paddle_sound.play();
    // Increase the velocity of the ball after it bounces
    this.ball.setVelocityY(this.ball.body.velocity.y - 5);
    let newXVelocity = Math.abs(this.ball.body.velocity.x) + 5;
    // If the ball is to the left of the player, ensure the X-velocity is negative
    if (this.ball.x < this.paddle.x) {
      this.ball.setVelocityX(-newXVelocity);
    } else {
      this.ball.setVelocityX(newXVelocity);
    }
  }

  //call back method for collider of ball on blue block
  hitCrackedBlueBlock(ball, block){
    this.emitter0.setPosition(block.x, block.y);
    this.emitter1.setPosition(block.x, block.y);
    this.emitter0.explode();
    this.emitter1.explode();
    this.ball_kill_brick_sound.play();
    block.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    if (ball.body.velocity.x === 0) {
      let randNum = Math.random();
      if (randNum >= 0.5) {
        ball.body.setVelocityX(150);
      } else {
        ball.body.setVelocityX(-150);
      }
    }
  }

  //call back method for hitting a solid blue block
  hitSolidBlueBlock(ball, block){
    this.ball_crack_brick_sound.play();
    block.disableBody(true, true);
    this.emitter0.setPosition(block.x, block.y);
    this.emitter1.setPosition(block.x, block.y);
    this.emitter0.explode();
    this.emitter1.explode();
    this.score += 5;
    this.scoreText.setText('Score: ' + this.score);
    if (ball.body.velocity.x === 0) {
      let randNum = Math.random();
      if (randNum >= 0.5) {
        ball.body.setVelocityX(150);
      } else {
        ball.body.setVelocityX(-150);
      }
    }
  }

  //returns true iff the ball has left the world
  ballIsLost(world){
    return this.ball.y > world.bounds.height;
  }

  //returns true iff lives === 0  and the ball has left the world
  isGameOver(world){
    return this.ball.y > world.bounds.height &&
    this.lives < 0;
  }

  //returns true iff all blocks in all lists are equal to zero
  isWon(){
    return this.blueBlocks.countActive() === 0 &&
           this.crackedBlocks.countActive() === 0 &&
           this.limeBlocks.countActive() === 0 &&
           this.crackedLimeBlocks.countActive() === 0 &&
           this.crackedPurpleBlocks.countActive() === 0 &&
           this.expandedBlocks.countActive() === 0 &&
           this.shrinkBlocks.countActive() === 0 &&
           this.gunBlocks.countActive() === 0 &&
           this.multiBlocks.countActive() === 0 &&
           this.level === this.numLevels;
  }

  levelWon(){
    return this.blueBlocks.countActive() === 0 &&
    this.crackedBlocks.countActive() === 0 &&
    this.limeBlocks.countActive() === 0 &&
    this.purpleBlocks.countActive() === 0 &&
    this.crackedPurpleBlocks.countActive() === 0 &&
    this.crackedLimeBlocks.countActive() === 0 &&
    this.expandedBlocks.countActive() === 0 &&
    this.shrinkBlocks.countActive() === 0 &&
    this.gunBlocks.countActive() === 0 &&
    this.multiBlocks.countActive() === 0;
  }

  //UPDATE: PHASER METHOD////////////////////////////////////////////////////////////////////////////////
  update() {
    if (this.ballIsLost(this.physics.world)) {
      this.lives -= 1;
      this.gameStarted = false;
      if (this.isGameOver(this.physics.world)) {
        this.physics.pause;
        this.gameOverText.setVisible(true);
        this.ball.disableBody(true, true);
        this.restartButton.setVisible(true);
      }
      else {
        this.livesText.setText('Lives: ' + this.lives);
        this.gameStarted = false;
        this.openingText.setVisible(true);
        this.paddle.setPosition(START_X,PAD_START_Y);
        this.ball.setPosition(START_X,BALL_START_Y);
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);
      }
    }
    else if (this.isWon() && this.levelWon()) {
      this.physics.pause();
      this.playerWonText.setVisible(true);
      this.ball.disableBody(true, true);
      this.paddle.disableBody(true,true);
      this.restartButton.setVisible(true);
      }
    else if (this.levelWon() && !this.isWon()){
      this.physics.pause();
      this.paddle.setX(START_X)
      this.ball.setPosition(START_X, BALL_START_Y);
      this.ball.setVelocity(0,0);
      this.nextLevelButton.setText('TAP HERE TO START\n\nLEVEL '+(this.level+1));
      this.nextLevelButton.setAlign('center');
      this.nextLevelButton.setVisible(true);
      
    }
    else {
      if (!this.gameStarted) {
        this.paddle.setX(START_X);
        this.ball.setX(START_X);
      if (this.game.input.activePointer.active && this.started) {
          this.gameStarted = true;
          this.ball.setVelocityY(-600);
          this.ball.setVelocityX((Math.random()*500) + 300);
          this.openingText.setVisible(false);
        }
      }
    }
  }

  //method to move to the next level
  goToNextLevel(){
    this.started = false;
    this.gameStarted = false;
    this.level += 1;
    this.scene.restart();
  }

  //Method for rebooting the game after totally losing
  reBoot(){
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.started = false;
    this.gameStarted = false;
    this.scene.restart();
  }
}
