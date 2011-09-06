goog.provide('QR.Code');

goog.require('QR.BitBuffer');
goog.require('QR.EightBitByte');
goog.require('QR.Mode');
goog.require('QR.RSBlock');
goog.require('QR.Util');

/**
 * @constructor
 * @param {number} typeNumber
 * @param {QR.ErrorCorrectLevel} errorCorrectLevel
 */
QR.Code = function(typeNumber, errorCorrectLevel) {
  this.typeNumber = typeNumber;
  this.errorCorrectLevel = errorCorrectLevel;
  this.moduleCount = this.typeNumber * 4 + 17;

  this.modules = [this.moduleCount];
  for (var row = 0; row < this.moduleCount; row++) {
    this.modules[row] = [this.moduleCount];
    for (var col = 0; col < this.moduleCount; col++) {
      this.modules[row][col] = null; //(col + row) % 3;
    }
  }

  this.dataCache = null;
  this.dataList = [];
};

QR.Code.prototype = {

  /**
   * @param {string} data
   */
  addData: function(data) {
    var newData = new QR.EightBitByte(data);
    this.dataList.push(newData);
    this.dataCache = null;
  },

  isDark: function(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(row + ',' + col);
    }
    return this.modules[row][col];
  },

  getModuleCount: function() {
    return this.moduleCount;
  },

  make: function() {
    this.makeImpl(false, this.getBestMaskPattern());
  },

  /**
   * @param {boolean} test
   * @param {number} maskPattern
   */
  makeImpl: function(test, maskPattern) {

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    if (this.dataCache == null) {
      this.dataCache = QR.Code.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    }

    this.mapData(this.dataCache, maskPattern);
  },

  setupPositionProbePattern: function(row, col) {

    for (var r = -1; r <= 7; r++) {

      if (row + r <= -1 || this.moduleCount <= row + r) continue;

      for (var c = -1; c <= 7; c++) {

        if (col + c <= -1 || this.moduleCount <= col + c) continue;

        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  },

  /**
   * @return {number}
   */
  getBestMaskPattern: function() {

    var minLostPoint = 0;
    var pattern = 0;

    for (var i = 0; i < 8; i++) {

      this.makeImpl(true, i);

      var lostPoint = QR.Util.getLostPoint(this);

      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  },

  setupTimingPattern: function() {

    for (var r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) {
        continue;
      }
      this.modules[r][6] = (r % 2 == 0);
    }

    for (var c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) {
        continue;
      }
      this.modules[6][c] = (c % 2 == 0);
    }
  },

  setupPositionAdjustPattern: function() {

    var pos = QR.Util.getPatternPosition(this.typeNumber);

    for (var i = 0; i < pos.length; i++) {

      for (var j = 0; j < pos.length; j++) {

        var row = pos[i];
        var col = pos[j];

        if (this.modules[row][col] != null) {
          continue;
        }

        for (var r = -2; r <= 2; r++) {

          for (var c = -2; c <= 2; c++) {

            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  },

  setupTypeNumber: function(test) {

    var bits = QR.Util.getBCHTypeNumber(this.typeNumber);

    var i, mod;
    for (i = 0; i < 18; i++) {
      mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
    }

    for (i = 0; i < 18; i++) {
      mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  },

  setupTypeInfo: function(test, maskPattern) {

    var data = (this.errorCorrectLevel << 3) | maskPattern;
    var bits = QR.Util.getBCHTypeInfo(data);

    var i, mod;

    // vertical
    for (i = 0; i < 15; i++) {

      mod = (!test && ((bits >> i) & 1) == 1);

      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (i = 0; i < 15; i++) {

      mod = (!test && ((bits >> i) & 1) == 1);

      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    // fixed module
    this.modules[this.moduleCount - 8][8] = (!test);

  },

  mapData: function(data, maskPattern) {

    var inc = -1;
    var row = this.moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;

    for (var col = this.moduleCount - 1; col > 0; col -= 2) {

      if (col == 6) col--;

      while (true) {

        for (var c = 0; c < 2; c++) {

          if (this.modules[row][col - c] == null) {

            var dark = false;

            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }

            var mask = QR.Util.getMask(maskPattern, row, col - c);

            if (mask) {
              dark = !dark;
            }

            this.modules[row][col - c] = dark;
            bitIndex--;

            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }

  }

};

QR.Code.PAD0 = 0xEC;
QR.Code.PAD1 = 0x11;

QR.Code.createData = function(typeNumber, errorCorrectLevel, dataList) {

  var rsBlocks = QR.RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

  var buffer = new QR.BitBuffer();
  var i;

  for (i = 0; i < dataList.length; i++) {
    var data = dataList[i];
    buffer.put(data.mode, 4);
    buffer.put(data.getLength(), QR.Util.getLengthInBits(data.mode, typeNumber));
    data.write(buffer);
  }

  // ç≈ëÂÉfÅ[É^êîÇåvéZ
  var totalDataCount = 0;
  for (i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i].dataCount;
  }

  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
  }

  // èIí[ÉRÅ[Éh
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }

  // padding
  while (buffer.getLengthInBits() % 8 != 0) {
    buffer.putBit(false);
  }

  // padding
  while (true) {

    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }
    buffer.put(QR.Code.PAD0, 8);

    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }
    buffer.put(QR.Code.PAD1, 8);
  }

  return QR.Code.createBytes(buffer, rsBlocks);
};

QR.Code.createBytes = function(buffer, rsBlocks) {

  var offset = 0;

  var maxDcCount = 0;
  var maxEcCount = 0;

  var dcdata = {
    length: rsBlocks.length
  };
  var ecdata = {
    length: rsBlocks.length
  };

  var i, r;

  for (r = 0; r < rsBlocks.length; r++) {

    var dcCount = rsBlocks[r].dataCount;
    var ecCount = rsBlocks[r].totalCount - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcdata[r] = {
      length: dcCount
    };

    for (i = 0; i < dcdata[r].length; i++) {
      dcdata[r][i] = 0xff & buffer.buffer[i + offset];
    }
    offset += dcCount;

    var rsPoly = QR.Util.getErrorCorrectPolynomial(ecCount);
    var rawPoly = new QR.Polynomial(dcdata[r], rsPoly.getLength() - 1);

    var modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = {
      length: rsPoly.getLength() - 1
    };
    for (i = 0; i < ecdata[r].length; i++) {
      var modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
    }

  }

  var totalCodeCount = 0;
  for (i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }

  var data = {
    length: totalCodeCount
  };
  var index = 0;

  for (i = 0; i < maxDcCount; i++) {
    for (r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        data[index++] = dcdata[r][i];
      }
    }
  }

  for (i = 0; i < maxEcCount; i++) {
    for (r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        data[index++] = ecdata[r][i];
      }
    }
  }

  return data;

};
