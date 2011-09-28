goog.provide('pl.images');

goog.require('goog.asserts');
goog.require('goog.net.EventType');
goog.require('goog.net.ImageLoader');
goog.require('goog.object');

/**
 * @constructor
 * @param {Object.<string, string>} source
 */
pl.images = function(source) {
  this._source = source;

  /**
   * @private
   * @type {Object.<string, !HTMLImageElement>}
   */
  this._images = {};
};

pl.images.prototype.load = function(progress, complete) {
  var loader = new goog.net.ImageLoader();

  goog.object.forEach(this._source, function(e,i,o) {
    loader.addImage(i, e);
  });

  var ratio = 0;

  loader.addEventListener(goog.events.EventType.LOAD, function(e) {
    var key = e.target.id;
    var image = e.target;
    goog.asserts.assert(key in this._source);
    goog.asserts.assert(!(key in this._images));
    this._images[e.target.id] = e.target;

    ratio = goog.object.getCount(this._images) / goog.object.getCount(this._source);
    progress(ratio);

  }, false, this);

  loader.addEventListener(goog.net.EventType.COMPLETE, function(e) {
    complete();
  }, false, this);

  loader.start();
};

/**
 * @param {!string} key
 * @param {!string} path
 **/
pl.images.prototype.add = function(key, path) {
  goog.asserts.assert(!goog.object.containsKey(this._source, key));
  goog.object.set(this._source, key, path);
};

/**
 * @param {string} key
 * @return {!HTMLImageElement}
 */
pl.images.prototype.get = function(key) {
  if (key in this._images) {
    return this._images[key];
  } else {
    throw Error('not found');
  }
};
