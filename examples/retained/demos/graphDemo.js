goog.provide('demos.GraphDemo');
goog.provide('demos.GraphDemo.Node');

goog.require('demos.DemoBase');
goog.require('goog.fx.DragEvent');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.gfx');
goog.require('pl.retained.GraphElement');

/**
 * @constructor
 * @extends {demos.DemoBase}
 */
demos.GraphDemo = function(canvas) {
  var g = demos.GraphDemo._createGraph();
  var gp = new pl.GraphPhysics(g, pl.ex.getCanvasSize(canvas));
  var graphElement = new pl.retained.GraphElement(gp, canvas.width, canvas.height);

  this._dragger = new goog.fx.Dragger(canvas);
  this._dragger.addEventListener(goog.fx.Dragger.EventType.START, this._onDragStart, undefined, this);
  this._dragger.addEventListener(goog.fx.Dragger.EventType.END, this._onDragEnd, undefined, this);
  this._dragger.addEventListener(goog.fx.Dragger.EventType.DRAG, this._onDrag, undefined, this);

  goog.events.listen(canvas, goog.events.EventType.MOUSEOUT, this._onMouse, false, this);
  goog.events.listen(canvas, goog.events.EventType.MOUSEMOVE, this._onMouse, false, this);

  goog.base(this, canvas, graphElement);
  this._graphElement = graphElement;
};
goog.inherits(demos.GraphDemo, demos.DemoBase);

/**
 * @override
 */
demos.GraphDemo.prototype.frame = function() {
  var updated = goog.base(this, 'frame');
  this._updateCursor();
  return updated;
};

demos.GraphDemo.prototype._onDragStart = function(e) {
  var hits = pl.retained.mouse.markMouseOver(this.getStage(), this._mouse);
  if (hits && hits.length) {
    var node = goog.array.findRight(hits, function(e) {
      return pl.retained.GraphElement.isGraphElementNode(e);
    });
    if (node) {
      this._dragElement = node;
      return true;
    }
  }
  this._dragElement = null;
  return false;
};

demos.GraphDemo.prototype._onDrag = function(e) {
  goog.asserts.assert(this._dragElement);
  var point = new goog.math.Coordinate(e.browserEvent.offsetX, e.browserEvent.offsetY);
  this._graphElement.dragElement(this._dragElement, point);
};

demos.GraphDemo.prototype._onDragEnd = function(e) {
  this._dragElement = null;
  this._graphElement.dragElement();
};

demos.GraphDemo.prototype._onMouse = function(e) {
  if (e.type == goog.events.EventType.MOUSEOUT) {
    this._mouse = null;
  } else {
    this._mouse = new goog.math.Coordinate(e.offsetX, e.offsetY);
  }
  this.dispatchEvent(pl.retained.EventType.UPDATE);
};

demos.GraphDemo.prototype._updateCursor = function() {
  var cursor = 'auto';
  var hits = pl.retained.mouse.markMouseOver(this.getStage(), this._mouse);
  if (hits && hits.length) {
    var node = goog.array.findRight(hits, function(e) {
      return pl.retained.GraphElement.isGraphElementNode(e);
    });
    if (node) {
      cursor = 'pointer';
    }
  }
  goog.style.setStyle(this.getCanvas(), 'cursor', cursor);
};

demos.GraphDemo._createGraph = function() {
  var g = new pl.Graph();

  for (var j = 0; j < 5; j++) {
    var n = 5 + goog.math.randomInt(10);
    var nodes = [];
    for (var i = 0; i < n; i++) {
      nodes.push(new demos.GraphDemo.Node(i));
    }
    for (var i = 0; i < nodes.length; i++) {
      var adjacent = [new demos.GraphDemo.Node(i * i)];
      if ((i + 1) < nodes.length) {
        adjacent.push(nodes[i + 1]);
      }
      g.addNode(nodes[i], adjacent);
    }
  }
  return g;
};

/**
 * @constructor
 * @param {*} value
 */
demos.GraphDemo.Node = function(value) {
  this.value = value;
};

/**
 * @return {!string}
 */
demos.GraphDemo.Node.prototype.toString = function() {
  return String(this.value);
};
