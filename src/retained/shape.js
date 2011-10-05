goog.provide('pl.retained.Shape');
goog.provide('pl.retained.ShapeType');

goog.require('pl.gfx');
goog.require('pl.retained.Element');

/**
 * @enum {string}
 */
pl.retained.ShapeType = {
  RECT: 'rectangle',
  ELLIPSE: 'ellipse'
};

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
 * @type {!pl.retained.ShapeType}
 */
pl.retained.Shape.prototype.type = pl.retained.ShapeType.RECT;

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
    switch (this.type) {
    case pl.retained.ShapeType.RECT:
      ctx.fillRect(0, 0, this.width, this.height);
      break;
    case pl.retained.ShapeType.ELLIPSE:
      pl.gfx.ellipse(ctx, 0, 0, this.width, this.height);
      ctx.fill();
      break;
    default:
      throw Error("Don't know how to draw " + this.type);
    }
  }
};
