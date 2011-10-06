goog.provide('pl.retained.mouse');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('pl.Property');
goog.require('pl.retained.Stage');

/**
 * @param {!pl.retained.Stage} stage
 * @param {goog.math.Coordinate=} opt_coordinate
 * @return {?Array.<!pl.retained.Element>}
 */
pl.retained.mouse.markMouseOver = function(stage, opt_coordinate) {
    var items = /** @type {undefined|Array.<!pl.retained.Element>} */ pl.retained.mouse._stageMouseCacheProperty.get(stage);
    if (items) {
      goog.array.forEach(items, function(e) {
        pl.retained.mouse.IsMouseOverProperty.clear(e);
        pl.retained.mouse.IsMouseDirectlyOverProperty.clear(e);
      });
    }
    if (opt_coordinate) {
      var hits = pl.retained.helper.hitTest(stage, opt_coordinate);
      pl.retained.mouse._stageMouseCacheProperty.set(stage, hits);
      goog.array.forEach(hits, function(e) {
        pl.retained.mouse.IsMouseOverProperty.set(e, true);
      });
      if (hits.length) {
        pl.retained.mouse.IsMouseDirectlyOverProperty.set(hits[hits.length - 1], true);
      }
      return hits;
    }
    return null;
};

pl.retained.mouse.IsMouseOverProperty = new pl.Property('IsMouseOver', false);
pl.retained.mouse.IsMouseDirectlyOverProperty = new pl.Property('IsMouseDirectlyOver', false);

pl.retained.mouse._stageMouseCacheProperty = new pl.Property('StageMouseCacheProperty');
