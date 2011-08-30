goog.provide('pl.retained.Animation');

goog.require('pl.Behavior');
goog.require('pl.retained.EventType');

/**
 * @constructor
 * @extends {pl.Behavior}
 * @param {!pl.retained.Element} element
 * @param {number} frameCount
 * @param {!function(number, !pl.retained.Element)} func
 */
pl.retained.Animation = function(element, frameCount, func) {
  goog.base(this, element);

  element.addEventListener(pl.retained.EventType.UPDATE, function(e) {
    this._tick();
  }, false, this);

  this._frameCount = frameCount;
  this._func = func;
  this._frame = 0;
};
goog.inherits(pl.retained.Animation, pl.Behavior);

/**
 * @private
 */
pl.retained.Animation.prototype._tick = function() {
  var element = /** @type {!pl.retained.Element} */ (this._element);
  this._func(this._frame, element);
  this._frame = (this._frame + 1) % this._frameCount;
};
