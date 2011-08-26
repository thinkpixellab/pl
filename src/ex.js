goog.provide('pl.ex');

goog.require('goog.array');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');

/**
 * Sets a style value on an element.
 *
 * This function is not indended to patch issues in the browser's style
 * handling, but to allow easy programmatic access to setting dash-separated
 * style properties.  An example is setting a batch of properties from a data
 * object without overwriting old styles.  When possible, use native APIs:
 * elem.style.propertyKey = 'value' or (if obliterating old styles is fine)
 * elem.style.cssText = 'property1: value1; property2: value2'.
 *
 * @param {Element} element The element to change.
 * @param {string} style a style name.
 * @param {string|number|boolean} value
 */
pl.ex.setStyle = function(element, style, value) {
  goog.style.setStyle(element, style, value);
  goog.array.forEach(pl.ex.prefixes, function(pf) {
    var name = goog.string.buildString('-', pf, '-', style);
    goog.style.setStyle(element, name, value);
  });
};

/**
 * @param {HTMLCanvasElement} canvasElement
 * @return {goog.math.Size}
 */
pl.ex.getCanvasSize = function(canvasElement) {
  return new goog.math.Size(canvasElement.width, canvasElement.height);
};

pl.ex.requestAnimationFrame = function(callback) {
  var func = goog.global['requestAnimationFrame'] ||
             goog.global['webkitRequestAnimationFrame'] ||
             goog.global['mozRequestAnimationFrame'] ||
             goog.global['oRequestAnimationFrame'] ||
             goog.global['msRequestAnimationFrame'] ||
             function(/* function */ callback, /* DOMElement */ element) {
               goog.global.setTimeout(callback, pl.ex.fallbackFrameTimeout);
             };
  func(callback);
};

/**
 * Almost 10x faster than Math.round, per
 * http://www.html5rocks.com/en/tutorials/canvas/performance/
 * @param {number} number
 * @return {number}
 */
pl.ex.round = function(number) {
  return (0.5 + number) << 0;
};

/**
 * @param {!Array.<!goog.math.Coordinate>} points
 * @return {!Array.<number>}
 */
pl.ex.flattenPoints = function(points) {
  var nums = new Array(points.length * 2);
  for (var i = 0; i < points.length; i++) {
    nums[i * 2] = points[i].x;
    nums[i * 2 + 1] = points[i].y;
  }
  return nums;
};

/**
 * //TODO: check for non-even numbered input?
 * @param {!Array.<number>} numbers
 * @return {!Array.<!goog.math.Coordinate>}
 */
pl.ex.expandPoints = function(numbers) {
  var points = new Array(numbers.length / 2);
  for (var i = 0; i < points.length; i++) {
    points[i] = new goog.math.Coordinate(numbers[i * 2], numbers[i * 2 + 1]);
  }
  return points;
};

/**
 * @param {!goog.graphics.AffineTransform} tx
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.ex.transformCoordinate = function(tx, point) {
  var foo = [point.x, point.y];
  tx.transform(foo, 0, foo, 0, 1);
  point.x = foo[0];
  point.y = foo[1];
  return point;
};

/**
 * @param {!goog.graphics.AffineTransform} tx
 * @param {!Array.<!goog.math.Coordinate>} points
 * @return {!Array.<!goog.math.Coordinate>}
 */
pl.ex.transformCoordinates = function(tx, points) {
  goog.iter.forEach(points, function(p) {
    pl.ex.transformCoordinate(tx, p);
  });
  return points;
};

/**
 * @const
 * @type Array.<string>
 **/
pl.ex.prefixes = 'webkit moz o ms khtml'.split(' ');

/**
 * @const
 * @type {number}
 **/
pl.ex.fallbackFrameTimeout = 17; // ms -> ~1000 / 60 -> 60fps;
