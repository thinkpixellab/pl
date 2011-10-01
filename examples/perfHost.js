goog.provide('PerfHost');

goog.require('demos');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');
goog.require('pl.ex');
goog.require('pl.retained.EventType');

/**
 * @constructor
 */
PerfHost = function() {

  this._frameRequested = false;
  this._frameFunc = goog.bind(this._drawFrame, this);

  this._loadDemo(demos.all['Squares']);
};

/**
 * @export
 */
PerfHost.load = function() {
  goog.global['$perfHost'] = new PerfHost();
};

/**
 * @param {function(new:demos.Demo, !HTMLCanvasElement)} demoCtr
 */
PerfHost.prototype._loadDemo = function(demoCtr) {
  var newCanvas = /** @type {!HTMLCanvasElement} */ (goog.dom.createDom('canvas', {
    'id': 'content',
    'width': 500,
    'height': 500
  }));
  goog.style.setStyle(newCanvas, 'background', 'black');
  goog.dom.replaceNode(newCanvas, document.getElementById('content'));

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

PerfHost.prototype._drawFrame = function() {
  this._frameRequested = false;
  this._demo.frame();
  this._requestFrame();
};

PerfHost.prototype._requestFrame = function() {
  if (!this._frameRequested) {
    this._frameRequested = true;
    goog.Timer.callOnce(this._frameFunc);
  }
};
