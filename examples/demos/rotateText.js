goog.provide('demos.RotateText');

goog.require('goog.Timer');
goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Vec2');
goog.require('pl.DebugDiv');
goog.require('pl.FpsLogger');
goog.require('pl.ex');
goog.require('pl.retained.Container');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');



/**
 * @constructor
 */
demos.RotateText = function(canvas) {
  var text = new pl.retained.Text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 400, 400);
  text.fillStyle = 'blue';
  text.multiLine = true;

  var container = new pl.retained.Container(400, 400);
  container.addElement(text);

  this._stage = new pl.retained.Stage(canvas, container);

  this._tx = container.addTransform();
};

demos.RotateText.description = 'Rotate Text';

demos.RotateText.prototype.frame = function() {
  this._tx.rotate(Math.PI * 0.001, 200, 200);

  this._stage.draw();
};
