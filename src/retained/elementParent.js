goog.provide('pl.retained.ElementParent');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @interface
 */
pl.retained.ElementParent = function() {};
goog.inherits(pl.retained.Container, pl.retained.Element);

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.ElementParent.prototype.childInvalidated = function(child) { };
