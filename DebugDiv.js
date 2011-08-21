goog.provide('pl.DebugDiv');

goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.style');

// call this function from a script within the document for which to enable debug output
pl.DebugDiv.enable = function() {
  if (!pl.DebugDiv.s_debugDiv) {
    var div = pl.DebugDiv.s_debugDiv = goog.dom.createDom('div', {
      'id': pl.DebugDiv.c_divId,
      'style': 'display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background: rgba(0,0,0,.4); color:yellowgreen; text-align:left; font-family:monospace; border:solid 1px black; z-index:9999;'
    });

    document.body.appendChild(div);

    goog.debug.LogManager.getRoot().addHandler(pl.DebugDiv._onLog);
  }
  goog.asserts.assert(document.getElementById(pl.DebugDiv.c_divId));
};

pl.DebugDiv.disable = function() {
  if (pl.DebugDiv.s_debugDiv) {
    goog.dom.removeNode(pl.DebugDiv.s_debugDiv);
    pl.DebugDiv.s_debugDiv = null;
    goog.debug.LogManager.getRoot().removeHandler(pl.DebugDiv._onLog);
  }
  goog.asserts.assert(!document.getElementById(pl.DebugDiv.c_divId));
};

/**
 @return {boolean} true if on, false otherwise.
 */
pl.DebugDiv.toggle = function() {
  if (pl.DebugDiv.s_debugDiv) {
    pl.DebugDiv.disable();
    return false;
  }
  else {
    pl.DebugDiv.enable();
    return true;
  }
};

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
pl.DebugDiv.clear = function() {
  if (pl.DebugDiv.s_debugDiv) {
    goog.dom.removeChildren(pl.DebugDiv.s_debugDiv);
    goog.style.setStyle(pl.DebugDiv.s_debugDiv, 'display', 'none');
  }
};

/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
pl.DebugDiv._onLog = function(logRecord) {
  if (pl.DebugDiv.s_debugDiv) {
    goog.style.setStyle(pl.DebugDiv.s_debugDiv, 'display', 'block');
    var c = goog.dom.createDom('div', null, goog.string.htmlEscape(logRecord.getMessage()));
    goog.dom.appendChild(pl.DebugDiv.s_debugDiv, c);
  }
};

/**
 @const
 @private
 @type {string}
 */
pl.DebugDiv.c_divId = '_debugLogDiv';
