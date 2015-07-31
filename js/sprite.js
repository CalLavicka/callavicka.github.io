function Sprite(img, pos, size, speed, frames, dir, once) {
    this.pos = pos;
    this.size = size;
    this.speed = typeof speed === 'number' ? speed : 0;
    this.frames = frames;
    this._index = 0;
    this.img = img;
    this.dir = dir || 'horizontal';
    this.once = once;
    this.scale = 1.2;
};

Sprite.prototype.update = function(dt) {
    this._index += this.speed*dt;
}

Sprite.prototype.getSize = function() {
  var ret = [0, 0];
  ret[0] = this.size[0] * this.scale;
  ret[1] = this.size[1] * this.scale;
  return ret;
}

Sprite.prototype.render = function(context) {
    var frame;

    if(this.speed > 0) {
        var max = this.frames.length;
        var idx = Math.floor(this._index);
      //console.log(this._index.toString() + ", " + idx.toString());
        frame = this.frames[idx % max];

        if(this.once && idx >= max) {
            this.done = true;
            return;
        }
    }
    else {
        frame = 0;
    }


    var x = this.pos[0];
    var y = this.pos[1];

    if(this.dir == 'vertical') {
        y += frame * this.size[1];
    }
    else {
        x += frame * this.size[0];
    }

    context.drawImage(this.img, x, y, this.size[0], this.size[1], 0, 0, this.size[0] * this.scale, this.size[1] * this.scale);
}