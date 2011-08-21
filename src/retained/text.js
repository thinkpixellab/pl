goog.provide('pl.retained.Text');

goog.require('pl.retained.Element');
goog.require('goog.array');

/**
 * @constructor
 * @extends {pl.retained.Element}
 * @param {string} value
 * @param {number} width
 * @param {number} height
 * @param {number=} opt_x
 * @param {number=} opt_y
 */
pl.retained.Text = function(value, width, height, opt_x, opt_y) {
  goog.base(this, width, height, opt_x, opt_y, true);
  this._value = value;
};
goog.inherits(pl.retained.Text, pl.retained.Element);

pl.retained.Text.prototype.draw = function(ctx) {
  ctx.font = '25px Helvetica';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'white';
  ctx.fillText(this._value, 0, 0, this.width);
};
