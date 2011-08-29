goog.provide('demos.Swap');

goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.Container');
goog.require('pl.retained.Animation');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

/**
 * @constructor
 */
demos.Swap = function(canvas) {
  var text = new pl.retained.Text("Swap!", 400, 400);
  text.fillStyle = 'blue';
  text.multiLine = true;

  var container = new pl.retained.Container(400, 400);
  container.addElement(text);

  this._stage = new pl.retained.Stage(canvas, container);

  this._animation = new pl.retained.Animation(container, 100, function(i, element) {
    if (i === 0) {
      element.parentTransform = new goog.graphics.AffineTransform();
    }
    var transform = element.parentTransform;
    var scale = 0.9;
    transform.translate(200 / scale - 200, 200 / scale - 200);
    transform.scale(scale, scale);
  });
};

demos.Swap.description = 'Swap';

demos.Swap.prototype.frame = function(){
  this._animation.tick();
  this._stage.draw();
};
