goog.provide('DemoHost');

goog.require('demos');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
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

  var select1 = new goog.ui.Select('Pick a demo...');
  goog.array.forEach(demos.all, function(d) {
    select1.addItem(new goog.ui.MenuItem(d.description, d));
  });
  select1.render(goog.dom.getElement('DemoSelect'));
  select1.setSelectedIndex(0);

  goog.events.listen(select1, goog.ui.Component.EventType.ACTION, function(e) {
    var select = e.target;
    this._loadDemo(select.getValue());
  },
  false, this);

  this._loadDemo(demos.all[0]);

  this._drawFrame();
  this._updateHUD();
};

DemoHost.prototype._loadDemo = function(demoCtr) {
  var canvas = document.getElementById('content');
  var newCanvas = goog.dom.createDom('canvas', {
    'id': 'content',
    'width': 500,
    'height': 500
  });
  if (canvas) {
    goog.dom.replaceNode(newCanvas, canvas);
  }
  canvas = newCanvas;

  this._demo = new demoCtr(canvas);
};

DemoHost.prototype._drawFrame = function() {
  this._fpsLogger.AddInterval();
  var func = goog.bind(this._drawFrame, this);

  if (this._demo) {
    this._demo.frame();
  }

  //goog.Timer.callOnce(func, 100);
  pl.ex.requestAnimationFrame(func);
};

DemoHost.prototype._updateHUD = function() {
  pl.DebugDiv.clear();
  this._logger.info(String(this._fpsLogger.fps));

  var func = goog.bind(this._updateHUD, this);
  goog.Timer.callOnce(func, 2000);
};
