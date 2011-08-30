goog.provide('pl.Behavior');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pl.Property');

/**
 * @constructor
 * @param {!Object} element
 */
pl.Behavior = function(element) {
  this._element = element;

  var behaviors = pl.Behavior._behaviorsProperty.get(element);
  if (!behaviors) {
    behaviors = [];
    pl.Behavior._behaviorsProperty.set(element, behaviors);
  }
  behaviors.push(this);
};

pl.Behavior.prototype.detach = function() {
  goog.asserts.assert(this._element);
  var behaviors = pl.Behavior._behaviorsProperty.get(this._element);
  goog.asserts.assert(goog.array.contains(behaviors, this));

  goog.array.remove(behaviors, this);

  if (behaviors.length === 0) {
    pl.Behavior._behaviorsProperty.clear(this._element);
  }

  this._element = undefined;
};

pl.Behavior._behaviorsProperty = new pl.Property('Behaviors');
