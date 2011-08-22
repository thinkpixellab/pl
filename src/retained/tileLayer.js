goog.provide('pl.retained.TileLayer');

goog.require('goog.math.Vec2');
goog.require('pl.ex');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {!HTMLImageElement} image
 * @param {!goog.math.Size=} opt_tileSize
 * @extends {pl.retained.Element}
 */
pl.retained.TileLayer = function(width, height, image, opt_tileSize) {
  goog.base(this, width, height);
  this._image = image;
  this._tileSize = opt_tileSize ? opt_tileSize.clone() : new goog.math.Size(image.width, image.height);
  this._offset = new goog.math.Vec2(0, 0);
};
goog.inherits(pl.retained.TileLayer, pl.retained.Element);

/**
 * @param {!goog.math.Vec2} offset
 */
pl.retained.TileLayer.prototype.setOffset = function(offset) {
  this._offset.x = pl.retained.TileLayer._fix(offset.x, this._tileSize.width);
  this._offset.y = pl.retained.TileLayer._fix(offset.y, this._tileSize.height);
};

pl.retained.TileLayer.prototype.getOffset = function(){
  return this._offset.clone();
};

pl.retained.TileLayer.prototype.draw = function(ctx) {
  var y, x, w, h, sx, sy, sw, sh, dx, dw, dy, dh;

  var xScale = this._tileSize.width / this._image.width;
  var yScale = this._tileSize.height / this._image.height;

  y = this._offset.y;
  while (y < this.height) {
    x = this._offset.x;
    h = Math.min(this._tileSize.height, this.height - y);
    while (x < this.width) {
      w = Math.min(this._tileSize.width, this.width - x);
      // at this point, x and y might be negative...which is fine
      // but we'd like to draw less if we could.
      if (x < 0) {
        // no point starting our draw before 0...it's just wasted
        dx = 0;
        // start sampling from our source image the distance that x is wasting by being < 0
        sx = -x / xScale;
        // x is negative here
        // so this will give only the required pixels needed...no more
        dw = w + x;
      } else {
        sx = 0;
        dx = x;
        dw = w;
      }
      sw = dw / xScale;

      // see above...analygous
      if (y < 0) {
        dy = 0;
        sy = -y / yScale;
        dh = h + y;
      } else {
        sy = 0;
        dy = y;
        dh = h;
      }
      sh = dh / yScale;

      // image
      // next 4 params are the x,y,w,h from the source image to draw -> always from upper left, always match target draw size
      // last 4 params are the target x,y,w,h 
      ctx.drawImage(this._image, sx, sy, sw, sh, dx, dy, dw, dh);
      x += w;
    }
    y += h;
  }
};

/**
 * @private
 * @param {number} input
 * @param {number} target
 * @returns {number}
 */
pl.retained.TileLayer._fix = function(input, target) {
  input = pl.ex.round(goog.math.isFiniteNumber(input) ? input : 0);
  return pl.retained.TileLayer._offset(input, target);
};

/**
 * @private
 * @param {number} input
 * @param {number} target
 * @returns {number}
 */
pl.retained.TileLayer._offset = function(input, target) {
  return input - Math.ceil(input / target) * target;
};
