goog.provide('demos.TileDemo');

goog.require('demos.DemoBase');
goog.require('goog.math.Vec2');
goog.require('pl.retained.Panel');
goog.require('pl.retained.Stage');
goog.require('pl.retained.TileLayer');



/**
 * @constructor
 * @extends {demos.DemoBase}
 */
demos.TileDemo = function(canvas) {
  var image = DemoHost.images.get('stars');

  var container = new pl.retained.Panel(canvas.width, canvas.height);

  this._tiles = [];

  var size = new goog.math.Size(image.width, image.height);
  for (var i = 0; i < 3; i++) {
    var tileSize = size.clone().scale(Math.pow(2, -i));
    var t = new pl.retained.TileLayer(canvas.width, canvas.height, image, tileSize);
    this._tiles.push(t);
    container.addElement(t);
  }

  this._offset = new goog.math.Vec2(0, 0);

  goog.base(this, canvas, container);
};
goog.inherits(demos.TileDemo, demos.DemoBase);

demos.TileDemo.prototype.frame = function() {
  this._offset.x -= 10;
  for (var i = 0; i < this._tiles.length; i++) {
    var t = this._tiles[i];
    var o = this._offset.clone().scale(Math.pow(2, -i));
    t.setOffset(o);
  }

  goog.base(this, 'frame');
  return true;
};
