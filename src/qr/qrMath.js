goog.provide('QR.Math');

QR.Math = {

  glog: function(n) {

    if (n < 1) {
      throw new Error('glog(' + n + ')');
    }

    return QR.Math.LOG_TABLE[n];
  },

  gexp: function(n) {

    while (n < 0) {
      n += 255;
    }

    while (n >= 256) {
      n -= 255;
    }

    return QR.Math.EXP_TABLE[n];
  },

  EXP_TABLE: {
    length: 256
  },

  LOG_TABLE: {
    length: 256
  }

};

(function() {
  var i;
  for (i = 0; i < 8; i++) {
    QR.Math.EXP_TABLE[i] = 1 << i;
  }
  for (i = 8; i < 256; i++) {
    QR.Math.EXP_TABLE[i] = QR.Math.EXP_TABLE[i - 4] ^ QR.Math.EXP_TABLE[i - 5] ^ QR.Math.EXP_TABLE[i - 6] ^ QR.Math.EXP_TABLE[i - 8];
  }
  for (i = 0; i < 255; i++) {
    QR.Math.LOG_TABLE[QR.Math.EXP_TABLE[i]] = i;
  }
})();
