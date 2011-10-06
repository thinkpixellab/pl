goog.provide('pl.retained.helper');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.ex');
goog.require('pl.gfx');
goog.require('pl.retained.Element');
goog.require('pl.retained.mouse');

/**
 * @param {!pl.retained.Stage} stage
 */
pl.retained.helper.borderElements = function(stage) {
  var ctx = stage.getContext();
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 5;
  ctx.beginPath();
  pl.retained.helper._borderElement(ctx, stage.getRoot());
  ctx.stroke();
  ctx.restore();
};

/**
 * @private
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 * @param {boolean=} opt_excludeChildren
 * @param {function(!pl.retained.Element):boolean=} opt_filter
 */
pl.retained.helper._borderElement = function(ctx, element, opt_excludeChildren, opt_filter) {
  pl.gfx.transform(ctx, element.getTransform());

  if (!opt_filter || opt_filter(element)) {
    pl.retained.helper._borderElementCore(ctx, element);
  }

  if (!opt_excludeChildren) {
    for (var i = 0; i < element.getVisualChildCount(); i++) {
      var e = element.getVisualChild(i);
      ctx.save();
      pl.retained.helper._borderElement(ctx, e, false, opt_filter);
      ctx.restore();
    }
  }
};

/**
 * @private
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 */
pl.retained.helper._borderElementCore = function(ctx, element) {
  if (pl.retained.mouse.IsMouseDirectlyOverProperty.get(element)) {
    ctx.strokeStyle = 'red';
  } else if (pl.retained.mouse.IsMouseOverProperty.get(element)) {
    ctx.strokeStyle = 'pink';
  } else if (element.cacheEnabled) {
    ctx.strokeStyle = 'yellow';
  } else {
    ctx.strokeStyle = 'blue';
  }
  ctx.strokeRect(0, 0, element.width, element.height);
};

/**
 * @param {!pl.retained.Stage} stage
 * @param {!goog.math.Coordinate} point
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.helper.hitTest = function(stage, point) {
  return pl.retained.helper._hitTest(stage.getRoot(), point);
};

/**
 * @private
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate} point
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.helper._hitTest = function(element, point) {
  point = pl.retained.helper.transformPointGlobalToLocal(element, point);

  var bounds = new goog.math.Rect(0, 0, element.width, element.height);

  var hits = [];
  if (bounds.contains(point)) {

    var length = element.getVisualChildCount();
    for (var i = 0; i < length; i++) {
      var e = element.getVisualChild(length - 1 - i);
      hits = pl.retained.helper._hitTest(e, point);
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
 * @param {!goog.math.Coordinate} point
 */
pl.retained.helper.borderHitTest = function(stage, point) {
  var ctx = stage.getContext();

  var hits = pl.retained.helper.hitTest(stage, point);
  if (hits.length) {
    ctx.save();
    ctx.lineWidth = 2;

    ctx.beginPath();
    goog.array.forEach(hits, function(e) {
      pl.retained.helper._borderElement(ctx, e, true);
    });
    ctx.stroke();
    ctx.restore();
  }
};

/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.retained.helper.transformPointLocalToGlobal = function(element, point) {
  var tx = element.getTransform();
  return pl.ex.transformCoordinate(tx, point.clone());
};

/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.retained.helper.transformPointGlobalToLocal = function(element, point) {
  var tx = element.getTransform();
  return pl.ex.transformCoordinate(tx.createInverse(), point.clone());
};

/**
 * @param {!pl.retained.Element} element
 * @return {!goog.math.Rect}
 */
pl.retained.helper.getBounds = function(element) {
  var corners = pl.retained.helper.getCorners(element);
  var box = goog.math.Box.boundingBox.apply(null, corners);
  return goog.math.Rect.createFromBox(box);
};

/**
 * @param {!pl.retained.Element} element
 * @return {!Array.<!goog.math.Coordinate>}
 */
pl.retained.helper.getCorners = function(element) {
  var rect = element.getRect();
  var points = pl.ex.getPoints(rect);
  return goog.array.map(points, function(p) {
    return pl.retained.helper.transformPointLocalToGlobal(element, p);
  });
};
