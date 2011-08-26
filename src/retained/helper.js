goog.provide('pl.retained.helper');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.ex');
goog.require('pl.gfx');
goog.require('pl.retained.Element');
goog.require('pl.retained.mouse');

/**
 * @param {!pl.retained.Element} element
 * @return {!goog.graphics.AffineTransform}
 */
pl.retained.helper.getTransform = function(element) {
  var tx = goog.graphics.AffineTransform.getTranslateInstance(element.x, element.y);
  if (element.transform) {
    tx.concatenate(element.transform);
  }
  return tx;
};

/**
 * @param {!pl.retained.Stage} stage
 */
pl.retained.helper.borderElements = function(stage) {
  var ctx = stage.getContext();
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pl.retained.helper._borderElement(ctx, stage.getRoot());
  ctx.stroke();
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 * @param {boolean=} opt_excludeChildren
 */
pl.retained.helper._borderElement = function(ctx, element, opt_excludeChildren) {
  var tx = pl.retained.helper.getTransform(element);
  pl.gfx.transform(ctx, tx);
  if (pl.retained.mouse.IsMouseDirectlyOverProperty.get(element)) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.strokeRect(0, 0, element.width, element.height);
    ctx.restore();
  } else if (pl.retained.mouse.IsMouseOverProperty.get(element)) {
    ctx.save();
    ctx.strokeStyle = 'pink';
    ctx.strokeRect(0, 0, element.width, element.height);
    ctx.restore();
  } else {
    ctx.strokeRect(0, 0, element.width, element.height);
  }

  if (!opt_excludeChildren) {
    goog.array.forEach(element.getVisualChildren(), function(e) {
      ctx.save();
      pl.retained.helper._borderElement(ctx, e);
      ctx.restore();
    });
  }
};

/**
 * @param {!pl.retained.Stage} stage
 * @param {number} x
 * @param {number} y
 */
pl.retained.helper.hitTest = function(stage, x, y) {
  return pl.retained.helper._hitTest(stage.getRoot(), x, y);
};

/**
 * @param {!pl.retained.Element} element
 * @param {number} x
 * @param {number} y
 */
pl.retained.helper._hitTest = function(element, x, y) {
  var point = [x, y];
  pl.retained.helper.getTransform(element).createInverse().transform(point, 0, point, 0, 1);

  var c = new goog.math.Coordinate(point[0], point[1]);
  var bounds = new goog.math.Rect(0, 0, element.width, element.height);

  var hits = [];
  if (bounds.contains(c)) {

    var children = element.getVisualChildren(true);

    for (var i = 0; i < children.length; i++) {
      var e = children[i];
      hits = pl.retained.helper._hitTest(e, c.x, c.y);
      if (hits.length) {
        break;
      }
    }
    goog.array.insertAt(hits, element);
    return hits;
  } else {
    return [];
  }
};

/**
 * @param {!pl.retained.Stage} stage
 */
pl.retained.helper.borderHitTest = function(stage, x, y) {
  var ctx = stage.getContext();

  var hits = pl.retained.helper.hitTest(stage, x, y);
  if (hits.length) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,255,0.5)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    goog.array.forEach(hits, function(e) {
      pl.retained.helper._borderElement(ctx, e, true);
    });
    ctx.stroke();
    ctx.restore();
  }
};
