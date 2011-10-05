goog.provide('pl.retained.GraphElement');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Vec2');
goog.require('pl.GraphNode');
goog.require('pl.GraphPhysics');
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

  this._physics = new pl.GraphPhysics(this._graph, this.getSize());
};
goog.inherits(pl.retained.GraphElement, pl.retained.Element);

/**
 * @override
 **/
pl.retained.GraphElement.prototype.update = function() {
  var updated = this._physics.calculateGraph();

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
    var c1 = this._physics.getData(pair[0]).position;
    var c2 = this._physics.getData(pair[1]).position;
    pl.gfx.lineish(ctx, c2, c1);
  },
  this);

  ctx.font = '11px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  goog.iter.forEach(this._graph.getNodes(), function(node) {
    var p = this._physics.getData(node).position;
    pl.gfx.fillCircle(ctx, p.x, p.y, 10, '#333');
    ctx.fillStyle = 'white';
    ctx.fillText(String(node), p.x, p.y + 3);
  },
  this);
};

pl.retained.GraphElement.prototype.createElement = function(data) {
  var canvas = new pl.retained.Canvas(20, 20, true);

  var shape = new pl.retained.Shape(20, 20);
  shape.fillStyle = 'gray';
  canvas.addElement(shape);

  var text = new pl.retained.Text(String(data), 20, 20);
  text.isCentered = true;
  canvas.addElement(text);

  return canvas;
};
