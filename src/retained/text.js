goog.provide('pl.retained.Text');

goog.require('pl.gfx');
goog.require('pl.retained.Element');

/**
 * @constructor
 * @extends {pl.retained.Element}
 * @param {string} value
 * @param {number} width
 * @param {number} height
 */
pl.retained.Text = function(value, width, height) {
  goog.base(this, width, height, true);
  this._value = value;
};
goog.inherits(pl.retained.Text, pl.retained.Element);

pl.retained.Text.prototype.textFillStyle = 'white';

pl.retained.Text.prototype.font = '25px Helvetica';

pl.retained.Text.prototype.lineHeight = 25;

pl.retained.Text.prototype.multiLine = false;

pl.retained.Text.prototype.isCentered = false;

pl.retained.Text.prototype.shadowColor = undefined;
pl.retained.Text.prototype.shadowBlur = 4;

/**
 * @type {?(string|CanvasGradient|CanvasPattern)}
 */
pl.retained.Text.prototype.fillStyle = null;

/**
 * @override
 */
pl.retained.Text.prototype.drawOverride = function(ctx) {
  if (this.fillStyle) {
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  var xStart = 0;
  if (this.isCentered) {
    ctx.textAlign = 'center';
    xStart = this.width / 2;
  }

  if (this.shadowColor) {
    ctx.shadowColor = this.shadowColor;
    ctx.shadowBlur = this.shadowBlur;
  }

  ctx.font = this.font;
  ctx.textBaseline = 'top';
  ctx.fillStyle = this.textFillStyle;
  if (this.multiLine) {
    pl.gfx.multiFillText(ctx, this._value, xStart, 0, this.lineHeight, this.width);
  } else {
    ctx.fillText(this._value, xStart, 0);
  }
};
