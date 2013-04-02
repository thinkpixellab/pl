goog.provide('DemoHost');

goog.require('demos');
goog.require('goog.History');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.fx.anim');
goog.require('goog.fx.anim.Animated');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
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

  //
  // Demo Selector
  //
  this._selectControl = new goog.ui.Select('Pick a demo...');
  goog.object.forEach(demos.all, function(e, k, o) {
    this._selectControl.addItem(new goog.ui.MenuItem(k));
  },
  this);
  this._selectControl.render(goog.dom.getElement('DemoSelect'));

  goog.events.listen(this._selectControl, goog.ui.Component.EventType.ACTION, function(e) {
    var value = goog.string.urlEncode(e.target.getValue());
    this._history.setToken(value);
  },
  false, this);

  //
  // History!
  //
  var historyElement =
      /** @type {!HTMLInputElement} */ (document.getElementById('history_state'));

  this._history = new goog.History(false, undefined, historyElement);
  this._history.addEventListener(goog.history.EventType.NAVIGATE, this._navigate, false, this);
  this._history.setEnabled(true);

  this._requestFrame();
  this._updateHUD();
};


/**
 * @export
 */
DemoHost.load = function() {
  DemoHost.images = new pl.images({
    'stars': 'resources/stars.png',
    'pixellab': 'resources/pixellab.png',
    'pixellab_transparent': 'resources/pixellab_transparent.png'
  });
  DemoHost.images.load(function(p) {},
      function() {
        goog.global['$demoHost'] = new DemoHost();
      });
};

DemoHost.images = null;

DemoHost.prototype._frameMs = 0;

DemoHost.prototype._navigate = function(e) {
  var demoName;
  if (e.token.length === 0) {
    demoName = /** @type {string} */ (goog.object.getAnyKey(demos.all));
  } else {
    demoName = goog.string.urlDecode(e.token);
  }
  var demo = demos.all[demoName];
  goog.asserts.assert(demo, 'should have a valid demo here!');
  this._selectControl.setValue(demoName);
  this._loadDemo(demo);
};


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
