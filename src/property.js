goog.provide('pl.Property');

goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');

/**
 * @constructor
 * @param {!string} name
 * @param {*=} opt_defaultValue
 */
pl.Property = function(name, opt_defaultValue) {
  this._name = name;
  this._defaultValue = opt_defaultValue;
  this._id = pl.Property._propertyId++;
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.clear = function(object) {
  if (object[pl.Property._PROP_ID_PROPERTY]) {
    var hash = object[pl.Property._PROP_ID_PROPERTY];
    delete hash[this._id];
    this._notify(object);
  }
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.get = function(object) {
  var coreVal = this.getCore(object);
  if (coreVal) {
    return coreVal[0];
  }
  else {
    return this._defaultValue;
  }
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.set = function(object, value) {
  var hash = object[pl.Property._PROP_ID_PROPERTY] || (object[pl.Property._PROP_ID_PROPERTY] = {});
  hash[this._id] = value;
  this._notify(object);
};

/**
 * @param {!Object} object
 * @return {boolean}
 */
pl.Property.prototype.isSet = function(object) {
  return object[pl.Property._PROP_ID_PROPERTY] && this._id in object[pl.Property._PROP_ID_PROPERTY];
};

pl.Property.prototype._notify = function(object) {
  var listener = pl.Property._callbackProperty.get(object);
  if (listener) {
    listener(this);
  }
};

/**
 * @param {!Object} object
 * @return {Array|undefined}
 */
pl.Property.prototype.getCore = function(object) {
  if (object[pl.Property._PROP_ID_PROPERTY]) {
    var hash = object[pl.Property._PROP_ID_PROPERTY];
    if (this._id in hash) {
      return [hash[this._id]];
    }
    else {
      return null;
    }
  }
};

/**
 * @param {!Object} object
 * @param {!Function} listener.
 */
pl.Property.watchChanges = function(object, listener) {
  if (pl.Property._callbackProperty.get(object)) {
    throw Error('already set');
  }
  pl.Property._callbackProperty.set(object, listener);
};

/**
 * @type {string}
 * @private
 */
pl.Property._PROP_ID_PROPERTY = 'prop_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);

/**
 * @type {number}
 * @private
 */
pl.Property._propertyId = 0;

pl.Property._callbackProperty = new pl.Property('Callback');
