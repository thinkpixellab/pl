goog.provide('pl.retained.Animation');

goog.require('goog.asserts');
goog.require('pl.Behavior');
goog.require('pl.retained.EventType');

/**
 * @constructor
 * @extends {pl.Behavior}
 * @param {!pl.retained.Element} element
 * @param {number} frameCount
 * @param {!function(number, !pl.retained.Element)} func
 * @param {function(!pl.retained.Element)=} opt_finishFunc
 */
pl.retained.Animation = function(element, frameCount, func, opt_finishFunc) {
  goog.base(this, element);

  element.addEventListener(pl.retained.EventType.UPDATE, this._tick, false, this);

  this._frameCount = frameCount;
  this._func = func;
  this._finishFunc = opt_finishFunc || goog.nullFunction;
  this._frame = 0;
};
goog.inherits(pl.retained.Animation, pl.Behavior);

/**
 * @type {boolean}
 */
pl.retained.Animation.prototype.detachOnFinish = false;

pl.retained.Animation.prototype.detach = function() {
  var removed = goog.events.unlisten(this.getElement(), pl.retained.EventType.UPDATE, this._tick, false, this);
  goog.asserts.assert(removed);
  goog.base(this, 'detach');
};

/**
 * @private
 */
pl.retained.Animation.prototype._tick = function() {
  var element = this.getElement();
  goog.asserts.assert(element);
  this._func(this._frame, element);
  this._frame++;
  if (this._frame == this._frameCount) {
    this._finishFunc(element);
    if (this.detachOnFinish) {
      this.detach();
    }
  }
  this._frame = this._frame % this._frameCount;
};

/**
 @return {pl.retained.Element}
 */
pl.retained.Animation.prototype.getElement = function() {
  return /** @type {pl.retained.Element} */ (this._element);
};
