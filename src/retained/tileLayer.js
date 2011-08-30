goog.provide('pl.retained.TileLayer');

goog.require('goog.math.Vec2');
goog.require('pl.ex');
goog.require('pl.gfx');

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
  this._scale = new goog.math.Vec2(this._tileSize.width / this._image.width, this._tileSize.height / this._image.height);
};
goog.inherits(pl.retained.TileLayer, pl.retained.Element);

/**
 * @param {!goog.math.Vec2} offset
 */
pl.retained.TileLayer.prototype.setOffset = function(offset) {
  this._offset.x = pl.retained.TileLayer._fix(offset.x, this._tileSize.width);
  this._offset.y = pl.retained.TileLayer._fix(offset.y, this._tileSize.height);
};

pl.retained.TileLayer.prototype.getOffset = function() {
  return this._offset.clone();
};

/**
 * @override
 */
pl.retained.TileLayer.prototype.drawOverride = function(ctx) {
  if (!this._pattern) {
    this._pattern = ctx.createPattern(this._image, 'repeat');
  }

  var rect = new goog.math.Rect(-this._offset.x / this._scale.x, -this._offset.y / this._scale.y, this.width / this._scale.x, this.height / this._scale.y);

  ctx.setTransform(this._scale.x, 0, 0, this._scale.y, this._offset.x, this._offset.y);

  ctx.fillStyle = this._pattern;
  pl.gfx.fillRect(ctx, rect);
};

/**
 * @private
 * @param {number} input
 * @param {number} target
 * @return {number}
 */
pl.retained.TileLayer._fix = function(input, target) {
  input = input - Math.ceil(input / target) * target;
  input = pl.ex.round(input);
  return input;
};
