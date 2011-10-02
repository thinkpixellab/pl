goog.provide('pl.retained.Stage');

goog.require('goog.events.EventTarget');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.ex');
goog.require('pl.retained.Element');
goog.require('pl.retained.ElementParent');
goog.require('pl.retained.EventType');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {pl.retained.ElementParent}
 * @param {!HTMLCanvasElement} canvas
 * @param {!pl.retained.Element} rootElement
 */
pl.retained.Stage = function(canvas, rootElement) {
  goog.base(this);
  this._canvas = canvas;
  this._element = rootElement;
  this._element.claim(this);
};
goog.inherits(pl.retained.Stage, goog.events.EventTarget);

/**
 * @return {!goog.math.Size}
 */
pl.retained.Stage.prototype.getSize = function() {
  return pl.ex.getCanvasSize(this._canvas);
};

/**
 * @param {goog.math.Size} size
 * @return {boolean}
 */
pl.retained.Stage.prototype.setSize = function(size) {
  if (!goog.math.Size.equals(this.getSize(), size)) {
    this._canvas.width = size.width;
    this._canvas.height = size.height;
    this._ctx = null;
    return true;
  }
  return false;
};

/**
 * @return {boolean} Returns 'true' if the system has updated in the last frame.
 *                   Indicates animations are running and you might want to continue
 *                   pushing frames.
 **/
pl.retained.Stage.prototype.draw = function() {
  if (!this._ctx) {
    this._ctx =
    /** @type {CanvasRenderingContext2D} */
    this._canvas.getContext('2d');
  } else {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  return this._element.draw(this._ctx);
};

/**
 * @return {!CanvasRenderingContext2D}
 */
pl.retained.Stage.prototype.getContext = function() {
  if (!this._ctx) {
    this._ctx =
    /** @type {CanvasRenderingContext2D} */
    this._canvas.getContext('2d');
  }
  return this._ctx;
};

/**
 * @return {!pl.retained.Element}
 */
pl.retained.Stage.prototype.getRoot = function() {
  return this._element;
};

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.Stage.prototype.childInvalidated = function(child) {
  goog.asserts.assert(this._element == child);
  this.dispatchEvent(pl.retained.EventType.UPDATE);
};
