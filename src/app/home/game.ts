import * as Phaser from 'phaser';

//GLOBAL CONSTANTS
const SCALED = 0.20;
const BLOCK_W = 150;
const BLOCK_H = 100;
const BLOCK_NUM = 3;
const BLOCK_START_X = (window.innerWidth/2) + 25;//<----------this number is where you finished
const START_X = (window.innerWidth/2) + 150;
const PAD_START_Y = window.innerHeight +400;
const BALL_START_Y = window.innerHeight + 300;

export class GameScene extends Phaser.Scene {

  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private crackedBlocks: Phaser.Physics.Arcade.StaticGroup;
  private paddle: Phaser.Physics.Arcade.Sprite;
  private balls: Phaser.Physics.Arcade.Group;
  private ball: Phaser.Physics.Arcade.Image;
  public gameStarted:Boolean = false;
  public lives:number = 3;
  public gameOverText;
  public openingText;
  public livesText;
  public scoreText;
  public playerWonText;
  public score = 0;
  public dragObj;
  public started = false;

  public ball_crack_brick_sound;
  public ball_kill_brick_sound;
  public ball_hit_paddle_sound;

  public restartButton;

  constructor() {
    super({ key: 'game' });
  }

  //PRELOAD: PHASER METHOD//////////////////////////////////////////////////////////////////////////////
  preload() {
    //set path for all 
    this.load.setPath('assets/imgs/Breakout_TileSet_Free/PNG/');
    //blue block image
    this.load.image('blueBlock','01-Breakout-Tiles.png');
    //cracked blue block image
    this.load.image('crackedBlue','02-Breakout-Tiles.png');
    //ball image
    this.load.image('ball','bomb.png');
    //paddle image
    this.load.image('paddle','49-Breakout-Tiles.png');
    //audio
    this.load.setPath('assets/audio/');
    this.load.audio('ballCrackBrickSound', 'zapsplat_impact_rock_small_hit_solid_ground_004_11181.mp3');
    this.load.audio('ballKillBrickSound', 'zapsplat_impact_rock_small_hit_solid_ground_001_11178.mp3');
    this.load.audio('ballHitPaddleSound','tom_chapman_impact_stone_on_frozen_lake_ice_thrown_skim_contact_microphone_002.mp3');
  }

  //CREATE: PHASER METHOD///////////////////////////////////////////////////////////////////////////////
  create(){
    this.addBlocks();
    this.addPaddle();
    this.addBall();
    this.addColliders();
    this.addTextObjects();
    this.addInputCallBacks();
    this.addAudio();
  }

  //add call backs for the inbuilt pointer
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
    this.input.on('pointermove', this.doDrag, this);
    this.input.on('pointerup', this.stopDrag, this);
  }

  //call back method for while dragging touch on screen is happening
  doDrag(pointer){ 
    this.dragObj.x = pointer.x;
  }

  //call back for pointer input when drag has stopped
  stopDrag(){
    this.input.on('pointerdown',this.startDrag, this);
    this.input.off('pointermove', this.doDrag, this);
    this.input.off('pointerup', this.stopDrag, this);
  }

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
      this.physics.world.bounds.height / 2,
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

    // this.restartButton = this.add.text(this.physics.world.bounds.width / 2,
    //   this.physics.world.bounds.height / 2,
    //   'Play Again',
    //   {
    //     fontFamily: 'Monaco, Courier, monospace',
    //     fontSize: '50px',
    //     fill: '#fff'
    //   }
    // );
    // this.restartButton.setInteractive(true);
    // this.restartButton.setVisible(false);
  }

  //wrapper method for adding the collider call backs on the other elements of the game
  addColliders(){
    this.physics.world.checkCollision.down = false;
    this.physics.add.collider(this.balls, this.blocks, this.hitSolidBlueBlock, null, this);
    this.physics.add.collider(this.balls, this.crackedBlocks, this.hitCrackedBlueBlock, null, this);
    this.physics.add.collider(this.paddle, this.balls, this.hitPlayer, null, this);
  }

  //wrapper method for creating the ball
  addBall(){
    this.balls = this.physics.add.group();
    this.ball = this.balls.create(START_X, BALL_START_Y,'ball').setScale(1.5).refreshBody();
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);
  }

  //wrapper method for creating the player/paddle
  addPaddle(){
    this.paddle = this.physics.add.sprite(START_X, PAD_START_Y, 'paddle').setScale((SCALED-0.05) * 2).refreshBody();
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);
    this.paddle.setX(this.game.input.activePointer.x);
    this.paddle.setInteractive();
  }

  //wrapper method for creating blocks for the lvl
  addBlocks(){
    this.blocks = this.physics.add.staticGroup();
    this.crackedBlocks = this.physics.add.staticGroup();
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create(BLOCK_START_X+(i*BLOCK_W) ,window.innerHeight/4, 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create(BLOCK_START_X+(i*BLOCK_W) ,window.innerHeight/4, 'blueBlock').setScale(SCALED* 1.75).refreshBody();
    }
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create(BLOCK_START_X+(i*BLOCK_W) ,(window.innerHeight/4) + BLOCK_H, 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create(BLOCK_START_X+(i*BLOCK_W) ,(window.innerHeight/4) + BLOCK_H, 'blueBlock').setScale(SCALED* 1.75).refreshBody();
    }
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create(BLOCK_START_X+(i*BLOCK_W) ,(window.innerHeight/4) + (BLOCK_H*2), 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create(BLOCK_START_X+(i*BLOCK_W) ,(window.innerHeight/4) + (BLOCK_H*2), 'blueBlock').setScale(SCALED* 1.75).refreshBody();
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
    return this.blocks.countActive() === 0 &&
           this.crackedBlocks.countActive() ===0;
  }

  //UPDATE: PHASER METHOD////////////////////////////////////////////////////////////////////////////////
  update() {
    if (this.ballIsLost(this.physics.world)) {
      this.lives -= 1;
      this.gameStarted = false;
      if (this.isGameOver(this.physics.world)) {
        this.gameOverText.setVisible(true);
        this.ball.disableBody(true, true);
        this.physics.pause;
        this.reBoot();
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
    else if (this.isWon()) {
      this.playerWonText.setVisible(true);
      this.ball.disableBody(true, true);
      this.paddle.disableBody(true,true);
      this.physics.pause;
      this.reBoot();
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

  //Method for rebooting the game after winning or losing
  reBoot(){
    this.lives = 3;
    this.started = false;
    this.gameStarted = false;
    this.scene.restart();
  }
}
