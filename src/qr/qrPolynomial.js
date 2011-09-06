goog.provide('QR.Polynomial');

/**
 @constructor
 */
QR.Polynomial = function(num, shift) {

  if (num.length == undefined) {
    throw new Error(num.length + '/' + shift);
  }

  var offset = 0;

  while (offset < num.length && num[offset] == 0) {
    offset++;
  }

  this.num = {
    length: num.length - offset + shift
  };
  for (var i = 0; i < num.length - offset; i++) {
    this.num[i] = num[i + offset];
  }
};

QR.Polynomial.prototype = {

  get: function(index) {
    return this.num[index];
  },

  getLength: function() {
    return this.num.length;
  },

  multiply: function(e) {

    var num = {
      length: this.getLength() + e.getLength() - 1
    };

    for (var i = 0; i < this.getLength(); i++) {
      for (var j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QR.Math.gexp(QR.Math.glog(this.get(i)) + QR.Math.glog(e.get(j)));
      }
    }

    return new QR.Polynomial(num, 0);
  },

  mod: function(e) {

    if (this.getLength() - e.getLength() < 0) {
      return this;
    }

    var ratio = QR.Math.glog(this.get(0)) - QR.Math.glog(e.get(0));

    var num = {
      length: this.getLength()
    };

    var i;
    for (i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }

    for (i = 0; i < e.getLength(); i++) {
      num[i] ^= QR.Math.gexp(QR.Math.glog(e.get(i)) + ratio);
    }

    // recursive call
    return new QR.Polynomial(num, 0).mod(e);
  }
};
