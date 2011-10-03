goog.provide('pl.retained.Canvas');

goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Coordinate');
goog.require('pl.retained.Element');
goog.require('pl.retained.Panel');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @extends {pl.retained.Panel}
 */
pl.retained.Canvas = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);
};
goog.inherits(pl.retained.Canvas, pl.retained.Panel);

/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate=} opt_value
 * @return {!goog.math.Coordinate}
 */
pl.retained.Canvas.prototype.topLeft = function(element, opt_value) {
  var tx = this.getChildTransform(element);
  if (opt_value) {
    tx.setToTranslation(opt_value.x, opt_value.y);
  }
  return pl.ex.transformCoordinate(tx, new goog.math.Coordinate());
};

/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate=} opt_value
 * @return {!goog.math.Coordinate}
 */
pl.retained.Canvas.prototype.center = function(element, opt_value) {
  var sizeOffset = new goog.math.Vec2(element.width / 2, element.height / 2);
  if (opt_value) {
    var tl = goog.math.Vec2.difference(opt_value, sizeOffset);
    this.topLeft(element, tl);
  }
  return sizeOffset.add(this.topLeft(element));
};
