goog.provide('pl.ex');

goog.require('goog.style');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.math.Size');

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
 * @param {string} style a style name
 * @param {string|number|boolean} value
 */
pl.ex.setStyle = function(element, style, value){
  goog.style.setStyle(element, style, value);
  goog.array.forEach(pl.ex.prefixes, function(pf) {
    var name = goog.string.buildString('-', pf, '-', style);
    goog.style.setStyle(element, name, value);
  });  
};

/**
 * @param {HTMLCanvasElement} canvasElement
 * @returns {goog.math.Size}
 */
pl.ex.getCanvasSize = function(canvasElement){
  return new goog.math.Size(canvasElement.width, canvasElement.height);
};

pl.ex.requestAnimationFrame = function(callback){
  var func = goog.global['requestAnimationFrame']       ||
             goog.global['webkitRequestAnimationFrame'] ||
             goog.global['mozRequestAnimationFrame']    ||
             goog.global['oRequestAnimationFrame']      ||
             goog.global['msRequestAnimationFrame']     ||
             function(/* function */ callback, /* DOMElement */ element){
               goog.global.setTimeout(callback, pl.ex.fallbackFrameTimeout);
             };
  func(callback);
};

/**
 * Almost 10x faster than Math.round, per
 * http://www.html5rocks.com/en/tutorials/canvas/performance/
 * @param {number} number
 * @returns {number}
 */
pl.ex.round = function(number){
  return (0.5 + number) << 0;
};

/**
 * @const
 * @type Array.<string>
 **/
pl.ex.prefixes = "webkit moz o ms khtml".split(' ');

/**
 * @const
 * @type {number}
 **/
pl.ex.fallbackFrameTimeout = 17; // ms -> ~1000 / 60 -> 60fps;
