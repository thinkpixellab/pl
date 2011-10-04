goog.provide('pl.graphPhysics');

goog.require('goog.math.Box');
goog.require('goog.math.Size');
goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.GraphNode');

goog.scope(function() {
  var p = pl.graphPhysics;

  /**
   * @param {!pl.Graph} graph
   * @param {!function(*,!pl.GraphNode)} setter
   * @param {!goog.math.Size} stageSize
   * @return {!goog.math.Vec2}
   */
  p.initializeGraph = function(graph, setter, stageSize) {
    var box = null;
    goog.iter.forEach(graph.getNodes(), function(node) {
      var d = new pl.GraphNode(node, stageSize.width, stageSize.height);
      setter(node, d);
      box = p._boxIncludeCoordinate(d.position, box);
    });

    return p._centerForceFromBox(box, stageSize);
  };

  /**
   * @param {!pl.Graph} graph
   * @param {!goog.math.Vec2} centerForce
   * @param {number} version
   * @param {!function(*):!pl.GraphNode} mapper
   * @param {!goog.math.Size} stageSize
   * @return {boolean}
   */
  p.calculateGraph = function(graph, centerForce, version, mapper, stageSize) {
    // go over every pair of nodes and calculate the pair forces
    goog.iter.forEach(graph.getPairs(), function(pair) {
      p._calculateForces(graph, mapper(pair[0]), mapper(pair[1]), version);
    });

    var updated = false;

    var box = null;
    // now go every node and do the velocity and location math
    goog.iter.forEach(graph.getNodes(), function(node) {
      var d = mapper(node);
      d.force.add(centerForce);
      updated = p._updateNode(d) || updated;
      box = p._boxIncludeCoordinate(d.position, box);
    });

    var newForce = p._centerForceFromBox(box, stageSize);
    pl.ex.setVec(centerForce, newForce.x, newForce.y);

    if (centerForce.magnitude() < p.SignificantMagnitude) {
      pl.ex.clearVec(centerForce);
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
   * @param {!pl.Graph} graph
   * @param {!pl.GraphNode} d1
   * @param {!pl.GraphNode} d2
   * @param {number} version
   */
  p._calculateForces = function(graph, d1, d2, version) {
    d1.ensureVersion(version);
    d2.ensureVersion(version);

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
    if (graph.containsEdge(d1.node, d2.node)) {
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
