goog.provide('pl.GraphPhysics');

goog.require('goog.math.Box');
goog.require('goog.math.Size');
goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.GraphNode');

/**
 * @constructor
 * @param {!pl.Graph} graph
 * @param {!goog.math.Size} stageSize
 */
pl.GraphPhysics = function(graph, stageSize) {
  this._graph = graph;
  this._stageSize = stageSize;
  this._nodeDataProprety = new pl.Property('node_data_property');

  var box = null;
  goog.iter.forEach(graph.getNodes(), function(node) {
    var d = new pl.GraphNode(node, stageSize.width, stageSize.height);
    this._nodeDataProprety.set(node, d);
    box = pl.GraphPhysics._boxIncludeCoordinate(d.position, box);
  },
  this);

  this._centerForce = pl.GraphPhysics._centerForceFromBox(box, stageSize);
  this._version = 0;
};

goog.scope(function() {
  var p = pl.GraphPhysics;

  /**
   * @param {!Object} node
   * @return {!pl.GraphNode}
   */
  p.prototype.getData = function(node) {
    return this._nodeDataProprety.get(node);
  };

  /**
   * @return {boolean}
   */
  p.prototype.calculateGraph = function() {
    this._version++;

    // go over every pair of nodes and calculate the pair forces
    goog.iter.forEach(this._graph.getPairs(), function(pair) {
      var d1 = this.getData(pair[0]);
      var d2 = this.getData(pair[1]);
      this._calculateForces(d1, d2);
    },
    this);

    var updated = false;

    var box = null;
    // now go every node and do the velocity and location math
    goog.iter.forEach(this._graph.getNodes(), function(node) {
      var d = this.getData(node);
      d.force.add(this._centerForce);
      updated = p._updateNode(d) || updated;
      box = p._boxIncludeCoordinate(d.position, box);
    },
    this);

    var newForce = p._centerForceFromBox(box, this._stageSize);
    pl.ex.setVec(this._centerForce, newForce.x, newForce.y);

    if (this._centerForce.magnitude() < p.SignificantMagnitude) {
      pl.ex.clearVec(this._centerForce);
    } else {
      updated = true;
    }

    return updated;
  };

  /**
   * @private
   * @param {!pl.GraphNode} node
   * @return {boolean}
   */
  p._updateNode = function(node) {
    // apply drag
    node.velocity.scale(p.Inertia);

    // apply force
    node.velocity.add(node.force);

    var velocityMag = node.velocity.magnitude();

    // terminal velocity
    if (velocityMag > p.TerminalVelocity) {
      node.velocity.scale(p.TerminalVelocity / velocityMag);
      velocityMag = p.TerminalVelocity;
    }

    if (velocityMag < p.SignificantMagnitude && node.force.magnitude() < p.SignificantMagnitude) {
      pl.ex.clearVec(node.velocity);
      pl.ex.clearVec(node.force);
      return false;
    } else {
      node.position = goog.math.Coordinate.sum(node.position, node.velocity);
      return true;
    }
  };

  /**
   * @private
   * @param {!pl.GraphNode} d1
   * @param {!pl.GraphNode} d2
   */
  p.prototype._calculateForces = function(d1, d2) {
    d1.ensureVersion(this._version);
    d2.ensureVersion(this._version);

    // f will be the force between node1 and node2
    // it will be the force applied to node1
    // when applied to node2, it'll be flipped
    var delta = goog.math.Vec2.difference(d2.position, d1.position);
    var dmag = delta.magnitude();

    //
    // Mild, constant attraction
    //
    var f = delta.clone().normalize().scale(0.005);

    //
    // global repulsion 1/(d^2)
    //
    f.add(delta.clone().invert().normalize().scale(100 / (dmag * dmag)));

    // connected attraction
    if (this._graph.containsEdge(d1.node, d2.node)) {
      f.add(delta.clone().scale(dmag / 500));
    }

    d1.force.add(f);
    d2.force.subtract(f);
  };

  /**
   * @private
   * @param {goog.math.Box} box
   * @param {!goog.math.Size} otherSize
   * @return {!goog.math.Vec2}
   */
  p._centerForceFromBox = function(box, otherSize) {
    if (box) {
      var myCenter = new goog.math.Vec2(otherSize.width / 2, otherSize.height / 2);
      var boxCenter = new goog.math.Vec2((box.left + box.right) / 2, (box.top + box.bottom) / 2);
      return goog.math.Vec2.difference(myCenter, boxCenter).scale(0.0005);
    } else {
      return new goog.math.Vec2(0, 0);
    }
  };

  /**
   * @private
   * @param {!goog.math.Coordinate} coordinate
   * @param {goog.math.Box} box
   * @return {!goog.math.Box}
   */
  p._boxIncludeCoordinate = function(coordinate, box) {
    var b = new goog.math.Box(coordinate.y, coordinate.x, coordinate.y, coordinate.x);
    if (!box) {
      box = b;
    } else {
      box.expandToInclude(b);
    }
    return box;
  };

  /**
   * @const
   * @type {number}
   */
  p.TerminalVelocity = 10;

  /**
   * @const
   * @type {number}
   */
  p.SignificantMagnitude = 0.01;

  /**
   * @const
   * @type {number}
   */
  p.Inertia = 0.9;
});
