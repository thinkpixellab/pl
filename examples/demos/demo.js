goog.provide('demos.Demo');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.retained.Element');
goog.require('pl.retained.Stage');

/**
 * @constructor
 * @param {!HTMLCanvasElement} canvas
 * @param {!pl.retained.Element} rootElement
 */
demos.Demo = function(canvas, rootElement) {
  this._stage = new pl.retained.Stage(canvas, rootElement);
};

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
