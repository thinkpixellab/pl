goog.provide('ModelDemo');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.style');
goog.require('pl.data.Model');

/**
 * @constructor
 */
ModelDemo = function() {
  var m = new pl.data.Model();
  alert(m.name);
};
