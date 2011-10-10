goog.provide('pl.GraphPhysics');

goog.require('goog.math.Box');
goog.require('goog.math.Size');
goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.GraphPoint');

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
    var d = new pl.GraphPoint(node, stageSize.width, stageSize.height);
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
   * @return {!pl.GraphPoint}
   */
  p.prototype.getPoint = function(node) {
    return this._nodeDataProprety.get(node);
  };

  /**
   * @return {!goog.iter.Iterable}
   */
  p.prototype.getPoints = function() {
    return goog.iter.map(this._graph.getNodes(), goog.bind(this.getPoint, this));
  };

  p.prototype.getEdges = function() {
    return goog.iter.map(this._graph.getEdges(), goog.bind(function(node) {
      return goog.array.map(node, goog.bind(this.getPoint, this));
    }, this));
  };

  /**
   * @return {boolean}
   */
  p.prototype.calculateGraph = function() {
    this._version++;

    // go over every pair of nodes and calculate the pair forces
    goog.iter.forEach(this._graph.getPairs(), function(pair) {
      var d1 = this.getPoint(pair[0]);
      var d2 = this.getPoint(pair[1]);
      this._calculateForces(d1, d2);
    },
    this);

    var updated = false;

    var box = null;
    // now go every node and do the velocity and location math
    goog.iter.forEach(this._graph.getNodes(), function(node) {
      var d = this.getPoint(node);
      d.force.add(this._centerForce);
      this._calcDrag(d);
      updated = this._updateNode(d) || updated;
      box = p._boxIncludeCoordinate(d.position, box);
    },
    this);

    var newForce = p._centerForceFromBox(box, this._stageSize);
    pl.ex.setVec(this._centerForce, newForce.x, newForce.y);

    if (this._centerForce.magnitude() < this.SignificantMagnitude) {
      pl.ex.clearVec(this._centerForce);
    } else {
      updated = true;
    }

    return updated;
  };

  /**
   * @param {!pl.GraphPoint=} opt_point
   * @param {!goog.math.Coordinate=} opt_coordinate
   */
  p.prototype.dragPoint = function(opt_point, opt_coordinate) {
    if (opt_point) {
      var p = opt_point;
      var c = opt_coordinate;
      this._draggingPoint = p;
      this._draggingCoordinate = c;
    }
    else {
      this._draggingPoint = null;
      this._draggingCoordinate = null;
    }
  };

  /**
   * @private
   * @param {!pl.GraphPoint} point
   */
  p.prototype._calcDrag = function(point) {
    if (point == this._draggingPoint) {
      var delta = goog.math.Vec2.difference(this._draggingCoordinate, point.position);
      delta.scale(delta.magnitude() * 0.1);
      point.force.add(delta);
    }
  };

  /**
   * @private
   * @param {!pl.GraphPoint} d1
   * @param {!pl.GraphPoint} d2
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
    var f = delta.clone().normalize().scale(this.GlobalAttraction);

    //
    // global repulsion 1/(d^2)
    //
    f.add(delta.clone().invert().normalize().scale(this.RepulsionFactor / (dmag * dmag)));

    // connected attraction
    if (this._graph.containsEdge(d1.node, d2.node)) {
      f.add(delta.clone().scale(dmag * this.ConnectionAttraction));
    }

    d1.force.add(f);
    d2.force.subtract(f);
  };

  /**
   * @private
   * @param {!pl.GraphPoint} node
   * @return {boolean}
   */
  p.prototype._updateNode = function(node) {
    // apply drag
    node.velocity.scale(this.Inertia);

    // apply force
    node.velocity.add(node.force);

    var velocityMag = node.velocity.magnitude();

    // terminal velocity
    if (velocityMag > this.TerminalVelocity) {
      node.velocity.scale(this.TerminalVelocity / velocityMag);
      velocityMag = this.TerminalVelocity;
    }

    if (velocityMag < this.SignificantMagnitude && node.force.magnitude() < this.SignificantMagnitude) {
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
   * @type {number}
   */
  p.prototype.TerminalVelocity = 10;

  /**
   * @type {number}
   */
  p.prototype.SignificantMagnitude = 0.01;

  /**
   * @type {number}
   */
  p.prototype.Inertia = 0.9;

  /**
   * @type {number}
   */
  p.prototype.GlobalAttraction = 0.005;

  /**
   * @type {number}
   */
  p.prototype.RepulsionFactor = 300;

  /**
   * @type {number}
   */
  p.prototype.ConnectionAttraction = 0.002;
});
