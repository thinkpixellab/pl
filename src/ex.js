goog.provide('pl.ex');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.iter');
goog.require('goog.math.Rect');
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
 * @return {!goog.math.Size}
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
 * Note: this method mutates the point that was passed in.
 * @param {!goog.graphics.AffineTransform} tx
 * @param {!goog.math.Coordinate} point
 * @return {!goog.math.Coordinate}
 */
pl.ex.transformCoordinate = function(tx, point) {
  var oldX = point.x;
  point.x = oldX * tx.m00_ + point.y * tx.m01_ + tx.m02_;
  point.y = oldX * tx.m10_ + point.y * tx.m11_ + tx.m12_;

  return point;
};

/**
 * @param {!goog.graphics.AffineTransform} tx
 * @param {!Array.<!goog.math.Coordinate>} points
 * @return {!Array.<!goog.math.Coordinate>}
 */
pl.ex.transformCoordinates = function(tx, points) {
  goog.array.forEach(points, function(p) {
    pl.ex.transformCoordinate(tx, p);
  });
  return points;
};

/**
 * @param {!Array} arr The source array.
 * @param {Function=} opt_randFn Optional random function to use for shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
pl.ex.getRandom = function(arr, opt_randFn) {
  goog.asserts.assert(arr && arr.length);
  var randFn = opt_randFn || Math.random;

  var i = Math.floor(randFn() * (arr.length));
  return arr[i];
};

/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The first array element that passes the test. If none -> an Error.
 */
pl.ex.first = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i < 0) {
    throw Error('Not found');
  } else {
    return goog.isString(arr) ? arr.charAt(i) : arr[i];
  }
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

pl.ex.getPoints = function(rect) {
  return [
    new goog.math.Coordinate(rect.left, rect.top),
    new goog.math.Coordinate(rect.left + rect.width, rect.top),
    new goog.math.Coordinate(rect.left + rect.width, rect.top + rect.height),
    new goog.math.Coordinate(rect.left, rect.top + rect.height)
  ];
};

/**
 * @param {!goog.iter.Iterable} iterable
 * @param {function(*):goog.iter.Iterable} f
 * @return {!goog.iter.Iterator} each element is an array with 2 values
 *        item '0' in the item from the source iterable
 *        item '1' in the item from executing the function
 *        "Weird, I know...but what I needed for what I was building." - Kevin.
 */
pl.ex.selectMany = function(iterable, f) {
  iterable = goog.iter.toIterator(iterable);

  var value;
  var innerIterator = null;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (!innerIterator) {
        value = iterable.next();
        innerIterator = goog.iter.toIterator(f(value));
      }
      try {
        return [value, innerIterator.next()];
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) {
          throw ex;
        } else {
          innerIterator = null;
        }
      }
    }
  };
  return newIter;
};

/**
 * @param {!goog.iter.Iterable} iterable
 * @param {function(*): boolean=} opt_function
 * @return {number}
 */
pl.ex.count = function(iterable, opt_function) {
  // TODO: ponder ArrayLike...use length?
  var count = 0;
  goog.iter.forEach(iterable, function(n) {
    if (opt_function) {
      if (opt_function(n)) {
        count++;
      }
    } else {
      count++;
    }
  });
  return count;
};

/**
 * @param {!goog.math.Vec2} vec
 * @param {number} x
 * @param {number} y
 * @return {!goog.math.Vec2}
 */
pl.ex.setVec = function(vec, x, y) {
  vec.x = x;
  vec.y = y;
  return vec;
};

/**
 * @param {!goog.math.Vec2} vec
 * @return {!goog.math.Vec2}
 */
pl.ex.clearVec = function(vec) {
  vec.x = 0;
  vec.y = 0;
  return vec;
};
