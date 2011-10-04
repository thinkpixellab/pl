goog.provide('demos.GraphDemo');
goog.provide('demos.GraphDemo.Node');

goog.require('demos.Demo');
goog.require('goog.math.Vec2');
goog.require('pl.Graph');
goog.require('pl.gfx');
goog.require('pl.retained.GraphElement');

/**
 * @constructor
 * @extends {demos.Demo}
 */
demos.GraphDemo = function(canvas) {
  var g = demos.GraphDemo._createGraph();
  var graphElement = new pl.retained.GraphElement(g, canvas.width, canvas.height);

  goog.base(this, canvas, graphElement);
};
goog.inherits(demos.GraphDemo, demos.Demo);


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
 * @param {number} value
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
