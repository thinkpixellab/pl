goog.provide('DemoHost');

goog.require('demos');
goog.require('goog.History');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
goog.require('goog.ui.Slider');
goog.require('pl.DebugDiv');
goog.require('pl.FpsLogger');
goog.require('pl.ex');

/**
 * @constructor
 */
DemoHost = function() {
  pl.DebugDiv.enable();
  goog.style.setUnselectable(document.body, true);

  this._logger = goog.debug.LogManager.getRoot();
  this._fpsLogger = new pl.FpsLogger();

  //
  // Frame rate controls
  //
  var el = document.getElementById('frameRateSlider');
  this._slider = new goog.ui.Slider();
  this._slider.setMoveToPointEnabled(true);
  this._slider.setMinimum(0);
  this._slider.setMaximum(1000);
  this._slider.decorate(el);
  this._slider.addEventListener(goog.ui.Component.EventType.CHANGE, function() {
    this._setFrame(this._slider.getValue());
  },
  false, this);

  this._setFrame(this._frameMs);

  var frameButton = document.getElementById('frameButton');
  goog.events.listen(frameButton, goog.events.EventType.CLICK, function() {
    this._setFrame(null);
  },
  false, this);

  //
  // Demo Selector
  //
  this._selectControl = new goog.ui.Select('Pick a demo...');
  goog.array.forEach(demos.all, function(d) {
    this._selectControl.addItem(new goog.ui.MenuItem(d.description));
  }, this);
  this._selectControl.render(goog.dom.getElement('DemoSelect'));

  goog.events.listen(this._selectControl, goog.ui.Component.EventType.ACTION, function(e) {
    var select = e.target;
    this._history.setToken(select.getValue());
  },
  false, this);

  //
  // History!
  //
  var historyElement =
  /** @type {!HTMLInputElement} */
  document.getElementById('history_state');

  this._history = new goog.History(false, undefined, historyElement);
  this._history.addEventListener(goog.history.EventType.NAVIGATE, this._navigate, false, this);
  this._history.setEnabled(true);

  this._frameFunc = goog.bind(this._drawFrame, this);

  this._drawFrame();
  this._updateHUD();
};

DemoHost.prototype._frameMs = 0;

DemoHost.prototype._navigate = function(e) {
  var demo;
  if (e.token.length === 0) {
    demo = demos.all[0];
  }
  else {
    demo = goog.array.find(demos.all, function(d) {
      return d.description === e.token;
    }, this);
  }
  var i = goog.array.indexOf(demos.all, demo);
  this._selectControl.setSelectedIndex(i);
  this._loadDemo(demo);
};

DemoHost.prototype._setFrame = function(ms) {
  if (ms) {
    this._logger.info('Requesting at frame length of ' + ms + 'ms');
    this._frameMs = ms;
  } else {
    this._logger.info('Requesting native frame speed');
    this._frameMs = 0;
  }
  this._slider.setValue(this._frameMs);
};

DemoHost.prototype._loadDemo = function(demoCtr) {
  var newCanvas = goog.dom.createDom('canvas', {
    'id': 'content',
    'width': 500,
    'height': 500
  });
  goog.dom.replaceNode(newCanvas, document.getElementById('content'));

  this._demo = new demoCtr(newCanvas);
};

DemoHost.prototype._drawFrame = function() {
  this._fpsLogger.AddInterval();

  if (this._demo) {
    this._demo.frame();
  }

  this._requestFrame();
};

DemoHost.prototype._requestFrame = function() {
  if (this._frameMs) {
    goog.Timer.callOnce(this._frameFunc, this._frameMs);
  } else {
    pl.ex.requestAnimationFrame(this._frameFunc);
  }
};

DemoHost.prototype._updateHUD = function() {
  pl.DebugDiv.clear();
  this._logger.info(String(this._fpsLogger.fps));

  var func = goog.bind(this._updateHUD, this);
  goog.Timer.callOnce(func, 2000);
};
