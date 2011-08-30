goog.provide('pl.retained.CarouselContainer');

goog.require('goog.array');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.retained.Container');
goog.require('pl.retained.Element');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @extends {pl.retained.Container}
 */
pl.retained.CarouselContainer = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);
  this._children = [];

  this._angle = 0;
  this._locationsDirty = true;
  this._radius = new goog.math.Size(this.width / 4, this.height / 8);
  this._backScale = 0.5;
};
goog.inherits(pl.retained.CarouselContainer, pl.retained.Container);

/**
 * @param {number=} opt_radian
 * @return {number}
 */
pl.retained.CarouselContainer.prototype.angle = function(opt_radian) {
  if (goog.isDef(opt_radian)) {
    this._angle = Number(opt_radian) || 0;
    this._locationsDirty = true;
    this.invalidateDraw();
  }
  return this._angle;
};

/**
 * @param {goog.math.Size=} opt_value
 * @return {goog.math.Size}
 */
pl.retained.CarouselContainer.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this._radius = opt_value.clone();
    this._locationsDirty = true;
    this.invalidateDraw();
  }
  return this._radius.clone();
};

/**
 * should be a value <= 1 && > 0
 * @param {number=} opt_value
 * @return {number}
 */
pl.retained.CarouselContainer.prototype.backScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this._backScale = opt_value;
    this._locationsDirty = true;
  }
  return this._backScale;
};

/**
 * @param {boolean=} opt_frontToBack
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.CarouselContainer.prototype.getVisualChildren = function(opt_frontToBack) {
  this._updateLocations();
  if (opt_frontToBack) {
    var value = new Array(this._sortedChildren.length);
    for (var i = 0; i < this._sortedChildren.length; i++) {
      value[this._sortedChildren.length - 1 - i] = this._sortedChildren[i];
    }
    return value;
  } else {
    return goog.array.clone(this._sortedChildren);
  }
};

pl.retained.CarouselContainer.prototype.onChildrenChanged = function() {
  this._locationsDirty = true;
  this._sortedChildren = null;
};

/**
 * @override
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.CarouselContainer.prototype.drawOverride = function(ctx) {
  this._updateLocations();
  goog.array.forEach(this._sortedChildren, function(element) {
    element._drawInternal(ctx);
  },
  this);
};

pl.retained.CarouselContainer.prototype._updateLocations = function() {
  if (this._locationsDirty) {
    this._locationsDirty = false;
    var i = 0;
    var radiansPer = Math.PI * 2 / this._children.length;
    var topLeft = new goog.math.Coordinate(0, 0);
    goog.array.forEach(this._children, function(element) {
      var tx = element.parentTransform = element.parentTransform || new goog.graphics.AffineTransform();

      // location
      topLeft.x = this.width / 2 + this._radius.width * Math.cos(this._angle + radiansPer * i) - element.width / 2;
      var sin = Math.sin(this._angle + radiansPer * i);
      topLeft.y = this.height / 2 + this._radius.height * sin - element.height / 2;

      // scale
      if (this._backScale === 1) {
        // just set it
        tx.setToTranslation(topLeft.x, topLeft.y);
      } else {

        var scale = (sin + 1) / 2;
        scale = this._backScale + scale * (1 - this._backScale);
        pl.gfx.affineOffsetScale(tx, scale, scale, element.width / 2, element.height / 2);
        tx.preConcatenate(goog.graphics.AffineTransform.getTranslateInstance(topLeft.x, topLeft.y));

        element.invalidateDraw();
      }

      i++;
    },
    this);
    this._sortedChildren = this._sortedChildren || goog.array.clone(this._children);
    goog.array.sort(this._sortedChildren, function(a, b) {
      return goog.array.defaultCompare(a.parentTransform.getTranslateY(), b.parentTransform.getTranslateY());
    });
  }
};
