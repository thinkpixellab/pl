goog.provide('pl.Property');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.array');

/**
 * @constructor
 * @param {!string} name
 * @param {*=} opt_defaultValue
 */
pl.Property = function(name, opt_defaultValue){
  this._name = name;
  this._defaultValue = opt_defaultValue;
  this._id = pl.Property._properties.length;
  pl.Property._properties.push(this);
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.clear = function(object){
  pl.Property.clear(object, this);
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.get = function(object){
  return pl.Property.get(object, this);
};

/**
 * @param {!Object} object
 */
pl.Property.prototype.set = function(object, value){
  pl.Property.set(object, this, value);
};

/**
 * @param {!Object} object
 * @param {!pl.Property} property
 */
pl.Property.set = function(object, property, value){
  var hash = object[pl.Property._PROP_ID_PROPERTY] || (object[pl.Property._PROP_ID_PROPERTY] = {});
  hash[property._id] = value;
};

/**
 * @param {!Object} object
 * @param {!pl.Property} property
 */
pl.Property.clear = function(object, property){
  if(object[pl.Property._PROP_ID_PROPERTY]){
    var hash = object[pl.Property._PROP_ID_PROPERTY];
    delete hash[property._id];
  }
};
/**
 * @param {!Object} object
 * @param {!pl.Property} property
 */
pl.Property.get = function(object, property){
  var coreVal = pl.Property.getCore(object, property);
  if(coreVal){
    return coreVal[0];
  }
  else{
    return property._defaultValue;
  }
};

/**
 * @param {!Object} object
 * @param {!pl.Property} property
 * @return {Array|undefined}
 */
pl.Property.getCore = function(object, property){
  if(object[pl.Property._PROP_ID_PROPERTY]){
    var hash = object[pl.Property._PROP_ID_PROPERTY];
    if(property._id in hash){
      return [hash[property._id]];
    }
    else{
      return null;
    }
  }
};

/**
 * @type {string}
 * @private
 */
pl.Property._PROP_ID_PROPERTY = 'prop_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);

/**
 * @type {!Array.<!pl.Property>}
 * @private
 */
pl.Property._properties = [];
