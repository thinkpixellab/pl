goog.provide('pl.retained.Helper');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.array');
goog.require('pl.retained.Element');
goog.require('pl.ex');

/**
 * @param {!pl.retained.Stage}
 */
pl.retained.Helper.borderElements = function(stage) {
  pl.retained.Helper._borderElement(stage.getContext(), stage.getRoot());
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 */
pl.retained.Helper._borderElement = function(ctx, element) {
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  var rect = element.getBounds();
  ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
  ctx.save();
  ctx.translate(element.x, element.y);
  goog.array.forEach(element.getVisualChildren(), function(e){
    pl.retained.Helper._borderElement(ctx, e);
  });
  ctx.restore();
};
