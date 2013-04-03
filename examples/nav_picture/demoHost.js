goog.provide('DemoHost');

goog.require('demos.NavLayerDemo');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.fx.anim');
goog.require('goog.fx.anim.Animated');
goog.require('goog.object');
goog.require('goog.string');
goog.require('pl.DebugDiv');
goog.require('pl.FpsLogger');
goog.require('pl.ex');
goog.require('pl.images');
goog.require('pl.retained.EventType');



/**
 * @constructor
 * @implements {goog.fx.anim.Animated}
 */
DemoHost = function() {
  pl.DebugDiv.enable();
  goog.style.setUnselectable(document.body, true);

  this._logger = goog.debug.LogManager.getRoot();
  this._fpsLogger = new pl.FpsLogger();

  this._requestFrame();
  this._updateHUD();
  this._loadDemo(demos.NavLayerDemo);
};


/**
 * @export
 */
DemoHost.load = function() {
  goog.global['$demoHost'] = new DemoHost();
};

DemoHost.prototype._frameMs = 0;


/**
 * @param {function(new:demos.DemoBase, !HTMLCanvasElement)} demoCtr
 */
DemoHost.prototype._loadDemo = function(demoCtr) {
  var oldCanvas = document.getElementById('content');
  var newCanvas = /** @type {!HTMLCanvasElement} */ (goog.dom.createDom('canvas', {
    'id': 'content',
    'width': oldCanvas.width,
    'height': oldCanvas.height
  }));
  goog.style.setStyle(newCanvas, 'background', 'black');
  goog.dom.replaceNode(newCanvas, oldCanvas);

  if (this._demo) {
    this._demo.dispose();
    this._demo = null;
  }

  this._demo = new demoCtr(newCanvas);
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

  if (this._demo && this._demo.frame()) {
    // no-op
  } else {
    goog.fx.anim.unregisterAnimation(this);
  }
};

DemoHost.prototype._requestFrame = function() {
  goog.fx.anim.registerAnimation(this);
};

DemoHost.prototype._updateHUD = function() {
  pl.DebugDiv.clear();
  this._logger.info(String(this._fpsLogger.fps));

  var func = goog.bind(this._updateHUD, this);
  goog.Timer.callOnce(func, 500);
};
