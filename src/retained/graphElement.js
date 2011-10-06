goog.provide('pl.retained.GraphElement');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Vec2');
goog.require('pl.GraphPhysics');
goog.require('pl.GraphPoint');
goog.require('pl.Property');
goog.require('pl.retained.Element');
goog.require('pl.retained.Shape');
goog.require('pl.retained.ShapeType');

// TODO/NOTE: we don't support dynamic graphs
// Don't go changing the children around, punk!
/**
 * @constructor
 * @param {!pl.Graph} graph
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @implements {pl.retained.ElementParent}
 * @extends {pl.retained.Element}
 */
pl.retained.GraphElement = function(graph, width, height, opt_enableCache) {
  goog.base(this, width, height, opt_enableCache);
  this._graph = graph;

  this._physics = new pl.GraphPhysics(this._graph, this.getSize());

  /**
    * @type {!Array.<!pl.retained.Element>}
    */
  this._children = [];

  goog.iter.forEach(this._physics.getPoints(), function(p) {
    var e = pl.retained.GraphElement._createElement(p);
    e.claim(this);
    this._children.push(e);
  }, this);
};
goog.inherits(pl.retained.GraphElement, pl.retained.Element);

/**
 * @override
 **/
pl.retained.GraphElement.prototype.update = function() {
  var updated = this._physics.calculateGraph();

  if (updated) {
    var length = this.getVisualChildCount();
    for (var i = 0; i < length; i++) {
      var element = this.getVisualChild(i);
      var aa = pl.retained.GraphElement._nodeProperty.get(element);
      var point = aa[0];
      var tx = aa[1];

      tx.setToTranslation(point.position.x, point.position.y);
    }
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
    var c1 = this._physics.getPoint(pair[0]).position;
    var c2 = this._physics.getPoint(pair[1]).position;
    pl.gfx.lineish(ctx, c2, c1);
  },
  this);

  var length = this.getVisualChildCount();
  for (var i = 0; i < length; i++) {
    var element = this.getVisualChild(i);
    element.drawInternal(ctx);
  }
};

/**
 * @override
 * @param {number} index
 * @return {!pl.retained.Element}
 */
pl.retained.GraphElement.prototype.getVisualChild = function(index) {
  return this._children[index];
};

/**
 * @override
 * @return {number}
 */
pl.retained.GraphElement.prototype.getVisualChildCount = function() {
  return this._children.length;
};

/**
 * @param {!pl.retained.Element} child
 */
pl.retained.GraphElement.prototype.childInvalidated = function(child) {
  goog.asserts.assert(this.hasVisualChild(child), "Must be the container's child");
  this.invalidateDraw();
};

/**
 * @private
 * @param {!pl.GraphPoint} point
 * @return {!pl.retained.Element}
 */
pl.retained.GraphElement._createElement = function(point) {
  var canvas = new pl.retained.Canvas(20, 20, true);

  var shape = new pl.retained.Shape(20, 20);
  shape.fillStyle = '#333';
  shape.type = pl.retained.ShapeType.ELLIPSE;
  canvas.addElement(shape);

  var text = new pl.retained.Text(String(point.node), 20, 13);
  text.isCentered = true;
  text.font = '11px Helvetica, Arial, sans-serif';
  canvas.addElement(text);
  canvas.center(text, new goog.math.Coordinate(10, 10));

  canvas.addTransform().setToTranslation(-10, -10);

  var tx = canvas.addTransform();

  pl.retained.GraphElement._nodeProperty.set(canvas, [point, tx]);

  return canvas;
};

/**
 * @private
 * @type {!pl.Property}
 */
pl.retained.GraphElement._nodeProperty = new pl.Property('graphNodeProperty');
