goog.provide('demos.DemoBase');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('pl.retained.Element');
goog.require('pl.retained.EventType');
goog.require('pl.retained.Stage');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!HTMLCanvasElement} canvas
 * @param {!pl.retained.Element} rootElement
 */
demos.DemoBase = function(canvas, rootElement) {
  goog.base(this);
  this._canvas = canvas;

  /**
   * @private
   * @type {!pl.retained.Stage}
   */
  this._stage = new pl.retained.Stage(canvas, rootElement);

  this._stage.addEventListener(pl.retained.EventType.UPDATE, function(e) {
    this.dispatchEvent(pl.retained.EventType.UPDATE);
  },
  false, this);
};
goog.inherits(demos.DemoBase, goog.events.EventTarget);


/**
 * @protected
 * @return {!pl.retained.Stage}
 */
demos.DemoBase.prototype.getStage = function() {
  return this._stage;
};


/**
 * @protected
 * @return {!HTMLCanvasElement}
 */
demos.DemoBase.prototype.getCanvas = function() {
  return this._canvas;
};


/**
 * @return {boolean}
 */
demos.DemoBase.prototype.frame = function() {
  return this._stage.draw();
};

demos.DemoBase.prototype._logger = goog.debug.LogManager.getRoot();

demos.DemoBase.prototype.log = function(msg) {
  this._logger.info(msg);
};
