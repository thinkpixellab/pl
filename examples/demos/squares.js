goog.provide('demos.Squares');

goog.require('demos.DemoBase');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.ex');
goog.require('pl.retained.Animation');
goog.require('pl.retained.Panel');
goog.require('pl.retained.Shape');
goog.require('pl.retained.Stage');

/**
 * @constructor
 * @extends {demos.DemoBase}
 */
demos.Squares = function(canvas) {
  this._size = new goog.math.Size(canvas.width, canvas.height);
  var canvasElement = new pl.retained.Canvas(canvas.width, canvas.height);
  goog.base(this, canvas, canvasElement);

  this._box = new goog.math.Box(0, 0, canvas.width, canvas.height);
  this._box.expand(0, 1000, 0, 1000);

  var boxSize = new goog.math.Size(50, 50);
  var position = new goog.math.Coordinate();

  this._shapes = [];
  for (var i = 0; i < 1000; i++) {
    position.x = goog.math.uniformRandom(this._box.left, this._box.right);
    position.y = goog.math.uniformRandom(this._box.top, this._box.bottom);

    var shape = demos.Squares.createShape(boxSize);
    canvasElement.addElement(shape);
    canvasElement.center(shape, position);
    this._shapes.push(shape);
  }
  this._canvasElement = canvasElement;
};
goog.inherits(demos.Squares, demos.DemoBase);

demos.Squares.prototype.frame = function() {
  goog.base(this, 'frame');
  goog.array.forEach(this._shapes, function(s) {
    var center = this._canvasElement.center(s);
    center.x += 1;
    if (center.x > this._box.right) {
      center.x = this._box.left;
    }
    this._canvasElement.center(s, center);
  }, this);
  return true;
};

demos.Squares.createShape = function(size) {
  var shape = new pl.retained.Shape(size.width, size.height);
  shape.fillStyle = pl.ex.getRandom(demos.SwapDemo._fills);

  return shape;
};

/**
 * @const
 **/
demos.Squares._fills = ['red', 'green', 'blue', 'yellow'];
