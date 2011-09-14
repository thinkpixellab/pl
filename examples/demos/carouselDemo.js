goog.provide('demos.CarouselDemo');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('pl.retained.Animation');
goog.require('pl.retained.CarouselContainer');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.helper');


/**
 * @constructor
 */
demos.CarouselDemo = function(canvas) {
  this._mouse = null;

  goog.events.listen(canvas, goog.events.EventType.MOUSEOUT, this._onMouseOut, false, this);
  goog.events.listen(canvas, goog.events.EventType.MOUSEMOVE, this._onMouseMove, false, this);

  var container = new pl.retained.CarouselContainer(500, 500);
  container.radius(new goog.math.Size(190, 20));

  for (var i = 0; i < 10; i++) {

    var text = new pl.retained.Text('Dude - ' + i, 150, 30);
    text.fillStyle = i % 2 ? '#FFF' : '#DDD';
    text.textFillStyle = 'black';
    container.addElement(text);
  }

  this._stage = new pl.retained.Stage(canvas, container);

  var frameCount = 200;
  var animation = new pl.retained.Animation(container, frameCount, function(i, element) {
    element.angle(i * Math.PI * 2 / frameCount);
  });
};

demos.CarouselDemo.prototype.frame = function() {
  this._stage.draw();

  if (this._mouse) {
    var ctx = this._stage.getContext();
    pl.retained.helper.borderHitTest(this._stage, this._mouse.x, this._mouse.y);
  }
};

demos.CarouselDemo.prototype._onMouseMove = function(e) {
  this._mouse = new goog.math.Coordinate(e.offsetX, e.offsetY);
};

demos.CarouselDemo.prototype._onMouseOut = function(e) {
  this._mouse = null;
};
