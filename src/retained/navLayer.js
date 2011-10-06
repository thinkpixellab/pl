goog.provide('pl.retained.NavLayer');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Vec2');
goog.require('pl.Property');
goog.require('pl.retained.Element');
goog.require('pl.retained.ElementParent');
goog.require('pl.retained.HorizontalAlignment');
goog.require('pl.retained.Image');
goog.require('pl.retained.Panel');
goog.require('pl.retained.VerticalAlignment');
goog.require('pl.retained._NavLayerTxPanel');

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @implements {pl.retained.ElementParent}
 * @extends {pl.retained.Element}
 */
pl.retained.NavLayer = function(width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);

  /** @type {pl.retained.Element} */
  this._child = null;

  /** @type {pl.retained._NavLayerTxPanel} */
  this._txPanel = null;

  /**
   * @type {!pl.retained.HorizontalAlignment}
   */
  this.horizontalChildAlignment = pl.retained.HorizontalAlignment.CENTER;

  /**
   * @type {!pl.retained.VerticalAlignment}
   */
  this.verticalChildAlignment = pl.retained.VerticalAlignment.CENTER;

  /**
   * @type {goog.math.Vec2}
   */
  this.childOffset = null;
};
goog.inherits(pl.retained.NavLayer, pl.retained.Element);

/**
 * @return {boolean}
 */
pl.retained.NavLayer.prototype.canForward = function() {
  return !this._txPanel;
};

/**
 * @param {!pl.retained.Element} element
 * @param {!goog.graphics.AffineTransform} tx
 * @param {number=} opt_frameCount
 */
pl.retained.NavLayer.prototype.forward = function(element, tx, opt_frameCount) {
  var frameCount = opt_frameCount || 30;
  if (this._txPanel) {
    throw Error('cannot move forward while animating...yet');
  }
  if (this._child) {
    goog.asserts.assert(!this._txPanel, 'Not supported yet');
    var ghostChild = this._child;

    this._child.disown(this);

    // existing child transform
    var existingTx = pl.retained.NavLayer._navLayerTransformProperty.get(this._child);
    goog.asserts.assert(!! existingTx, 'A container transform should exist');
    pl.retained.NavLayer._navLayerTransformProperty.clear(this._child);
    this._child.removeTransform(existingTx);
    this._child = null;

    // copy this guy to a canvas
    var tempCanvas =
    /** @type {!HTMLCanvasElement} */
    document.createElement('canvas');
    tempCanvas.width = ghostChild.width;
    tempCanvas.height = ghostChild.height;

    var tempCtx =
    /** @type {!CanvasRenderingContext2D} */
    tempCanvas.getContext('2d');
    ghostChild.drawCore(tempCtx);

    this._txPanel = new pl.retained._NavLayerTxPanel(this.width, this.height, tempCanvas, element, tx, existingTx, frameCount, this.horizontalChildAlignment, this.verticalChildAlignment, this.childOffset || new goog.math.Vec2(0, 0));
    this._txPanel.claim(this);
  }

  goog.asserts.assert(this._child === null);

  this._child = element;

  if (!this._txPanel) {
    this._claimChild();
  }
  this.invalidateDraw();
};

/**
 * @override
 * @param {goog.math.Size} size
 * @return {boolean}
 */
pl.retained.NavLayer.prototype.setSize = function(size) {
  var baseRet = goog.base(this, 'setSize', size);
  if (this._child) {
    this._updateChildLocation();
  }
  return baseRet;
};

/**
 * @private
 */
pl.retained.NavLayer.prototype._claimChild = function() {
  goog.asserts.assert(!this._txPanel);
  goog.asserts.assert(this._child);
  goog.asserts.assert(!pl.retained.NavLayer._navLayerTransformProperty.isSet(this._child), 'No container transform should be set...yet');

  var elementTx = this._child.addTransform();
  pl.retained.NavLayer._navLayerTransformProperty.set(this._child, elementTx);
  this._child.claim(this);
  this._updateChildLocation();
};

/**
 * @override
 * @param {number} index
 * @return {!pl.retained.Element}
 */
pl.retained.NavLayer.prototype.getVisualChild = function(index) {
  if (this._txPanel && index === 0) {
    return this._txPanel;
  } else if (this._child && index === 0) {
    return this._child;
  }
  throw Error('Item not found');
};

/**
 * @override
 * @return {number}
 */
pl.retained.NavLayer.prototype.getVisualChildCount = function() {
  if (this._txPanel) {
    return 1;
  } else if (this._child) {
    return 1;
  } else {
    return 0;
  }
};

/**
 * @override
 **/
pl.retained.NavLayer.prototype.update = function() {
  if (this._txPanel) {
    goog.asserts.assert(this._child);
    this._txPanel.update();
    if (this._txPanel.isDone()) {
      this._txPanel.disown(this);
      this._txPanel.dispose();
      this._txPanel = null;
      this._claimChild();
    }
  }
  if (this._child && !this._txPanel) {
    this._child.update();
  }

  goog.base(this, 'update');
};

/**
 * @override
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.NavLayer.prototype.drawOverride = function(ctx) {
  var length = this.getVisualChildCount();
  for (var i = 0; i < length; i++) {
    var element = this.getVisualChild(i);
    element.drawInternal(ctx);
  }
};

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.NavLayer.prototype.childInvalidated = function(child) {
  goog.asserts.assert(this.hasVisualChild(child), "Must be the container's child");
  this.invalidateDraw();
};

pl.retained.NavLayer.prototype._updateChildLocation = function() {
  goog.asserts.assert(this._child);

  var tx = pl.retained.NavLayer._navLayerTransformProperty.get(this._child);

  var offset = this.childOffset || new goog.math.Vec2(0, 0);
  offset = pl.gfx.getOffsetVector(this.getSize(), this._child.getSize(), this.horizontalChildAlignment, this.verticalChildAlignment, offset);
  tx.setToTranslation(offset.x, offset.y);
};

/**
 * @private
 * @const
 * @type {!pl.Property}
 */
pl.retained.NavLayer._navLayerTransformProperty = new pl.Property('navLayerTransfrom');
