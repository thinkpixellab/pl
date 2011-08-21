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

  this._count = 0;
  this._values = [];
  this._sum = 0;
  this.fps = 0;
};

/**
 @returns {number}
 **/
pl.FpsLogger.prototype.AddInterval = function() {
  var currentTick = goog.now();
  if (this._lastTick > 0) {
    var secondsPerFrame = currentTick - this._lastTick;
    secondsPerFrame /= 1000;
    this._count++;
    if (this._values.length < pl.FpsLogger.s_size) {
      this._values.push(secondsPerFrame);
      this._sum += secondsPerFrame;
      this.fps = this._count / this._sum;
    } else {
      var index = this._count % this._values.length;
      this._sum -= this._values[index];
      this._values[index] = secondsPerFrame;
      this._sum += this._values[index];
      this.fps = this._values.length / this._sum;
    }
  }
  this._lastTick = currentTick;

  return this.fps;
};

/**
 @const
 @type {number}
 */
pl.FpsLogger.s_size = 100;
