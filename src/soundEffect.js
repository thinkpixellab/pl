goog.provide('pl.SoundEffect');

/**
 @constructor
 @param {string} name
 @param {!Array.<string>} locations
 @param {number} simulCount
 */
pl.SoundEffect = function(name, locations, simulCount) {
  /**
  @private
  @type {!Array.<!Element>}
  */
  this.m_audios = new Array();

  /**
  @private
  @type {number}
  */
  this.m_maxSimul = simulCount;

  /**
  @private
  @type {number}
  */
  this.m_currSimul = 0;

  var existing = document.getElementsByClassName('audio_' + name);
  for (var i = 0; i < existing.length; i++) {
    this.m_audios.push(existing[i]);
  }

  for (var j = existing.length; j < simulCount; j++) {
    this.m_audios.push(pl.SoundEffect.create(name, locations));
  }
};

/**
 @return {Element}
 */
pl.SoundEffect.prototype.play = function() {
  // get the next audio
  this.m_currSimul++;
  this.m_currSimul %= this.m_maxSimul;
  var audio = this.m_audios[this.m_currSimul];
  if (goog.userAgent.WEBKIT) {
    goog.array.forEach(audio.getElementsByTagName('source'), function(element, index, array) {
      var location = element.src;
      element.src = location;
    });
    audio.load();
  }
  audio.play();
  return audio;
};

/**
 * @param {string} name of the audio being added.
 * @param {!Array.<!Array.<string>>} data
 * @return {Element}
 */
pl.SoundEffect.create = function(name, data) {
  var holder = document.getElementById(pl.SoundEffect.s_audioHolderId);
  if (holder === undefined || holder == null) {
    holder = document.createElement('div');
    holder.id = pl.SoundEffect.s_audioHolderId;
    holder.style['display'] = 'none';
    document.body.appendChild(holder);
  }
  var audio = document.createElement('audio');
  audio.className = 'audio_' + name;
  holder.appendChild(audio);
  for (var index in data) {
    var source = document.createElement('source');
    source.src = data[index][0];
    source.type = data[index][1];
    audio.appendChild(source);
  }
  return audio;
};

/**
 @private
 @type {string}
 @const
*/
pl.SoundEffect.s_audioHolderId = '_audios';
