goog.provide('demos.NavLayerDemo');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('pl.retained.Canvas');
goog.require('pl.retained.NavLayer');
goog.require('pl.retained.Shape');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.mouse');

/**
 * @constructor
 */
demos.NavLayerDemo = function(canvas) {
  this._nav = new pl.retained.NavLayer(canvas.width, canvas.height);

  this._stage = new pl.retained.Stage(canvas, this._nav);

  goog.events.listen(canvas, goog.events.EventType.MOUSEDOWN, this._onMouseDown, false, this);
  this._count = 0;
  this._forward(new goog.graphics.AffineTransform());
};

demos.NavLayerDemo.prototype.frame = function() {
  this._stage.draw();
};

demos.NavLayerDemo.prototype._forward = function(tx) {
  var demoElement = demos.NavLayerDemo._getX(++this._count);

  this._nav.forward(demoElement, tx);
};

demos.NavLayerDemo.prototype._onMouseDown = function(e) {
  e.stopPropagation();

  this._lastMouse = new goog.math.Coordinate(e.offsetX, e.offsetY);
  var hits = pl.retained.mouse.markMouseOver(this._stage, this._lastMouse);

  if (hits && hits.length) {
    var last = hits[hits.length - 1];

    var widthRatio = last.width / 300;
    var heightRatio = last.height / 300;

    var lastTx = last.getTransform();
    var x = lastTx.getTranslateX();
    var y = lastTx.getTranslateY();

    var tx = (new goog.graphics.AffineTransform()).translate(x, y).scale(widthRatio, heightRatio);

    this._forward(tx);
  }
};

demos.NavLayerDemo._getX = function(count) {
  var container = new pl.retained.Canvas(300, 300);

  var back = new pl.retained.Shape(300, 300);
  back.fillStyle = '#333';
  back.alpha = 0.5;
  container.addElement(back);

  var text = new pl.retained.Text(String(count), 100, 100);
  text.isCentered = true;
  text.fillStyle = 'white';
  text.textFillStyle = 'black';

  container.addElement(text);
  container.topLeft(text, new goog.math.Coordinate(100, 100));

  var corner;

  // top left
  corner = new pl.retained.Shape(100, 100);
  corner.fillStyle = 'red';
  container.addElement(corner);
  container.topLeft(corner, new goog.math.Coordinate(0, 0));

  // top right
  corner = new pl.retained.Shape(100, 100);
  corner.fillStyle = 'green';
  container.addElement(corner);
  container.topLeft(corner, new goog.math.Coordinate(200, 0));

  // bottom left
  corner = new pl.retained.Shape(100, 100);
  corner.fillStyle = 'blue';
  container.addElement(corner);
  container.topLeft(corner, new goog.math.Coordinate(0, 200));

  // bottom right
  corner = new pl.retained.Shape(100, 100);
  corner.fillStyle = 'yellow';
  container.addElement(corner);
  container.topLeft(corner, new goog.math.Coordinate(200, 200));

  return container;
};
