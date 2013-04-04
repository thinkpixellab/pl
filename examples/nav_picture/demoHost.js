goog.provide('DemoHost');

goog.require('demos.NavLayerDemo');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.fx.anim');
goog.require('goog.fx.anim.Animated');
goog.require('goog.string');
goog.require('pl.FpsLogger');
goog.require('pl.retained.EventType');



/**
 * @constructor
 * @implements {goog.fx.anim.Animated}
 */
DemoHost = function(opt_canvas) {
  this._logger = goog.debug.LogManager.getRoot();
  this._fpsLogger = new pl.FpsLogger();

  this._requestFrame();
  this._canvas = opt_canvas;
  this._loadDemo(demos.NavLayerDemo);
};


/**
 * @export
 */
DemoHost.load = function(opt_canvas) {
  goog.debug.Console.autoInstall();
  goog.debug.Console.instance.setCapturing(true);
  goog.global['$demoHost'] = new DemoHost(opt_canvas);

  goog.debug.LogManager.getRoot().config('load finished');
};

DemoHost.prototype._frameMs = 0;


/**
 * @param {function(new:demos.DemoBase, !HTMLCanvasElement)} demoCtr
 */
DemoHost.prototype._loadDemo = function(demoCtr) {
  if (this._canvas == null) {
    this._canvas = document.getElementById('content');
  }
  goog.style.setStyle(this._canvas, 'background', 'black');

  this._demo = new demoCtr(this._canvas);
  this._demo.addEventListener(pl.retained.EventType.UPDATE, function(e) {
    this._requestFrame();
  },
  false, this);

  this._requestFrame();
};


/**
 * Function called when a frame is requested for the animation.
 *
 * @param {number} now Current time in milliseconds.
 */
DemoHost.prototype.onAnimationFrame = function(now) {
  this._fpsLogger.AddInterval();
  this._demo.frame();
};

DemoHost.prototype._requestFrame = function() {
  goog.fx.anim.registerAnimation(this);
};
