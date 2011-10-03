goog.provide('pl.retained.GraphElement');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Vec2');
goog.require('pl.GraphNode');
goog.require('pl.Property');
goog.require('pl.graphPhysics');
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
  this._nodeDataProprety = new pl.Property('node_data_property');

  var box = null;
  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var d = new pl.GraphNode(node, width, height);
    this._nodeDataProprety.set(node, d);
    box = pl.graphPhysics.BoxIncludeCoordinate(d.position, box);
  },
  this);

  this._centerForce = pl.graphPhysics.CenterForceFromBox(box, this.getSize());

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

  var mapper = goog.bind(pl.Property.prototype.get, this._nodeDataProprety);

  var updated = pl.graphPhysics.CalculateGraph(this._graph, this._centerForce, this._version, mapper, this.getSize());

  if (updated) {
    this.invalidateDraw();
  }
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
    var c1 = this._nodeDataProprety.get(pair[0]).position;
    var c2 = this._nodeDataProprety.get(pair[1]).position;
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
  },
  this);
  ctx.stroke();
  ctx.restore();

  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var p = this._nodeDataProprety.get(node).position;
    pl.gfx.fillCircle(ctx, p.x, p.y, 5, 'white');
  },
  this);
};
