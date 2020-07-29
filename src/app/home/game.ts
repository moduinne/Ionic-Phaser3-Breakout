import * as Phaser from 'phaser';
const DPR = 2;
const SCALED = 0.15;
const BLOCK_W = 110;
const BLOCK_H = 100
const BLOCK_NUM = 5;
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

  constructor() {
    super({ key: 'game' });
  }

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

  }

  create(){
    //add bricks to the game
    this.blocks = this.physics.add.staticGroup();
    this.crackedBlocks = this.physics.add.staticGroup();

    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create((window.innerWidth/4)+(i*BLOCK_W) ,window.innerHeight/5, 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }

    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create((window.innerWidth/4)+(i*BLOCK_W) ,window.innerHeight/5, 'blueBlock').setScale(SCALED* 1.75).refreshBody();
    }

    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create((window.innerWidth/4)+(i*BLOCK_W) ,(window.innerHeight/5) + BLOCK_H, 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }
    
    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create((window.innerWidth/4)+(i*BLOCK_W) ,(window.innerHeight/5) + BLOCK_H, 'blueBlock').setScale(SCALED* 1.75).refreshBody();
    }

    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.crackedBlocks.create((window.innerWidth/4)+(i*BLOCK_W) ,(window.innerHeight/5) + (BLOCK_H*2), 'crackedBlue').setScale(SCALED* 1.75).refreshBody();
    }


    for(let i = 0 ; i < BLOCK_NUM ; i++){
      this.blocks.create((window.innerWidth/4)+(i*BLOCK_W) ,(window.innerHeight/5) + (BLOCK_H*2), 'blueBlock').setScale(SCALED* 1.75).refreshBody();
    }
    
    //add the paddle to the game
    this.paddle = this.physics.add.sprite(START_X, PAD_START_Y, 'paddle').setScale(SCALED * 2).refreshBody();
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);
    this.paddle.setX(this.game.input.activePointer.x);
    this.paddle.setInteractive();

    //add the ball to the game
    this.balls = this.physics.add.group();
    this.ball = this.balls.create(START_X, BALL_START_Y,'ball').setScale(1.5).refreshBody();
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);
    this.physics.world.checkCollision.down = false;
    this.physics.add.collider(this.balls, this.blocks, this.hitBlock, null, this);
    this.physics.add.collider(this.balls, this.crackedBlocks, this.hitBlock, null, this);
    this.physics.add.collider(this.paddle, this.balls, this.hitPlayer, null, this);

    //add all text objects
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
  
    //opening text
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

    // Create the game won text
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

    //and the input call back for the paddle
    this.input.on('pointerdown',this.startDrag, this);
    //hacky way to get the game to start
    this.input.once('pointerup', this.start, this);
  }

  start(pointer){
    this.started = true;
  }

  startDrag(pointer, targets){
    this.input.off('pointerdown',this.startDrag, this);
    this.dragObj = targets[0];
    this.input.on('pointermove', this.doDrag, this);
    this.input.on('pointerup', this.stopDrag, this);
  }

  doDrag(pointer){ 
    this.dragObj.x = pointer.x;
  }

  stopDrag(){
    this.input.on('pointerdown',this.startDrag, this);
    this.input.off('pointermove', this.doDrag, this);
    this.input.off('pointerup', this.stopDrag, this);
  }

  hitPlayer(){
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

  hitBlock(ball, block){
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

  ballIsLost(world){
    return this.ball.y > world.bounds.height;
  }

  isGameOver(world){
    return this.ball.y > world.bounds.height &&
    this.lives < 0;

  }

  isWon(){
    return this.blocks.countActive() === 0 &&
           this.crackedBlocks.countActive() ===0;
  }

  update() {
    if (this.ballIsLost(this.physics.world)){
      this.lives -= 1;
      this.gameStarted = false;
      
      if(this.isGameOver(this.physics.world)){
        this.gameOverText.setVisible(true);
        this.ball.disableBody(true, true);
      }
      else{
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
      }
    else {
      if (!this.gameStarted) {
        this.paddle.setX(START_X);
        this.ball.setX(START_X);
      if (this.game.input.activePointer.active && this.started){
          this.gameStarted = true;
          this.ball.setVelocityY(-600);
          this.ball.setVelocityX((Math.random()*500) + 300);
          this.openingText.setVisible(false);
        }
      }
    }
  }
}
