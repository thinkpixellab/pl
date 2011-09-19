goog.provide('demos.Demo');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.retained.Element');
goog.require('pl.retained.EventType');
goog.require('pl.retained.Stage');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!HTMLCanvasElement} canvas
 * @param {!pl.retained.Element} rootElement
 */
demos.Demo = function(canvas, rootElement) {
  goog.base(this);
  this._stage = new pl.retained.Stage(canvas, rootElement);

  this._stage.addEventListener(pl.retained.EventType.UPDATE, function(e) {
    this.dispatchEvent(pl.retained.EventType.UPDATE);
  },
  false, this);
};
goog.inherits(demos.Demo, goog.events.EventTarget);

/**
 * @protected
 * @return {!pl.retained.Stage}
 */
demos.Demo.prototype.getStage = function() {
  return this._stage;
};

/**
 * @return {boolean}
 */
demos.Demo.prototype.frame = function() {
  return this._stage.draw();
};
