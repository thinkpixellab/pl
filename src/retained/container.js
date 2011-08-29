goog.provide('pl.retained.Container');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.retained.Element');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
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
  this.onChildrenChanged();
};

/**
 * @param {!pl.retained.Element} element
 * @return {boolean} true if the item was removed, otherwise, false.
 */
pl.retained.Container.prototype.remove = function(element) {
  if (goog.array.remove(this._children, element)) {
    element.disown(this);
    this.onChildrenChanged();
    return true;
  }
  return false;
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

pl.retained.Container.prototype.onChildrenChanged = goog.nullFunction;

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
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Container.prototype.draw = function(ctx) {
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
