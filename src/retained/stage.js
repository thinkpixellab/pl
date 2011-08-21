goog.provide('pl.retained.Stage');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.retained.Element');
goog.require('pl.ex');

/**
 * @constructor
 * @param {!HTMLCanvasElement} canvas
 * @param {!pl.retained.Element} rootElement
 */
pl.retained.Stage = function(canvas, rootElement) {
  this._canvas = canvas;
  this._element = rootElement;
};

/**
 * @param {goog.math.Size} size
 * @returns {boolean}
 */
pl.retained.Stage.prototype.setSize = function(size) {
  if (!goog.math.Size.equals(pl.ex.getCanvasSize(this._canvas), size)) {
    this._canvas.width = size.width;
    this._canvas.height = size.height;
    this._ctx = null;
    return true;
  }
  return false;
};

pl.retained.Stage.prototype.draw = function() {
  if (!this._ctx) {
    this._ctx =
    /** @type {CanvasRenderingContext2D} */
    this._canvas.getContext('2d');
  } else {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  this._element._drawInternal(this._ctx);
};
