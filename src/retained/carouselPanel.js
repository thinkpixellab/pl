goog.provide('pl.retained.CarouselPanel');

goog.require('goog.array');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.retained.Element');
goog.require('pl.retained.Panel');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @extends {pl.retained.Panel}
 */
pl.retained.CarouselPanel = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);

  this._angle = 0;
  this._locationsDirty = true;
  this._radius = new goog.math.Size(this.width / 4, this.height / 8);
  this._backScale = 0.5;
  this._middleElement = null;
};
goog.inherits(pl.retained.CarouselPanel, pl.retained.Panel);

/**
 * @param {pl.retained.Element=} opt_element
 * @return {pl.retained.Element}
 */
pl.retained.CarouselPanel.prototype.middleElement = function(opt_element) {
  if (goog.isDef(opt_element)) {
    if (this._middleElement) {
      this.remove(this._middleElement);
      this._middleElement = null;
    }
    if (opt_element !== null) {
      this.addElement(opt_element);
      this._middleElement = opt_element;
    }
  }
  return this._middleElement;
};

/**
 * @param {number=} opt_radian
 * @return {number}
 */
pl.retained.CarouselPanel.prototype.angle = function(opt_radian) {
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
pl.retained.CarouselPanel.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this._radius = opt_value.clone();
    this._locationsDirty = true;
  }
  return this._radius.clone();
};

/**
 * should be a value <= 1 && > 0
 * @param {number=} opt_value
 * @return {number}
 */
pl.retained.CarouselPanel.prototype.backScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this._backScale = opt_value;
    this._locationsDirty = true;
  }
  return this._backScale;
};

/**
 * @override
 * @param {number} index
 * @return {!pl.retained.Element}
 */
pl.retained.CarouselPanel.prototype.getVisualChild = function(index) {
  return this._sortedChildren[index];
};


pl.retained.CarouselPanel.prototype.onChildrenChanged = function() {
  this._locationsDirty = true;
  this._sortedChildren = null;
  goog.base(this, 'onChildrenChanged');
};

/**
 * @override
 **/
pl.retained.CarouselPanel.prototype.update = function() {
  this._updateLocations();
  goog.base(this, 'update');
};

/**
 * @override
 * @param {!pl.retained.Element} element
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 **/
pl.retained.CarouselPanel.prototype.insertAt = function(element, opt_i) {
  goog.base(this, 'insertAt', element, opt_i);
  pl.retained.CarouselPanel._centerProperty.set(element, new goog.math.Coordinate());
};

/**
 * @override
 * @param {!pl.retained.Element} element
 */
pl.retained.CarouselPanel.prototype.remove = function(element) {
  goog.base(this, 'remove', element);
  pl.retained.CarouselPanel._centerProperty.clear(element);
};

pl.retained.CarouselPanel.prototype._updateLocations = function() {
  if (this._locationsDirty) {
    this.invalidateDraw();
    this._locationsDirty = false;
    var i = 0;
    var spinningKidCount = (this._middleElement === null) ? this._children.length : this._children.length - 1;
    var radiansPer = Math.PI * 2 / spinningKidCount;
    var topLeft = new goog.math.Coordinate();
    goog.array.forEach(this._children, function(element) {
      var tx = this.getChildTransform(element);
      if (element === this._middleElement) {
        topLeft.x = this.width / 2 - element.width / 2;
        topLeft.y = this.height / 2 - element.height / 2;
        tx.setToTranslation(topLeft.x, topLeft.y);
      } else {

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
        }

        i++;
      }
      var center = pl.retained.CarouselPanel._centerProperty.get(element);
      center.x = topLeft.x + element.width / 2;
      center.y = topLeft.y + element.height / 2;
    },
    this);
    this._sortedChildren = this._sortedChildren || goog.array.clone(this._children);

    var _this = this;
    goog.array.sort(this._sortedChildren, function(a, b) {
      var ay = pl.retained.CarouselPanel._centerProperty.get(a).y;
      var by = pl.retained.CarouselPanel._centerProperty.get(b).y;
      return goog.array.defaultCompare(ay, by);
    });
  }
};

/**
 * @private
 * @const
 * @type {!pl.Property}
 */
pl.retained.CarouselPanel._centerProperty = new pl.Property('carouselCenter');
