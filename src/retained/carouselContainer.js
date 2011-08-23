goog.provide('pl.retained.CarouselContainer');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('pl.retained.Element');
goog.require('pl.retained.Container');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {number=} opt_x
 * @param {number=} opt_y
 * @param {boolean=} opt_enableCache
 * @extends {pl.retained.Container}
 */
pl.retained.CarouselContainer = function(width, height, opt_x, opt_y, opt_enableCache) {
  goog.base(this, width, height, opt_x, opt_y, opt_enableCache);
  this._children = [];

  this._angle = 0;
  this._locationsDirty = true;
};
goog.inherits(pl.retained.CarouselContainer, pl.retained.Container);

/**
 * @param {number=} opt_radian
 * @returns {number}
 */
pl.retained.CarouselContainer.prototype.angle = function(opt_radian) {
  if (goog.isDef(opt_radian)) {
    this._angle = Number(opt_radian) || 0;
    this._locationsDirty = true;
  }
  return this._angle;
};

/**
 * @param {!pl.retained.Element} element
 **/
pl.retained.CarouselContainer.prototype.addElement = function(element) {
  goog.base(this, 'addElement', element);
  this._locationsDirty = true;
  this._sortedChildren = null;
};

/**
 * @param {!pl.retained.Element} element
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 **/
pl.retained.CarouselContainer.prototype.insertAt = function(element, opt_i) {
  goog.base(this, 'insertAt', element, opt_i);
  this._locationsDirty = true;
  this._sortedChildren = null;
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.CarouselContainer.prototype.draw = function(ctx) {
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
    var c = new goog.math.Coordinate(0, 0);
    var radius = 100;
    goog.array.forEach(this._children, function(element) {
      c.x = this.width / 2 + radius * Math.cos(this._angle + radiansPer * i);
      c.y = this.height / 2 + radius * Math.sin(this._angle + radiansPer * i);
      element.center(c);
      i++;
    },
    this);
    this._sortedChildren = this._sortedChildren || goog.array.clone(this._children);
    goog.array.sort(this._sortedChildren, function(a, b) {
      return goog.array.defaultCompare(a.y, b.y);
    });
  }
};
