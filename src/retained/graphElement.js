goog.provide('pl.retained.GraphElement');
goog.provide('pl.retained.GraphElement._NodeData');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Vec2');
goog.require('pl.Property');
goog.require('pl.retained.Element');

// TODO/NOTE: we don't support dynamic graphs
// Don't go changing the children around, punk!
/**
 * @constructor
 * @param {!pl.Graph} graph
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @extends {pl.retained.Element}
 */
pl.retained.GraphElement = function(graph, width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);
  this._graph = graph;

  /**
   * @const
   * @private
   */
  this._property = new pl.Property('nodedate');

  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var d = new pl.retained.GraphElement._NodeData(node, width, height);
    this._property.set(node, d);
  },
  this);

  /**
   * @private
   * @type {number}
   */
  this._version = 0;
};
goog.inherits(pl.retained.GraphElement, pl.retained.Element);

/**
 * @override
 **/
pl.retained.GraphElement.prototype.update = function() {
  // version is used to make sure each iteration clears out
  // the force value for each node
  this._version++;

  // go over every pair of nodes and calculate the pair forces
  goog.iter.forEach(this._graph.getPairs(), function(pair) {
    this._calcForces.apply(this, pair);
  },
  this);

  // now go every node and do the velocity and location math
  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var d = this._property.get(node);
    d.update();
  },
  this);

  this.invalidateDraw();
  goog.base(this, 'update');
};

/**
 * @override
 * @param {!CanvasRenderingContext2D} ctx
 **/
pl.retained.GraphElement.prototype.drawOverride = function(ctx) {
  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  ctx.beginPath();
  goog.iter.forEach(this._graph.getEdges(), function(pair) {
    var c1 = this._property.get(pair[0]).position;
    var c2 = this._property.get(pair[1]).position;
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
  },
  this);
  ctx.stroke();
  ctx.restore();

  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var p = this._property.get(node).position;
    pl.gfx.fillCircle(ctx, p.x, p.y, 5, 'white');
  },
  this);
};

/**
 * @private
 */
pl.retained.GraphElement.prototype._calcForces = function(node1, node2) {
  var d1 = this._property.get(node1);
  var d2 = this._property.get(node2);
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
  var f = delta.clone().normalize();

  //
  // repultion
  //
  f.add(delta.clone().invert().normalize().scale(100 / dmag));

  // connected attraction
  if (this._graph.containsEdge(node1, node2)) {
    f.add(delta.clone().scale(0.05));
  }

  d1.force.add(f);
  d2.force.subtract(f);
};

/**
 * @private
 * @const
 * @type {number}
 */
pl.retained.GraphElement._termVelocity = 10;

/**
 * @constructor
 * @param {!Object} node
 * @param {number} width
 * @param {number} height
 */
pl.retained.GraphElement._NodeData = function(node, width, height) {
  this._node = node;
  this.position = new goog.math.Coordinate(Math.random() * width, Math.random() * height);
  this.velocity = new goog.math.Vec2(0, 0);
  this.force = new goog.math.Vec2(0, 0);
  this._version = undefined;
};

// TODO: return 'false' if things are stable?
pl.retained.GraphElement._NodeData.prototype.update = function() {
  // apply drag
  this.velocity.scale(0.9);

  // apply force
  this.velocity.add(this.force);

  // terminal velocity
  if (this.velocity.magnitude() > pl.retained.GraphElement._termVelocity) {
    this.velocity.normalize().scale(pl.retained.GraphElement._termVelocity);
  }

  // update position
  this.position = goog.math.Coordinate.sum(this.position, this.velocity);
};

/**
 * @param {number} version
 */
pl.retained.GraphElement._NodeData.prototype.ensureVersion = function(version) {
  if (this._version != version) {
    this.force.x = 0;
    this.force.y = 0;
    this._version = version;
  }
};
