goog.provide('pl.PairTable');

goog.require('goog.asserts');
goog.require('goog.structs.Map');

/**
 * @constructor
 */
pl.PairTable = function(opt_defaultFactory) {
  /**
   * @type {goog.structs.Map}
   */
  this._pairs = null;

  this._defaultFactory = opt_defaultFactory;
};

pl.PairTable.prototype.set = function(node1, node2, value) {
  var key = pl.PairTable._getKey(node1, node2);
  this._ensureMap();
  this._pairs.set(key, value);
};

pl.PairTable.prototype.get = function(node1, node2) {
  var key = pl.PairTable._getKey(node1, node2);
  this._ensureMap();

  var value = this._pairs.get(key, pl.PairTable._unsetValue);
  if (value == pl.PairTable._unsetValue && this._defaultFactory) {
    this._pairs.set(key, value = this._defaultFactory());
  }
  return value;
};

pl.PairTable.prototype.clear = function() {
  this._pairs = null;
};

pl.PairTable.prototype._ensureMap = function() {
  if (!this._pairs) {
    this._pairs = new goog.structs.Map();
  }
};

pl.PairTable._getKey = function(node1, node2) {
  goog.asserts.assert(goog.isObject(node1));
  goog.asserts.assert(goog.isObject(node2));
  var id1 = goog.getUid(node1);
  var id2 = goog.getUid(node2);
  goog.asserts.assert(id1 !== id2);
  return [Math.min(id1, id2), Math.max(id1, id2)].join(',');
};

/**
 * @const
 * @private
 */
pl.PairTable._unsetValue = {};
