goog.provide('pl.retained.Container');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.retained.Element');
goog.require('pl.retained.ElementParent');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @implements {pl.retained.ElementParent}
 * @extends {pl.retained.Element}
 */
pl.retained.Container = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);

  /** @type {!Array.<!pl.retained.Element>} */
  this._children = [];
};
goog.inherits(pl.retained.Container, pl.retained.Element);

/**
 * @param {!pl.retained.Element} element
 **/
pl.retained.Container.prototype.addElement = function(element) {
  this.insertAt(element, this._children.length);
};

/**
 * @param {!pl.retained.Element} element
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 **/
pl.retained.Container.prototype.insertAt = function(element, opt_i) {
  goog.array.insertAt(this._children, element, opt_i);
  element.claim(this);
  goog.asserts.assert(!pl.retained.Container._containerTransformProperty.isSet(element), 'No container transform should be set...yet');
  pl.retained.Container._containerTransformProperty.set(element, element.addTransform());
  this.onChildrenChanged();
};

/**
 * @param {!pl.retained.Element} element
 * @return {boolean} true if the item was removed, otherwise, false.
 */
pl.retained.Container.prototype.remove = function(element) {
  if (goog.array.remove(this._children, element)) {
    element.disown(this);
    var tx = pl.retained.Container._containerTransformProperty.get(element);
    goog.asserts.assert(!!tx, 'A container transform should exist');
    pl.retained.Container._containerTransformProperty.clear(element);
    element.removeTransform(tx);
    this.onChildrenChanged();
    return true;
  }
  return false;
};

/**
 * @protected
 * @param {!pl.retained.Element} child
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.Container.prototype.getChildTransform = function(child) {
  goog.asserts.assert(goog.array.contains(this._children, child), 'Should be a child that this container actually owns');
  var tx = pl.retained.Container._containerTransformProperty.get(child);
  goog.asserts.assert(!!tx, 'A container transform should exist');
  return tx;
};

/**
 * @param {boolean=} opt_frontToBack
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.Container.prototype.getVisualChildren = function(opt_frontToBack) {
  if (opt_frontToBack) {
    var value = new Array(this._children.length);
    for (var i = 0; i < this._children.length; i++) {
      value[this._children.length - 1 - i] = this._children[i];
    }
    return value;
  } else {
    return goog.array.clone(this._children);
  }
};

pl.retained.Container.prototype.onChildrenChanged = function() {
  this.invalidateDraw();
};

/**
 * returns {?math.google.Rect}
 */
pl.retained.Container.prototype.getChildBounds = function() {
  var bounds = null;
  if (this._children.length) {
    bounds = pl.retained.helper.getBounds(this._children[0]);

    goog.array.forEach(this._children, function(child) {
      bounds.boundingRect(pl.retained.helper.getBounds(child));
    },
    this);
  }
  return bounds;
};

/**
 * @override
 **/
pl.retained.Container.prototype.update = function() {
  goog.array.forEach(this._children, function(element) {
    element.update();
  },
  this);
  goog.base(this, 'update');
};

/**
 * @override
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Container.prototype.drawOverride = function(ctx) {
  goog.array.forEach(this._children, function(element) {
    element._drawInternal(ctx);
  },
  this);
};

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.Container.prototype.childInvalidated = function(child) {
  goog.asserts.assert(goog.array.contains(this._children, child), 'Must be the containers child');
  this.invalidateDraw();
};

pl.retained.Container._containerTransformProperty = new pl.Property('containerTransfrom');

/**
 * @param {!goog.math.Coordinate=} opt_value
 * @param {!pl.retained.Element} element
 * @return {!goog.math.Coordinate}
 */
pl.retained.Container.prototype.topLeft = function(element, opt_value) {
  var tx = this.getChildTransform(element);
  if (opt_value) {
    tx.setToTranslation(opt_value.x, opt_value.y);
  }
  return pl.ex.transformCoordinate(tx, new goog.math.Coordinate());
};

/**
 * @param {!goog.math.Coordinate=} opt_value
 * @param {!pl.retained.Element} element
 * @return {!goog.math.Coordinate}
 */
pl.retained.Container.prototype.center = function(element, opt_value) {
  var sizeOffset = new goog.math.Vec2(element.width / 2, element.height / 2);
  if (opt_value) {
    var tl = goog.math.Vec2.difference(opt_value, sizeOffset);
    this.topLeft(element, tl);
  }
  return sizeOffset.add(this.topLeft(element));
};
