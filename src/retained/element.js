goog.provide('pl.retained.Element');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.color.alpha');
goog.require('goog.events.EventTarget');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('pl.gfx');
goog.require('pl.retained.ElementParent');
goog.require('pl.retained.EventType');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 */
pl.retained.Element = function(width, height, opt_enableCache) {
  goog.base(this);
  this.width = width;
  this.height = height;

  /**
   * @type {boolean}
   */
  this.cacheEnabled = !!opt_enableCache;
  if (opt_enableCache) {
    this.drawInternal = pl.retained.Element.prototype._drawCached;
  }
};
goog.inherits(pl.retained.Element, goog.events.EventTarget);

/**
 * @type {?number}
 */
pl.retained.Element.prototype.alpha = null;

/**
 * @protected
 * @type {boolean}
 * Should this element clip its content. Default: true
 */
pl.retained.Element.prototype.clip = true;

/**
 * @private
 * @type {?goog.math.Size}
 */
pl.retained.Element.prototype._lastDrawSize = null;

/**
 * @private
 * @type {?pl.retained.ElementParent}
 */
pl.retained.Element.prototype._parent = null;

/**
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.Element.prototype.getTransform = function() {
  var tx = new goog.graphics.AffineTransform();
  if (this._transforms) {
    goog.array.forEach(this._transforms, function(t) {
      tx.concatenate(t);
    });
  }
  return tx;
};

/**
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.Element.prototype.addTransform = function() {
  var txs = this._transforms || (this._transforms = []);
  var tx = new goog.graphics.AffineTransform();
  txs.push(tx);
  return tx;
};

/**
 * @param {!goog.graphics.AffineTransform} tx
 */
pl.retained.Element.prototype.removeTransform = function(tx) {
  goog.asserts.assert(goog.array.contains(this._transforms, tx), 'The provided tx should be here.');
  goog.array.remove(this._transforms, tx);
  if (!this._transforms.length) {
    this._transforms = null;
  }
};

/**
 * @return {!goog.math.Size}
 */
pl.retained.Element.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height);
};

/**
 * @param {goog.math.Size} size
 * @return {boolean}
 */
pl.retained.Element.prototype.setSize = function(size) {
  if (!goog.math.Size.equals(this.getSize(), size)) {
    this.width = size.width;
    this.height = size.height;
    this.invalidateDraw();
    return true;
  }
  return false;
};

/**
 * @return {!goog.math.Rect}
 */
pl.retained.Element.prototype.getRect = function() {
  return new goog.math.Rect(0, 0, this.width, this.height);
};

/**
 * Ensures this element is drawn the next pass
 * passes invalidation up the parent path
 */
pl.retained.Element.prototype.invalidateDraw = function() {
  if (this._lastDrawSize !== null) {
    this._lastDrawSize = null;
    this._invalidateParent();
  }
};

/**
 * @param {number} index
 * @return {!pl.retained.Element}
 */
pl.retained.Element.prototype.getVisualChild = function(index) {
  throw Error('No children for this element');
};

/**
 * @return {number}
 */
pl.retained.Element.prototype.getVisualChildCount = function() {
  return 0;
};

/**
 * @param {!pl.retained.Element} element
 * @return {boolean}
 */
pl.retained.Element.prototype.hasVisualChild = function(element) {
  var length = this.getVisualChildCount();
  for (var i = 0; i < length; i++) {
    if (element === this.getVisualChild(i)) {
      return true;
    }
  }
  return false;
};

/**
 * @param {!pl.retained.ElementParent} parent
 */
pl.retained.Element.prototype.claim = function(parent) {
  goog.asserts.assert(this._parent === null, 'already claimed');
  this._parent = parent;
};

/**
 * @param {!pl.retained.ElementParent} parent
 */
pl.retained.Element.prototype.disown = function(parent) {
  goog.asserts.assert(this._parent == parent);
  this._parent = null;
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @return {boolean} Returns 'true' if the system has updated in the last frame.
 *                   Indicates animations are running and you might want to continue
 *                   pushing frames.
 **/
pl.retained.Element.prototype.draw = function(ctx) {
  this.update();
  var dirty = Boolean(!this._lastDrawSize);
  this.drawInternal(ctx);
  return dirty;
};

/**
 * @param {!pl.retained.Element} ancestor
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.Element.prototype.transformToAncestor = function(ancestor) {
  goog.asserts.assert(this !== ancestor);
  var tx;
  var p = this;
  do {
    if (!p) {
      throw Error('could not find ancestor');
    }
    if (tx) {
      tx.preConcatenate(p.getTransform());
    }
    else {
      tx = p.getTransform();
    }
    p = p._parent;
  } while (p != ancestor);
  return tx;
};

/**
 * @param {!pl.retained.Element} ancestor
 * @return {!goog.math.Rect}
 */
pl.retained.Element.prototype.boundsToAncestor = function(ancestor) {
  var tx = this.transformToAncestor(ancestor);
  var myRect = this.getRect();
  var myPoints = pl.ex.getPoints(myRect);
  pl.ex.transformCoordinates(tx, myPoints);
  var box = goog.math.Box.boundingBox.apply(this, myPoints);
  return goog.math.Rect.createFromBox(box);
};

/**
 * @protected
 * @param {!CanvasRenderingContext2D} ctx
 */
pl.retained.Element.prototype.drawOverride = goog.abstractMethod;

/**
 * @protected
 */
pl.retained.Element.prototype.update = function() {
  this.dispatchEvent(pl.retained.EventType.UPDATE);
};

/**
 * @protected
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Element.prototype.drawCore = function(ctx) {
  if (goog.isDefAndNotNull(this.alpha)) {
    ctx.globalAlpha = this.alpha;
  }

  // call the abstract draw method
  this.drawOverride(ctx);
  this._lastDrawSize = this.getSize();
};

/**
 * @private
 */
pl.retained.Element.prototype._invalidateParent = function() {
  goog.asserts.assert(this._parent);
  this._parent.childInvalidated(this);
};

/**
 * @private
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Element.prototype._drawNormal = function(ctx) {
  var tx = this.getTransform();
  if (this._isClipped(tx, ctx)) {
    return;
  }

  ctx.save();

  // Translate to the starting position
  pl.gfx.transform(ctx, tx);

  // clip to the bounds of the object
  if (this.clip) {
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.clip();
  }

  this.drawCore(ctx);
  ctx.restore();
};

/**
 * @protected
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Element.prototype.drawInternal = pl.retained.Element.prototype._drawNormal;

/**
 * @private
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.Element.prototype._drawCached = function(ctx) {
  goog.asserts.assert(this.clip, 'draw cached is always clipped. So clip should never be false here.');

  var tx = this.getTransform();
  if (this._isClipped(tx, ctx)) {
    return;
  }

  if (!this._cacheCanvas || !goog.math.Size.equals(pl.ex.getCanvasSize(this._cacheCanvas), this._lastDrawSize)) {
    if (!this._cacheCanvas) {
      this._cacheCanvas =
      /** @type {!HTMLCanvasElement} */
      document.createElement('canvas');
    }
    this._cacheCanvas.width = this.width;
    this._cacheCanvas.height = this.height;

    var cacheCtx =
    /** @type {!CanvasRenderingContext2D} */
    this._cacheCanvas.getContext('2d');

    this.drawCore(cacheCtx);
  }

  ctx.save();
  pl.gfx.transform(ctx, tx);

  ctx.drawImage(this._cacheCanvas, 0, 0);
  ctx.restore();
};

pl.retained.Element.prototype._isClipped = function(tx, ctx) {
  if (this.clip) {
    var myRect = this.getRect();
    var myPoints = pl.ex.getPoints(myRect);
    pl.ex.transformCoordinates(tx, myPoints);
    var box = goog.math.Box.boundingBox.apply(null, myPoints);
    myRect = goog.math.Rect.createFromBox(box);
    var ctxRect = new goog.math.Rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var clipped = !goog.math.Rect.intersects(myRect, ctxRect);
    return clipped;
  }
  return false;
};
