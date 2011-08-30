goog.provide('demos.ScaleDemo');

goog.require('goog.Timer');
goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Vec2');
goog.require('pl.ex');
goog.require('pl.gfx');
goog.require('pl.retained.Animation');
goog.require('pl.retained.CarouselContainer');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.helper');


/**
 * @constructor
 */
demos.ScaleDemo = function(canvas) {
  var container = new pl.retained.Text('Dude', 300, 50);
  container.fillStyle = 'white';
  container.textFillStyle = 'black';
  pl.retained.helper.center(container, new goog.math.Coordinate(250, 250));

  this._stage = new pl.retained.Stage(canvas, container);

  var frames = 50;

  var animation = new pl.retained.Animation(container, frames, function(i, element) {
    var scale = 1 - i / frames;
    pl.gfx.affineOffsetScale(element.parentTransform, scale, scale, element.width / 2, element.height / 2);
    element.invalidateDraw();
  });
};

demos.ScaleDemo.description = 'Scale';

demos.ScaleDemo.prototype.frame = function() {
  this._stage.draw();
};
