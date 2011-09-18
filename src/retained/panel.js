goog.provide('pl.retained.Panel');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.Property');
goog.require('pl.retained.Element');
goog.require('pl.retained.ElementParent');
goog.require('pl.retained.helper');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @implements {pl.retained.ElementParent}
 * @extends {pl.retained.Element}
 */
pl.retained.Panel = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);

  /** @type {!Array.<!pl.retained.Element>} */
  this._children = [];
};
goog.inherits(pl.retained.Panel, pl.retained.Element);

/**
 * @param {!pl.retained.Element} element
 **/
pl.retained.Panel.prototype.addElement = function(element) {
  this.insertAt(element, this._children.length);
};

/**
 * @param {!pl.retained.Element} element
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 **/
pl.retained.Panel.prototype.insertAt = function(element, opt_i) {
  goog.array.insertAt(this._children, element, opt_i);
  element.claim(this);
  goog.asserts.assert(!pl.retained.Panel._containerTransformProperty.isSet(element), 'No container transform should be set...yet');
  pl.retained.Panel._containerTransformProperty.set(element, element.addTransform());
  this.onChildrenChanged();
};

/**
 * @param {!pl.retained.Element} element
 */
pl.retained.Panel.prototype.remove = function(element) {
  if (goog.array.remove(this._children, element)) {
    element.disown(this);
    var tx = pl.retained.Panel._containerTransformProperty.get(element);
    goog.asserts.assert(!! tx, 'A container transform should exist');
    pl.retained.Panel._containerTransformProperty.clear(element);
    element.removeTransform(tx);
    this.onChildrenChanged();
  } else {
    throw Error('element is not a child');
  }
};

/**
 * @protected
 * @param {!pl.retained.Element} child
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.Panel.prototype.getChildTransform = function(child) {
  goog.asserts.assert(goog.array.contains(this._children, child), 'Should be a child that this container actually owns');
  var tx = pl.retained.Panel._containerTransformProperty.get(child);
  goog.asserts.assert(!! tx, 'A container transform should exist');
  return tx;
};

/**
 * @param {boolean=} opt_frontToBack
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.Panel.prototype.getVisualChildren = function(opt_frontToBack) {
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

pl.retained.Panel.prototype.onChildrenChanged = function() {
  this.invalidateDraw();
};

/**
 * returns {?math.google.Rect}
 */
pl.retained.Panel.prototype.getChildBounds = function() {
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
pl.retained.Panel.prototype.update = function() {
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
pl.retained.Panel.prototype.drawOverride = function(ctx) {
  goog.array.forEach(this.getVisualChildren(), function(element) {
    element._drawInternal(ctx);
  },
  this);
};

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.Panel.prototype.childInvalidated = function(child) {
  goog.asserts.assert(goog.array.contains(this._children, child), 'Must be the containers child');
  this.invalidateDraw();
};

/**
 * @private
 * @const
 * @type {!pl.Property}
 */
pl.retained.Panel._containerTransformProperty = new pl.Property('panelTransfrom');
