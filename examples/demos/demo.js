goog.provide('demos.demo');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @interface
 * @param {!HTMLCanvasElement} canvas
 */
demos.demo = function(canvas) {};

/**
 * @return {boolean}
 */
demos.demo.prototype.frame = function() { };
