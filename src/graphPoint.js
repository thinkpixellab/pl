goog.provide('pl.GraphPoint');

goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.ex');


/**
 * @constructor
 * @param {!Object} node
 * @param {number} width
 * @param {number} height
 */
pl.GraphPoint = function(node, width, height) {
  this.node = node;
  this.position = new goog.math.Coordinate(Math.random() * width, Math.random() * height);
  this.velocity = new goog.math.Vec2(0, 0);
  this.force = new goog.math.Vec2(0, 0);
  this._version = undefined;
};

/**
 * @param {number} version
 */
pl.GraphPoint.prototype.ensureVersion = function(version) {
  if (this._version != version) {
    pl.ex.clearVec(this.force);
    this._version = version;
  }
};
