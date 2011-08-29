goog.provide('DemoHost');

goog.require('demos.CarouselDemo');
goog.require('demos.Swap');
goog.require('demos.Tile');
goog.require('demos.Transition');
goog.require('goog.Timer');
goog.require('goog.debug.LogManager');
goog.require('pl.DebugDiv');
goog.require('pl.FpsLogger');
goog.require('pl.ex');

/**
 * @constructor
 */
DemoHost = function() {
  pl.DebugDiv.enable();

  this._logger = goog.debug.LogManager.getRoot();
  this._fpsLogger = new pl.FpsLogger();

  this._loadDemo(demos.Tile);

  this._drawFrame();
  this._updateHUD();
};

DemoHost.prototype._loadDemo = function(demoCtr) {
  var canvas = document.getElementById('content');

  this._demo = new demoCtr(canvas);
};


DemoHost.prototype._drawFrame = function() {
  this._fpsLogger.AddInterval();
  var func = goog.bind(this._drawFrame, this);

  //goog.Timer.callOnce(func, 100);
  pl.ex.requestAnimationFrame(func);

  if (this._demo) {
    this._demo.frame();
  }
};

DemoHost.prototype._updateHUD = function() {
  pl.DebugDiv.clear();
  this._logger.info(this._fpsLogger.fps);

  var func = goog.bind(this._updateHUD, this);
  goog.Timer.callOnce(func, 2000);
};
