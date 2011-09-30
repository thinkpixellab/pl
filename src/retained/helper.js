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
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!pl.retained.Element} element
 * @param {boolean=} opt_excludeChildren
 */
pl.retained.helper._borderElement = function(ctx, element, opt_excludeChildren) {
  pl.gfx.transform(ctx, element.getTransform());
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
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.helper.hitTest = function(stage, x, y) {
  return pl.retained.helper._hitTest(stage.getRoot(), x, y);
};

/**
 * @param {!pl.retained.Element} element
 * @param {number} x
 * @param {number} y
 * @return {!Array.<!pl.retained.Element>}
 */
pl.retained.helper._hitTest = function(element, x, y) {
  var c = new goog.math.Coordinate(x, y);
  pl.retained.helper.transformPointGlobalToLocal(element, c);

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
 * @param {number} x
 * @param {number} y
 */
pl.retained.helper.borderHitTest = function(stage, x, y) {
  var ctx = stage.getContext();

  var hits = pl.retained.helper.hitTest(stage, x, y);
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

// modifies the provided point IN PLACE
/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.retained.helper.transformPointLocalToGlobal = function(element, point) {
  var tx = element.getTransform();
  pl.ex.transformCoordinate(tx, point);
  return point;
};

// modifies the provided point IN PLACE
/**
 * @param {!pl.retained.Element} element
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.retained.helper.transformPointGlobalToLocal = function(element, point) {
  var tx = element.getTransform();
  pl.ex.transformCoordinate(tx.createInverse(), point);
  return point;
};

/**
 * @param {!pl.retained.Element} element
 * @return {!goog.math.Rect}
 */
pl.retained.helper.getBounds = function(element) {
  var corners = pl.retained.helper.getCorners(element);
  var left = corners[0].x;
  var right = corners[0].x;
  var top = corners[0].y;
  var bottom = corners[0].y;

  for (var i = 1; i < corners.length; i++) {
    left = Math.min(left, corners[i].x);
    right = Math.max(right, corners[i].x);
    top = Math.min(top, corners[i].y);
    bottom = Math.max(bottom, corners[i].y);
  }

  return new goog.math.Rect(left, top, right - left, bottom - top);
};

/**
 * @param {!pl.retained.Element} element
 * @return {!Array.<!goog.math.Coordinate>}
 */
pl.retained.helper.getCorners = function(element) {
  var points = [new goog.math.Coordinate(0, 0), new goog.math.Coordinate(element.width, 0), new goog.math.Coordinate(element.width, element.height), new goog.math.Coordinate(0, element.height)];
  goog.array.forEach(points, function(p) {
    pl.retained.helper.transformPointLocalToGlobal(element, p);
  });
  return points;
};
