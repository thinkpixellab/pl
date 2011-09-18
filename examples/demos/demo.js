goog.provide('demos.Demo');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @interface
 * @param {!HTMLCanvasElement} canvas
 */
demos.Demo = function(canvas) {};

/**
 * @return {boolean}
 */
demos.Demo.prototype.frame = function() { };
