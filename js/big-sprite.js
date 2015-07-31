function BigSprite(img, size, frames, scale) {
    this.size = size;
    this.frames = frames;
    this._index = 0;
    this.img = img;
    this.scale = scale;
};

BigSprite.prototype.setFrame = function(frame) {
    this._index = frame;
}

BigSprite.prototype.getSize = function() {
  var ret = [0, 0];
  ret[0] = this.size[0] * this.scale;
  ret[1] = this.size[1] * this.scale;
  return ret;
}

BigSprite.prototype.render = function(context) {
    var frame;

    frame = this.frames[this._index];

    var x = frame[0];
    var y = frame[1];

    context.drawImage(this.img, x, y, this.size[0], this.size[1], 0, 0, this.size[0] * this.scale, this.size[1] * this.scale);
}