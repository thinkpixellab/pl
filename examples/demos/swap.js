goog.provide('demos.Swap');

goog.require('goog.Timer');
goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Vec2');
goog.require('pl.DebugDiv');
goog.require('pl.FpsLogger');
goog.require('pl.ex');
goog.require('pl.retained.Animation');
goog.require('pl.retained.Container');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');

/**
 * @constructor
 */
demos.Swap = function(canvas) {

  var container = new pl.retained.Container(400, 400);

  this._stage = new pl.retained.Stage(canvas, container);


  this._count = 0;
};

demos.Swap.description = 'Swap';

demos.Swap.prototype.frame = function() {
  this._stage.draw();

  if (this._count === 0) {
    var text = demos.Swap.createText();
    this._stage._element.insertAt(text);
  }
  this._count++;
  this._count = this._count % 20;

};

demos.Swap.createText = function() {
  var text = new pl.retained.Text('Swap!', 400, 400);
  text.parentTransform = new goog.graphics.AffineTransform();
  text.fillStyle = 'blue';
  text.multiLine = true;

  var frameCount = 100;
  var animation = new pl.retained.Animation(text, frameCount, function(i, element) {
    var ratio = (frameCount - i) / frameCount;
    pl.gfx.affineOffsetScale(element.parentTransform, ratio, ratio, element.width / 2, element.height / 2);
    element.alpha = ratio;
    element.invalidateDraw();
  },
  function(element) {
    element._parent.remove(element);
  });

  return text;
};
