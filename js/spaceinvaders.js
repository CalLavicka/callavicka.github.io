"use strict";

var goingDown = false;
var _goingDown = false;
var dir = 1;

var enemyTime = 0;

var curbeep = 0;
var beepTime = 0;

var curEnemy = 0;

var extralife = false;

$(document).ready(function() {
  $('#play-again').click(function() {
    resetsi();
  });
})

// Game state
var player = {
  pos: [0, 0],
  sprite: new Sprite(img, [156, 0], [26, 16])
};

// Speed in pixels per second
var playerSpeed = 300;
var bulletSpeed = 1000;
var enemyBulletSpeed = 250;
var enemySpeed = 10;
var enemySpeed_down = 30;

var enemyHeight = 0;

var playerDead = false;

var barricades = [];
var bullets = [];
var enemies = [];
var enemyBullets = [];
var explosions = [];

var lives = 0;

// Populate a level;
function resetLevel() {
  playerDead = false;
  
  enemyTime = 0;
  beepTime = 0;

  enemies = [];
  bullets = [];
  enemyBullets = [];

  dir = 1;
  goingDown = false;
  curEnemy = 0;

  var sprites = [
    new Sprite(img, [0, 0], [16, 16], 1, [0, 1]),
    new Sprite(img, [44, 0], [22, 16], 1, [0, 1]),
    new Sprite(img, [44, 0], [22, 16], 1, [0, 1]),
    new Sprite(img, [96, 0], [24, 16], 1, [0, 1]),
    new Sprite(img, [96, 0], [24, 16], 1, [0, 1]),
  ];
  
  var pts = [
    30, 20, 20, 10, 10
  ];

  // Populate enemies
  for(var j = 4; j >= 0; j--) {
    for(var i = 10; i >= 0; i--) {
      enemies.push({
        pos: [i*40, enemyHeight + j*40],
        sprite: $.extend({}, sprites[j]),
        pts: pts[j]
      });
    }
  }
}

// Reset game
function resetsi() {
  
  $('#game-over').css('visibility', 'hidden');
  $('#game-over-overlay').css('visibility', 'hidden');
  $('#space-start').get(0).blur();
  canvas.focus();
  
  //document.getElementById('game-over').style.display = 'none';
  //document.getElementById('game-over-overlay').style.display = 'none';
  gameover = false;
  gameTime = 0;
  score = 0;
  enemyHeight = 30;
  lives = 2;
  extralife = false;

  player.pos = [0, height - 50];

  resetLevel();
}

function handleInput(dt) {
  if(!playerDead) {
    if(input.isDown('LEFT') || input.isDown('a')) {
      player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
      player.pos[0] += playerSpeed * dt;
    }
  }
}

$(document).on('keyup', function(e) {
  if(e.keyCode == 32 && gameplaying && game === 0 && bullets.length === 0 && explosions.length === 0) {
    var x = player.pos[0] + player.sprite.getSize()[0] / 2 - 3;
    var y = player.pos[1];

    bullets.push({ pos: [x, y], dir: 'up', sprite: new Sprite(img, [48, 23], [2, 12]) });
    
    // Make sound
    shootsound.play();

    lastFire = Date.now();
  }
  //console.log(e);
});

function updateEntities(dt) {
  // Update the player sprite animation
  player.sprite.update(dt);
  
  if(playerDead) {
    if(explosions.length === 0) {
      
      lives--;
      if(lives < 0) {
        gameOver();
      }else {
        player.pos[0] = 0;
        playerDead = false;
      }
    }
  }
  
  var beepTarget = Math.max(enemies.length / 45.0, 0.08);
  beepTime += dt;
  if(beepTime > beepTarget) {
    // Make sound
    beeps[curbeep].play();
    curbeep = (curbeep + 1) % 4;
    beepTime -= beepTarget;
  }
  
  // Update all the enemies
  if(explosions.length === 0 && enemies.length > 0) {
    enemyTime += dt;
    var target = 0.02;
    while(enemyTime > target) {

      //console.log(enemies[0].sprite._index.toString());

      // Update temporary storage
      if(curEnemy === 0) {
        _goingDown = goingDown;
        goingDown = false;
      }

      enemyTime -= target;
      if(_goingDown) {
        enemies[curEnemy].pos[1] += enemySpeed_down;
      }else {
        enemies[curEnemy].pos[0] += dir*enemySpeed;
        if(enemies[curEnemy].pos[0] - enemySpeed < 0 || enemies[curEnemy].pos[0] + enemySpeed > width - enemies[curEnemy].sprite.getSize()[0]) {
          goingDown = true;
        }
      }

      enemies[curEnemy].sprite.update(1);
      //console.log(i);

      // Remove if offscreen
      if(enemies[curEnemy].pos[1] > height) {
        gameOver();
      }
      
      curEnemy = (curEnemy + 1) % enemies.length;

      if(curEnemy === 0 && goingDown) {
        dir = -dir;
      }
    }
    
    // Update all the bullets
    for(var i=0; i<bullets.length; i++) {
      var bullet = bullets[i];

      bullet.pos[1] -= bulletSpeed * dt;

      // Remove the bullet if it goes offscreen
      if(bullet.pos[1] < -bullet.sprite.getSize()[1] || bullet.pos[1] > height ||
         bullet.pos[0] > width) {
        bullets.splice(i, 1);
        i--;
      }
    }

    // Update enemy bullets
    for(var i=0; i<enemyBullets.length; i++) {
      var bullet = enemyBullets[i];

      bullet.pos[1] += enemyBulletSpeed * dt;

      // Remove the bullet if it goes offscreen
      if(bullet.pos[1] < -bullet.sprite.getSize()[1] || bullet.pos[1] > height ||
         bullet.pos[0] > width) {
        enemyBullets.splice(i, 1);
        i--;
      }
    }

    // Give a chance to fire
    if(enemies.length > 0) {
      for(var i=enemyBullets.length; i<3; i++) {
        if(Math.random() > 0.4) {
          var e = Math.floor(Math.random() * enemies.length);
          var x = enemies[e].pos[0] + enemies[e].sprite.getSize()[0] / 2 - 3;
          var y = enemies[e].pos[1] + enemies[e].sprite.getSize()[1] - 12;
          enemyBullets.push({ pos: [x, y], dir: 'up', sprite: new Sprite(img, [46, 23], [6, 12]) });
        }
      }
    }
  }
  
  if(enemies.length === 0) {
    enemyHeight += enemySpeed_down;
    resetLevel();
  }

  // Update all the explosions
  for(var i=0; i<explosions.length; i++) {
    explosions[i].sprite.update(dt);

    // Remove if animation is done
    if(explosions[i].sprite.done) {
      explosions.splice(i, 1);
      i--;
    }
  }
}

// Keep player in bounds
function checkPlayerBounds() {
  // Check bounds
  if(player.pos[0] < 0) {
    player.pos[0] = 0;
  }
  else if(player.pos[0] > width - player.sprite.getSize()[0]) {
    player.pos[0] = width - player.sprite.getSize()[0];
  }

  if(player.pos[1] < 0) {
    player.pos[1] = 0;
  }
  else if(player.pos[1] > height - player.sprite.getSize()[1]) {
    player.pos[1] = height - player.sprite.getSize()[1];
  }
}

function checkCollisions() {
  checkPlayerBounds();

  // Run collision detection for all enemies and bullets
  for(var i=0; i<enemies.length; i++) {
    var pos = enemies[i].pos;
    var size = enemies[i].sprite.getSize();

    for(var j=0; j<bullets.length; j++) {
      var pos2 = bullets[j].pos;
      var size2 = bullets[j].sprite.getSize();

      if(boxCollides(pos, size, pos2, size2)) {

        // Add score
        score += enemies[i].pts;
        
        // Remove the enemy
        if(i < curEnemy) curEnemy--;
        if(curEnemy == enemies.length - 1) {
          curEnemy = 0;
        }
        enemies.splice(i, 1);
        i--;

        // Add an explosion
        explosions.push({
          pos: pos,
          sprite: new Sprite(img, [69, 22], [27, 16], 5, [0], null, true)
        });

        // Make sound
        killsound.play();

        // Remove the bullet and stop this iteration
        bullets.splice(j, 1);
        break;
      }
    }

    if(boxCollides(pos, size, player.pos, player.sprite.getSize())) {
      gameOver();
    }

    // Check enemy bullets
    for(var j=0; j<enemyBullets.length; j++) {
      var pos2 = enemyBullets[j].pos;
      var size2 = enemyBullets[j].sprite.getSize();

      if(boxCollides(player.pos, player.sprite.getSize(), pos2, size2)) {
        playerDead = true;
        
        // Add an explosion
        explosions.push({
          pos: player.pos,
          sprite: new Sprite(img, [0, 21], [30, 16], 1, [0, 10], null, true)
        });

        explosionsound.play();

        // Remove the bullet and stop this iteration
        enemyBullets.splice(j, 1);
        break;
      }
    }
  }
}

// Draw everything
function rendersi() {
  context.fillStyle = terrainPattern;
  context.fillRect(0, 0, width, height);

  // Render the player if the game isn't over
  if(!gameover) {
    if(!playerDead) renderEntity(player);
    // Draw lives
    for(var i=0; i < lives; i++) {
      context.save();
      context.translate(20 + i*(player.sprite.getSize()[0] + 10), height - player.sprite.getSize()[1]);
      player.sprite.render(context);
      context.restore();
    }
  }

  renderEntities(bullets);
  renderEntities(enemies);
  renderEntities(explosions);
  renderEntities(enemyBullets);
};

function renderEntities(list) {
  for(var i=0; i<list.length; i++) {
    renderEntity(list[i]);
  }    
}

function renderEntity(entity) {
  context.save();
  context.translate(entity.pos[0], entity.pos[1]);
  entity.sprite.render(context);
  context.restore();
}

// Game over
function gameOver() {
  if(!gameover) {
    $('#game-over').css('visibility', 'visible');
    $('#game-over-overlay').css('visibility', 'visible');
    gameover = true;
  }
}

// Update Function
function updatesi(dt) {
  gameTime += dt;
  
  $('#lives').text(lives);

  handleInput(dt);
  updateEntities(dt);
  
  if(!extralife && score >= 1500) {
    lives++;
    extralife = true;
  }

  checkCollisions();
}