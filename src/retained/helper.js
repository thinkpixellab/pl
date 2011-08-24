goog.provide('pl.retained.Helper');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.array');
goog.require('pl.retained.Element');
goog.require('pl.ex');
goog.require('pl.gfx');

/**
 * @param {!pl.retained.Element} element
 * @returns {!Array.<!goog.math.Coordinate>}
 */
pl.retained.Helper.getTransformedCorners = function(element) {
  // corners of this element
  // clock-wise from top left
  // x0,y0,x1,y1....xn,yn
  var flat = [0, 0, element.width, 0, element.width, element.height, 0, element.height];

  var tx = goog.graphics.AffineTransform.getTranslateInstance(element.x, element.y);
  if (element.transform) {
    tx.concatenate(element.transform);
  }
  tx.transform(flat, 0, flat, 0, 4);
  return pl.ex.expandPoints(flat);
};

/**
 * @param {!pl.retained.Stage} stage
 */
pl.retained.Helper.borderElements = function(stage) {
  var ctx = stage.getContext();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pl.retained.Helper._borderElement(ctx, stage.getRoot());
  ctx.stroke();
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 */
pl.retained.Helper._borderElement = function(ctx, element) {
  var corners = pl.retained.Helper.getTransformedCorners(element);

  pl.gfx.lineToPath(ctx, corners);

  ctx.save();
  ctx.translate(element.x, element.y);
  goog.array.forEach(element.getVisualChildren(), function(e) {
    pl.retained.Helper._borderElement(ctx, e);
  });
  ctx.restore();
};
