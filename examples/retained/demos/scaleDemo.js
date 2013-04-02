goog.provide('demos.ScaleDemo');

goog.require('goog.math.Vec2');
goog.require('pl.gfx');
goog.require('pl.retained.Animation');
goog.require('pl.retained.Image');
goog.require('pl.retained.Stage');



/**
 * @constructor
 * @extends {demos.DemoBase}
 */
demos.ScaleDemo = function(canvas) {
  var img = DemoHost.images.get('pixellab');

  var image = new pl.retained.Image(img, img.width, img.height);

  var vec = new goog.math.Vec2(canvas.width - image.width, canvas.height - image.height);
  vec.scale(0.5);
  var tx = image.addTransform().setToTranslation(vec.x, vec.y);

  goog.base(this, canvas, image);

  var frames = 50;

  var animation = new pl.retained.Animation(image, frames, function(i, element) {
    var scale = 1 - i / frames;
    pl.gfx.affineOffsetScale(tx, scale, scale, element.width / 2, element.height / 2);
    tx.preTranslate(vec.x, vec.y);
    element.invalidateDraw();
  });
};
goog.inherits(demos.ScaleDemo, demos.DemoBase);
