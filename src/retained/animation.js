goog.provide('pl.retained.Animation');

/**
 * @constructor
 * @param {!Element} element
 * @param {number} frameCount
 * @param {!function(number, !Element)} func
 */
pl.retained.Animation = function(element, frameCount, func) {
  this._element = element;
  this._frameCount = frameCount;
  this._func = func;

  this._frame = 0;
};

pl.retained.Animation.prototype.tick = function(){
  this._func(this._frame, this._element);
  this._frame = (this._frame + 1) % this._frameCount;
};
