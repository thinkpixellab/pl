goog.provide('pl.Graph');

goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');
goog.require('pl.ex');

/**
 * @constructor
 */
pl.Graph = function() {
  /**
   * @private
   */
  this._set = new goog.structs.Set();

  /**
   * @private
   */
  this._adjacents = new goog.structs.Map();
};

/**
 * @param {!Object} node
 * @param {Array.<!Object>=} opt_adjacents
 */
pl.Graph.prototype.addNode = function(node, opt_adjacents) {
  goog.asserts.assert(goog.isObject(node));
  goog.asserts.assert(!opt_adjacents || !goog.array.contains(opt_adjacents, node));
  this._set.add(node);

  if (opt_adjacents) {
    goog.array.forEach(opt_adjacents, function(adjNode) {
      goog.asserts.assert(goog.isObject(adjNode));
      this._set.add(adjNode);

      this._ensureEdgeCore(node, adjNode);
      this._ensureEdgeCore(adjNode, node);
    },
    this);
  }
};

/**
 * @param {!Object} node
 * @return {boolean}
 */
pl.Graph.prototype.containsNode = function(node) {
  return this._set.contains(node);
};

/**
 * @param {!Object} node1
 * @param {!Object} node2
 * @return {boolean}
 */
pl.Graph.prototype.containsEdge = function(node1, node2) {
  goog.asserts.assert(this.containsNode(node1));
  goog.asserts.assert(this.containsNode(node2));

  var set = this._adjacents.get(goog.getUid(node1));

  return set && set.contains(node2);
};

/**
 * @param {!Object} node
 * @return {!goog.iter.Iterable}
 */
pl.Graph.prototype.getAdjacents = function(node) {
  goog.asserts.assert(this.containsNode(node));
  var set = this._adjacents.get(goog.getUid(node));
  if (set) {
    return set.__iterator__();
  } else {
    return [];
  }
};

/**
 * @return {!goog.iter.Iterable}
 */
pl.Graph.prototype.getNodes = function() {
  return this._set.__iterator__();
};

/**
 * @return {number}
 */
pl.Graph.prototype.getNodeCount = function() {
  return this._set.getCount();
};

/**
 * @return {!goog.iter.Iterator} each element is an array with 2 nodes
    no pairs are repeated
    the elements are order by Uid -> smallest first.
 */
pl.Graph.prototype.getPairs = function() {
  var _this = this;
  return pl.ex.selectMany(this._set.__iterator__(), function(node1) {
    return goog.iter.filter(_this._set.__iterator__(), function(node2) {
      var id1 = goog.getUid(/** @type {!Object} */ (node1));
      var id2 = goog.getUid(/** @type {!Object} */ (node2));
      return id1 < id2;
    });
  });
};

/**
 * @return {!goog.iter.Iterator} each element is an array with 2 nodes
    no pairs are repeated
    the elements are order by Uid -> smallest first.
 */
pl.Graph.prototype.getEdges = function() {
  var _this = this;
  return pl.ex.selectMany(this._set.__iterator__(), function(node1) {
    return goog.iter.filter(_this.getAdjacents(node1), function(node2) {
      var id1 = goog.getUid(/** @type {!Object} */ (node1));
      var id2 = goog.getUid(/** @type {!Object} */ (node2));
      return id1 < id2;
    });
  });
};

/**
 * @return {number}
 */
pl.Graph.prototype.getEdgeCount = function() {
  return pl.ex.count(this.getEdges());
};

// TODO: implement remove
// ...and make sure attached properties are removed!

/**
 * @private
 * @param {!Object} fromNode
 * @param {!Object} toNode
 */
pl.Graph.prototype._ensureEdgeCore = function(fromNode, toNode) {
  var adjSet = this._adjacents.get(goog.getUid(fromNode));
  if (!adjSet) {
    this._adjacents.set(goog.getUid(fromNode), adjSet = new goog.structs.Set());
  }
  adjSet.add(toNode);
};
