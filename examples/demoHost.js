goog.provide('DemoHost');

goog.require('goog.debug.LogManager');
goog.require('goog.Timer');

goog.require('pl.ex');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

DemoHost = function(){
  pl.DebugDiv.enable();

  this._logger = goog.debug.LogManager.getRoot();
  this._fpsLogger = new pl.FpsLogger();

  this._drawFrame();
  this._updateHUD();
};

DemoHost.prototype._drawFrame = function() {
  var func = goog.bind(this._drawFrame, this);
  
  //goog.Timer.callOnce(func, 100);
  pl.ex.requestAnimationFrame(func);
  this._fpsLogger.AddInterval();
};

DemoHost.prototype._updateHUD = function() {
  pl.DebugDiv.clear();
  this._logger.info(this._fpsLogger.fps);

  var func = goog.bind(this._updateHUD, this);
  goog.Timer.callOnce(func, 2000);
};
