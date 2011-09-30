goog.provide('pl.KeyBinding');
goog.provide('pl.KeyBindingEvent');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.ui.KeyboardShortcutHandler.EventType');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {boolean=} opt_skipStyles
 */
pl.KeyBinding = function(opt_skipStyles) {
  goog.base(this);
  this.m_shortcutHandler = new goog.ui.KeyboardShortcutHandler(document);
  this.m_map = [];

  this.m_useStyles = !opt_skipStyles;

  goog.events.listen(
      this.m_shortcutHandler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      goog.bind(this._handleKey, this));
};
goog.inherits(pl.KeyBinding, goog.events.EventTarget);

/**
 @param {!string} keybinding
 @param {!string} description
 @param {function():(string|undefined)} action
 */
pl.KeyBinding.prototype.add = function(keybinding, description, action) {
  var indexStr = this.m_map.length.toString();
  this.m_shortcutHandler.registerShortcut(indexStr, keybinding);
  this.m_map.push({
    'keybinding': keybinding,
    'description': description,
    'action': action
  });
};

pl.KeyBinding.prototype.getMap = function() {
  return this.m_map;
};

/*
  @privae
  @param {!goog.ui.KeyboardShortcutEvent} event
*/
pl.KeyBinding.prototype._handleKey = function(event) {
  var number = new Number(event.identifier);
  var entry = this.m_map[number];
  var result = entry['action'].call();
  event.stopPropagation();
  var description = result || entry['description'];
  this.dispatchEvent(new pl.KeyBindingEvent(entry['keybinding'], description));
};

/*
 @const
 @type {!string}
*/
pl.KeyBinding.TYPE = 'KeyBindingEvent';

/**
 @constructor
 @extends {goog.events.Event}
*/
pl.KeyBindingEvent = function(keybinding, description) {
  goog.events.Event.call(this, pl.KeyBinding.TYPE);
  this.keybinding = keybinding;
  this.description = description;
};
goog.inherits(pl.KeyBindingEvent, goog.events.Event);
