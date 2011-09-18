goog.provide('demos.RotateTextDemo');

goog.require('demos.Demo');
goog.require('pl.retained.Panel');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');

/**
 * @constructor
 * @extends {demos.Demo}
 */
demos.RotateTextDemo = function(canvas) {
  var text = new pl.retained.Text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 400, 400);
  text.fillStyle = 'blue';
  text.multiLine = true;

  var container = new pl.retained.Panel(400, 400);
  container.addElement(text);

  goog.base(this, canvas, container);

  container.addTransform().translate(50, 50);

  this._tx = container.addTransform();
};
goog.inherits(demos.RotateTextDemo, demos.Demo);

/**
 * @override
 */
demos.RotateTextDemo.prototype.frame = function() {
  this._tx.rotate(Math.PI * 0.001, 200, 200);
  goog.base(this, 'frame');
  return true;
};
