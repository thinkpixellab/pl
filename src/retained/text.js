// TODO: 2011-09-21: note that changing properties besides width/height between frames will not invalidate cache
goog.provide('pl.retained.Text');

goog.require('pl.gfx');
goog.require('pl.retained.Element');

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

pl.retained.Text.prototype.textFillStyle = 'white';

pl.retained.Text.prototype.font = '25px Helvetica';

pl.retained.Text.prototype.lineHeight = 25;

pl.retained.Text.prototype.multiLine = false;

pl.retained.Text.prototype.draw = function(ctx) {
  ctx.font = '25px Helvetica';
  ctx.textBaseline = 'top';
  ctx.fillStyle = this.textFillStyle;
  if (this.multiLine) {
    pl.gfx.multiFillText(ctx, this._value, 0, 0, this.lineHeight, this.width);
  } else {
    ctx.fillText(this._value, 0, 0);
  }
};
