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
 * @implements {pl.retained.ElementParent}
 * @extends {pl.retained.Element}
 * @param {!pl.GraphPhysics} gp
 * @param {number} width
 * @param {number} height
 * @param {boolean=} opt_enableCache
 * @param {function(*):!pl.retained.Element=} opt_factory
 */
pl.retained.GraphElement = function(gp, width, height, opt_enableCache, opt_factory) {
  goog.base(this, width, height, opt_enableCache);
  this._physics = gp;

  /**
   * @type {!Array.<!pl.retained.Element>}
   */
  this._children = [];

  goog.iter.forEach(this._physics.getPoints(), function(p) {
    var e = pl.retained.GraphElement._createElement(p, opt_factory);
    e.claim(this);
    this._children.push(e);
  },
  this);
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

  goog.iter.forEach(this._physics.getEdges(), function(pair) {
    var c1 = pair[0].position;
    var c2 = pair[1].position;
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
 * @param {!pl.retained.Element} element
 * @return {boolean}
 */
pl.retained.GraphElement.isGraphElementNode = function(element) {
  return pl.retained.GraphElement._nodeProperty.isSet(element);
};

/**
 * @param {!pl.retained.Element=} opt_element
 * @param {!goog.math.Coordinate=} opt_coordinate
 */
pl.retained.GraphElement.prototype.dragElement = function(opt_element, opt_coordinate) {
  if (opt_element) {
    var e = opt_element;
    var c = opt_coordinate;
    goog.asserts.assert(pl.retained.GraphElement.isGraphElementNode(e));
    goog.asserts.assert(c);
    var aa = pl.retained.GraphElement._nodeProperty.get(e);
    this._physics.dragPoint(aa[0], c);
  } else {
    this._physics.dragPoint();
  }
};

/**
 * @private
 * @param {*} nodeData
 * @return {!pl.retained.Element}
 */
pl.retained.GraphElement._defaultElementFactory = function(nodeData) {
  var size = new goog.math.Size(20, 20);
  var canvas = new pl.retained.Canvas(size.width, size.height, true);

  var shape = new pl.retained.Shape(size.width, size.height);
  shape.fillStyle = '#333';
  shape.type = pl.retained.ShapeType.ELLIPSE;
  canvas.addElement(shape);

  var text = new pl.retained.Text(String(nodeData), size.width, 13);
  text.isCentered = true;
  text.font = '11px Helvetica, Arial, sans-serif';
  canvas.addElement(text);
  canvas.center(text, new goog.math.Coordinate(size.width / 2, size.height / 2));
  canvas.addTransform().setToTranslation(size.width / -2, size.height / -2);

  return canvas;
};

/**
 * @private
 * @param {!pl.GraphPoint} point
 * @param {function(*):!pl.retained.Element=} opt_factory
 * @return {!pl.retained.Element}
 */
pl.retained.GraphElement._createElement = function(point, opt_factory) {
  var factory = opt_factory || pl.retained.GraphElement._defaultElementFactory;
  var canvas = factory(point.node);
  var tx = canvas.addTransform();
  pl.retained.GraphElement._nodeProperty.set(canvas, [point, tx]);
  return canvas;
};

/**
 * @private
 * @type {!pl.Property}
 */
pl.retained.GraphElement._nodeProperty = new pl.Property('graphNodeProperty');
