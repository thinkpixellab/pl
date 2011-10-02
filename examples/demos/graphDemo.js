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
  var g = new pl.Graph();

  var n = 10;
  var i;

  var nodes = [];
  for (i = 0; i < n; i++) {
    nodes.push(new demos.GraphDemo.Node(i));
  }
  for (i = 0; i < nodes.length; i++) {
    var j = (i + 1) % nodes.length;
    g.addNode(nodes[i], [nodes[j]]);
  }

  var graphElement = new pl.retained.GraphElement(g, 500, 500);

  goog.base(this, canvas, graphElement);
};
goog.inherits(demos.GraphDemo, demos.Demo);

/**
 * @override
 */
demos.GraphDemo.prototype.frame = function() {
  //console.log('tick');
  return goog.base(this, 'frame');
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
