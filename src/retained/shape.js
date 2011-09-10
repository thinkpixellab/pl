goog.provide('pl.retained.Shape');

goog.require('pl.gfx');
goog.require('pl.retained.Element');

/**
 * @constructor
 * @extends {pl.retained.Element}
 * @param {number} width
 * @param {number} height
 */
pl.retained.Shape = function(width, height) {
  goog.base(this, width, height, true);
};
goog.inherits(pl.retained.Shape, pl.retained.Element);

/**
 * @type {?(string|CanvasGradient|CanvasPattern)}
 */
pl.retained.Shape.prototype.fillStyle = 'white';

/**
 * @override
 */
pl.retained.Shape.prototype.drawOverride = function(ctx) {
  if (this.fillStyle) {
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(0, 0, this.width, this.height);
  }
};
