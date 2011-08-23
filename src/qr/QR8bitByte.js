goog.provide('QR.EightBitByte');

/**
 * @constructor
 * @param {string} data
 */
QR.EightBitByte = function(data) {
  this.mode = QR.Mode.MODE_8BIT_BYTE;
  this.data = data;
};

QR.EightBitByte.prototype = {

  getLength: function(buffer) {
    return this.data.length;
  },

  write: function(buffer) {
    for (var i = 0; i < this.data.length; i++) {
      // not JIS ...
      buffer.put(this.data.charCodeAt(i), 8);
    }
  }
};
