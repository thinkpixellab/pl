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

  var setter = goog.bind(pl.Property.prototype.set, this._nodeDataProprety);

  this._centerForce = pl.graphPhysics.initializeGraph(this._graph, setter, this.getSize());

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

  var updated = pl.graphPhysics.calculateGraph(this._graph, this._centerForce, this._version, mapper, this.getSize());

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
  ctx.fillStyle = '#222';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 1;

  goog.iter.forEach(this._graph.getEdges(), function(pair) {
    var c1 = this._nodeDataProprety.get(pair[0]).position;
    var c2 = this._nodeDataProprety.get(pair[1]).position;
    pl.gfx.lineish(ctx, c2, c1);
  },
  this);

  ctx.font = '11px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var p = this._nodeDataProprety.get(node).position;
    pl.gfx.fillCircle(ctx, p.x, p.y, 10, '#333');
    ctx.fillStyle = 'white';
    ctx.fillText(String(node), p.x, p.y + 3);
  },
  this);
};
