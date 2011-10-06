goog.provide('pl.retained.helper');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('pl.ex');
goog.require('pl.gfx');
goog.require('pl.retained.Element');
goog.require('pl.retained.mouse');

goog.scope(function() {
  var h = pl.retained.helper;

  /**
   * @param {!pl.retained.Stage} stage
   */
  h.borderElements = function(stage) {
    var ctx = stage.getContext();
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 5;
    ctx.beginPath();
    h._borderElement(ctx, stage.getRoot());
    ctx.stroke();
    ctx.restore();
  };

  /**
   * @param {!pl.retained.Stage} stage
   * @param {!goog.math.Coordinate} point
   * @return {!Array.<!pl.retained.Element>}
   */
  h.hitTest = function(stage, point) {
    return h._hitTest(stage.getRoot(), point);
  };

  /**
   * @param {!pl.retained.Stage} stage
   * @param {!goog.math.Coordinate} point
   */
  h.borderHitTest = function(stage, point) {
    var ctx = stage.getContext();

    var hits = h.hitTest(stage, point);
    if (hits.length) {
      ctx.save();
      ctx.lineWidth = 2;

      ctx.beginPath();
      goog.array.forEach(hits, function(e) {
        h._borderElement(ctx, e, true);
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
  h.transformPointLocalToGlobal = function(element, point) {
    var tx = element.getTransform();
    return pl.ex.transformCoordinate(tx, point.clone());
  };

  /**
   * @param {!pl.retained.Element} element
   * @param {!goog.math.Coordinate} point
   * @return {!goog.math.Coordinate}
   */
  h.transformPointGlobalToLocal = function(element, point) {
    var tx = element.getTransform();
    return pl.ex.transformCoordinate(tx.createInverse(), point.clone());
  };

  /**
   * @param {!pl.retained.Element} element
   * @return {!goog.math.Rect}
   */
  h.getBounds = function(element) {
    var corners = h.getCorners(element);
    var box = goog.math.Box.boundingBox.apply(null, corners);
    return goog.math.Rect.createFromBox(box);
  };

  /**
   * @param {!pl.retained.Element} element
   * @return {!Array.<!goog.math.Coordinate>}
   */
  h.getCorners = function(element) {
    var rect = element.getRect();
    var points = pl.ex.getPoints(rect);
    return goog.array.map(points, function(p) {
      return h.transformPointLocalToGlobal(element, p);
    });
  };

  /**
   * @private
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!pl.retained.Element} element
   * @param {boolean=} opt_excludeChildren
   * @param {function(!pl.retained.Element):boolean=} opt_filter
   */
  h._borderElement = function(ctx, element, opt_excludeChildren, opt_filter) {
    pl.gfx.transform(ctx, element.getTransform());

    if (!opt_filter || opt_filter(element)) {
      h._borderElementCore(ctx, element);
    }

    if (!opt_excludeChildren) {
      for (var i = 0; i < element.getVisualChildCount(); i++) {
        var e = element.getVisualChild(i);
        ctx.save();
        h._borderElement(ctx, e, false, opt_filter);
        ctx.restore();
      }
    }
  };

  /**
   * @private
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!pl.retained.Element} element
   */
  h._borderElementCore = function(ctx, element) {
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
   * @private
   * @param {!pl.retained.Element} element
   * @param {!goog.math.Coordinate} point
   * @return {!Array.<!pl.retained.Element>}
   */
  h._hitTest = function(element, point) {
    point = h.transformPointGlobalToLocal(element, point);

    var bounds = new goog.math.Rect(0, 0, element.width, element.height);

    var hits = [];
    if (bounds.contains(point)) {

      var length = element.getVisualChildCount();
      for (var i = 0; i < length; i++) {
        var e = element.getVisualChild(length - 1 - i);
        hits = h._hitTest(e, point);
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
});
