goog.provide('pl.retained.Image');

goog.require('pl.gfx');
goog.require('pl.retained.Element');

/**
 * @constructor
 * @extends {pl.retained.Element}
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} value
 * @param {number} width
 * @param {number} height
 */
pl.retained.Image = function(value, width, height) {
  goog.base(this, width, height, false);
  this._value = value;
};
goog.inherits(pl.retained.Image, pl.retained.Element);

/**
 * @override
 */
pl.retained.Image.prototype.drawOverride = function(ctx) {
  ctx.drawImage(this._value, 0, 0, this.width, this.height);
};
