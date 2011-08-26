goog.provide('pl.FpsLogger');

/**
 @constructor
 */
pl.FpsLogger = function() {
  /**
   @private
   @type {number}
   */
  this._lastTick = 0;

  /**
   @private
   @type {number}
   */
  this._index = 0;
  this._values = [];
  /**
   @private
   @type {number}
   */
  this._sum = 0;

  /**
   @type {number}
   */
  this.fps = NaN;
};

/**
 @return {number}
 **/
pl.FpsLogger.prototype.AddInterval = function() {
  var currentTick = goog.now();
  if (this._lastTick > 0) {
    var secondsPerFrame = currentTick - this._lastTick;
    secondsPerFrame /= 1000;
    if (this._values.length < pl.FpsLogger.s_size) {
      this._values.push(secondsPerFrame);
    } else {
      this._index = (this._index + 1) % this._values.length;
      this._sum -= this._values[this._index];
      this._values[this._index] = secondsPerFrame;
    }
    this._sum += secondsPerFrame;
    this.fps = this._values.length / this._sum;
  }
  this._lastTick = currentTick;

  return this.fps;
};

/**
 @const
 @type {number}
 */
pl.FpsLogger.s_size = 100;
