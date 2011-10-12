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
  gp.Inertia = 0.95;
  gp.GlobalAttraction = 0;
  gp.RepulsionFactor = 1500;
  gp.ConnectionAttraction = 0.001 / 10;
  var graphElement = new pl.retained.GraphElement(gp, canvas.width, canvas.height, undefined, demos.GraphDemo._factory);

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
  var map = demos.GraphDemo._populateMap('pl.Graph');

  var realMap = {};
  goog.object.forEach(map, function(element, key, map) {
    realMap[key] = new demos.GraphDemo.Node(key);
  });

  var g = new pl.Graph();
  goog.object.forEach(map, function(element, key, map) {
    var adj = goog.array.map(element['requirements'], function(adjacentName) {
      return realMap[adjacentName];
    });
    g.addNode(realMap[key], adj);
  });

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

/**
 * @private
 * @param {*} node
 * @return {!pl.retained.Element}
 */
demos.GraphDemo._factory = function(node) {
  var size = new goog.math.Size(150, 25);
  var canvas = new pl.retained.Canvas(size.width, size.height, true);

  var shape = new pl.retained.Shape(size.width, size.height);
  shape.fillStyle = '#333';
  shape.type = pl.retained.ShapeType.ELLIPSE;
  canvas.addElement(shape);

  var text = new pl.retained.Text(String(node), size.width, 15);
  text.isCentered = true;
  text.font = '11px Helvetica, Arial, sans-serif';
  canvas.addElement(text);
  canvas.center(text, new goog.math.Coordinate(size.width / 2, size.height / 2));

  canvas.addTransform().setToTranslation(size.width / -2, size.height / -2);
  return canvas;
};

demos.GraphDemo._populateMap = function(name) {
  var map = {};
  demos.GraphDemo._populateMapCore(name, map);
  return map;
};

demos.GraphDemo._populateMapCore = function(name, map) {
  var node = goog.object.get(map, name);
  if (!node) {
    var deps = goog.dependencies_;
    var path = deps.nameToPath[name];
    var requires = goog.object.getKeys(deps.requires[path]);
    var prunedRequires = goog.array.clone(requires);
    var trans = [];
    goog.array.forEach(requires, function(r) {
      var rr = demos.GraphDemo._populateMapCore(r, map);
      goog.array.forEach(rr, function(d) {
        goog.array.remove(prunedRequires, d);
      });
      goog.array.extend(trans, rr);
    });
    goog.array.extend(trans, prunedRequires);
    goog.array.removeDuplicates(trans);
    node = map[name] = {
      'name': name,
      'requirements': prunedRequires,
      'trans': trans
    };
  }
  return node['trans'];
};
