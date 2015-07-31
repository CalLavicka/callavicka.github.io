"use strict";

var running = false;
var gameplaying = false;

var loading = 0;
var toload = 11;

var game = 0;

var loadcallback = function() {
  loading--;
  var value = (toload - loading) / toload * 100
  $("#loading-bar").attr("aria-valuenow", (toload - loading) / toload * 100);
  $('#loading-bar').css("width", value.toString() + '%');
  $('#loading-bar').text(value.toString(10) + '%');
  console.log('loading: ' + loading);
  if(loading === 0) {
    galagactx.drawImage(bimg, 0, 0, window.innerWidth, window.innerHeight);
    $('.progress').css('visibility', 'hidden');
    $('.background-stuff').css('visibility', 'visible');
  }
};

$(document).ready(function() {
  $('#main-canvas').attr('width', window.innerWidth);
  $('#main-canvas').attr('height', window.innerHeight);
});

// Helper Function for Timing
var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
    window.setTimeout(callback, 1000 / 60);
  };
})();

// Helper functions for collisions
function collides(x, y, r, b, x2, y2, r2, b2) {
  return !(r <= x2 || x > r2 ||
           b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
  return collides(pos[0], pos[1],
                  pos[0] + size[0], pos[1] + size[1],
                  pos2[0], pos2[1],
                  pos2[0] + size2[0], pos2[1] + size2[1]);
}

// Canvas
var canvas, context, width, height;

$(document).ready(function() {
  canvas = $('#space-canvas').get(0);
  context = $('#space-canvas').get(0).getContext('2d');
  context.imageSmoothingEnabled = false;
  width = parseInt($('#space-canvas').css('width'));
  height = parseInt($('#space-canvas').css('height'));
  console.log(width);
  console.log(height);
});

var bimg = new Image();
bimg.onload = loadcallback;
bimg.src = "/img/background.jpg";
loading++;


var galagaFrames = [[16, 104],
                    [41, 104],
                    [65, 104],
                    [89, 104],
                    [113, 104],
                    [137, 104],
                    [161, 103]];

var tractorFrames = [[209, 103], [265, 103], [321, 103]];

var loop = new SeamlessLoop();
loop.addUri("../mus/galagacapture.wav", 276, "tractor_beam1");
loop.addUri("../mus/galagacapture2.wav", 271, "tractor_beam2");
loop.callback(loadcallback);
loading++;

var galagaImg = new Image();
galagaImg.onload = loadcallback;
galagaImg.src = "final-project/img/galagasprites.png"
loading++;

var downsound = new Audio();
downsound.addEventListener('loadeddata', loadcallback);
downsound.src = "./../mus/galagaflying.mp3";
loading++;

var beeps = [];
for(var i=0; i<4; i++) {
  beeps.push(new Audio());
  beeps[i].addEventListener('loadeddata', loadcallback);
  beeps[i].src = "./../mus/fastinvader" + (i + 1).toString() + ".wav";
  loading++;
}

var shootsound = new Audio();
shootsound.addEventListener('loadeddata', loadcallback);
shootsound.src = "../mus/invaderkilled.wav";
loading++;

var killsound = new Audio();
killsound.addEventListener('loadeddata', loadcallback);
killsound.src = "../mus/shoot.wav";
loading++;

var explosionsound = new Audio();
explosionsound.addEventListener('loadeddata', loadcallback);
explosionsound.src = "../mus/explosion.wav";
loading++;


// Sprite Sheet
var img = new Image();
img.onload = loadcallback;
img.src = "../img/spacesprites.png";
loading++;

function removeObjs() {
  $('.progress').css('visibility', 'hidden');
  $(".startbutton").toggle( "slide", { direction: "right" });
  $('.background-stuff').css('visibility', 'hidden');
}

$(document).ready(function() {
  
  galagactx = $('#main-canvas').get(0).getContext('2d');
  galagactx.imageSmoothingEnabled = false;
  galaga = new BigSprite(galagaImg, [16, 16], galagaFrames, 10);
  tractorBeam = new BigSprite(galagaImg, [46, 5], tractorFrames, 10);
  
  $('#space-start').click(function() {
    if(!gameplaying && loading === 0) {
      removeObjs();
      gameplaying = true;
      game = 0;
      galagactx = $('#main-canvas').get(0).getContext('2d');
      galagactx.imageSmoothingEnabled = false;
      galaga = new BigSprite(galagaImg, [16, 16], galagaFrames, 10);
      tractorBeam = new BigSprite(galagaImg, [46, 5], tractorFrames, 10);
      downsound.play();
      grabGame();
    }else {
      console.log('not loaded');
    }
  });
  
  $('#galaga-start').click(function() {
    if(!gameplaying && loading === 0) {
      removeObjs();
      gameplaying = true;
      game = 1;
      downsound.play();
      grabGame();
    }else {
      console.log('not loaded');
    }
  });
});

var lastFire = Date.now();
var gameTime = 0;
var gameover;
var terrainPattern;



// The score
var score = 0;

/*
  var tractorsound = new Audio();
  tractorsound.src = "../mus/tractor_beam1.wav";
  tractorsound.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
    console.log('looping');
  }, false);*/

var galagactx;
var galaga;
var tractorBeam;

var gpos = [window.innerWidth, -100];

var attached = false;

var step = -60;

var sx = 1;
var sy = 1;

var tractor = 0;

// Grab game;
function grabGame() {
  galagactx.drawImage(bimg, 0, 0, window.innerWidth, window.innerHeight);

  if(step < -40) {
    galaga.setFrame(0);
    gpos[0] -= 5;
  }else if(step < -30) {
    galaga.setFrame(1);
    gpos[0] -= 5;
    gpos[1] += 1;
    sy = -1;
  }else if(step < -20) {
    galaga.setFrame(2);
    gpos[0] -= 4;
    gpos[1] += 3;
    sy = -1;
  }else if(step < 30) {
    galaga.setFrame(3);
    gpos[0] -= 3.5;
    gpos[1] += 3.5;
    sy = -1;
  }else if(step < 80) {
    galaga.setFrame(2);
    gpos[0] -= 4;
    gpos[1] += 3;
    sy = -1;
  }else if(step < 90) {
    galaga.setFrame(1);
    gpos[0] -= 5;
    gpos[1] += 1;
    sy = -1;
  }else if(step < 100) {
    galaga.setFrame(0);
    gpos[0] -= 5;
    gpos[1] += 0;
    sy = -1;
  }else if(step < 110) {
    galaga.setFrame(1);
    gpos[0] -= 5;
    gpos[1] -= 1;
    sy = 1;
  }else if(step < 120) {
    galaga.setFrame(2);
    gpos[0] -= 4;
    gpos[1] -= 3.5;
  }else if(step < 130) {
    galaga.setFrame(3);
    gpos[0] -= 3.5;
    gpos[1] -= 3.5;
  }else if(step < 140) {
    galaga.setFrame(4);
    gpos[0] -= 3;
    gpos[1] -= 4;
  }else if(step < 150) {
    galaga.setFrame(5);
    gpos[0] -= 1;
    gpos[1] -= 5;
  }else if(step < 160) {
    galaga.setFrame(6);
    gpos[0] -= 0;
    gpos[1] -= 5;
  }else if(step < 170) {
    galaga.setFrame(5);
    gpos[0] += 1;
    gpos[1] -= 5;
    sx = -1;
  }else if(step < 180) {
    galaga.setFrame(4);
    gpos[0] += 3;
    gpos[1] -= 4;
    sx = -1;
  }else if(step < 190) {
    galaga.setFrame(3);
    gpos[0] += 3.5;
    gpos[1] -= 3.5;
    sx = -1;
  }else if(step < 200) {
    galaga.setFrame(2);
    gpos[0] += 4;
    gpos[1] -= 3;
    sx = -1;
  }else if(step < 210) {
    galaga.setFrame(1);
    gpos[0] += 5;
    gpos[1] -= 1;
    sx = -1;
  }else if(step < 220) {
    galaga.setFrame(0);
    gpos[0] += 5;
    gpos[1] -= 0;
    sx = -1;
  }else if(step < 230) {
    galaga.setFrame(1);
    gpos[0] += 5;
    gpos[1] += 1;
    sx = -1;
    sy = -1;
  }else if(step < 240) {
    galaga.setFrame(2);
    gpos[0] += 4;
    gpos[1] += 3;
    sx = -1;
    sy = -1;
  }else if(step < 250) {
    galaga.setFrame(3);
    gpos[0] += 3.5;
    gpos[1] += 3.5;
    sx = -1;
    sy = -1;
  }else if(step < 260) {
    galaga.setFrame(4);
    gpos[0] += 3;
    gpos[1] += 4;
    sx = -1;
    sy = -1;
  }else if(step < 270) {
    galaga.setFrame(5);
    gpos[0] += 1;
    gpos[1] += 5;
    sx = -1;
    sy = -1;
  }else if(step < 280) {
    galaga.setFrame(6);
    gpos[0] += 0;
    gpos[1] += 5;
    sx = -1;
    sy = -1;
  }else if(step < 550) {
    if(step == 280) loop.start("tractor_beam1");
    tractor++;
    if(tractor % 3 == 0) {
      tractorBeam.size[1] = Math.min(tractorBeam.size[1] + 1, 80);
    }
    tractorBeam.setFrame(Math.floor(tractor / 8) % 3);
  }else if(step < 750) {
    attached = true;
    init();
    gameover = true;
    $("#space-canvas").css('visibility', 'visible');
    tractor++;
    if(tractor % 2 == 0) {
      tractorBeam.size[1] = Math.max(tractorBeam.size[1] - 1, 0);
    }
    tractorBeam.setFrame(Math.floor(tractor / 8) % 3);
    if(step == 550) {
      loop.stop();
      loop.start("tractor_beam2");
    }else if(step == 740) {
      loop.stop();
    }
  }else if(step < 800) {
    gameover = false;
    tractor = 0;
  }else if(step < 803) {
    galaga.setFrame(5);
    gpos[0] -= 1;
    gpos[1] += 5;
    sx = 1;
    sy = -1;
  }else if(step < 806) {
    galaga.setFrame(4);
    gpos[0] -= 3;
    gpos[1] += 4;
    sy = -1;
  }else if(step < 809) {
    galaga.setFrame(3);
    gpos[0] -= 3.5;
    gpos[1] += 3.5;
    sy = -1;
  }else if(step < 812) {
    galaga.setFrame(2);
    gpos[0] -= 4;
    gpos[1] += 3;
    sy = -1;
  }else if(step < 815) {
    galaga.setFrame(1);
    gpos[0] -= 5;
    gpos[1] += 1;
    sy = -1;
  }else if(step < 818) {
    galaga.setFrame(0);
    gpos[0] -= 5;
    gpos[1] += 0;
    sy = -1;
  }else if(step < 821) {
    galaga.setFrame(1);
    gpos[0] -= 5;
    gpos[1] -= 1;
    sy = 1;
  }else if(step < 824) {
    galaga.setFrame(2);
    gpos[0] -= 4;
    gpos[1] -= 3;
  }else if(step < 834) {
    galaga.setFrame(3);
    gpos[0] -= 3.5;
    gpos[1] -= 3.5;
  }else if(step < 850) {
    galaga.setFrame(4);
    gpos[0] -= 3;
    gpos[1] -= 4;
  }else if(step < 870) {
    galaga.setFrame(5);
    gpos[0] -= 1;
    gpos[1] -= 5;
  }else if(step < 1000) {
    galaga.setFrame(6);
    gpos[0] -= 0;
    gpos[1] -= 5;
    attached = false;
  }else {
    attached = false;
    return;
  }

  var px = gpos[0];
  var py = gpos[1];

  if(attached) {
    var top = (py + galaga.getSize()[1] + tractorBeam.getSize()[1]).toString() + 'px';
    var left = (px - width / 2 + galaga.getSize()[0] / 2).toString() + 'px';
    $("#space-canvas").css('top', top);
    $("#space-canvas").css('left', left);
    $("#game-over-handler").css('top', top);
    $("#game-over-handler").css('left', left);
    $("#game-over-overlay").css('top', top);
    $("#game-over-overlay").css('left', left);
  }

  galagactx.save();
  if(sx == -1) px += galaga.getSize()[0];
  if(sy == -1) py += galaga.getSize()[1];
  galagactx.translate(px, py);

  galagactx.save();
  galagactx.scale(sx, sy);
  galaga.render(galagactx);
  galagactx.restore();

  if(tractor > 0) {
    // Tractor Beam
    galagactx.save();
    galagactx.translate(-galaga.getSize()[0] / 2.0 - tractorBeam.getSize()[0] / 2.0, 0);
    tractorBeam.render(galagactx);
    galagactx.restore();
  }

  galagactx.restore();

  // Switch to next step
  step++;
  window.setTimeout(grabGame, 7);
}

// Game Loop
var lastTime;
function main() {
  var now = Date.now();
  var dt = Math.min((now - lastTime) / 1000.0, 0.1);

  if(!gameover && dt > 0) {
    //console.log(dt);
    if(game === 0) {
      updatesi(dt);
    }else if(game == 1) {
      
    }

    $('#score').text("Score: " + score);
  }
  if(game === 0) {
    rendersi();
  }else if(game == 1) {
    
  }

  lastTime = now;
  if(running) requestAnimFrame(main);
};

// Initialization
function init() {
  if(!running) {
    running = true;
    if(game === 0) resetsi();
    else if(game == 1){}
    lastTime = Date.now();
    main();
  }
}

