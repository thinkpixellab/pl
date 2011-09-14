goog.provide('demos.Tile');

goog.require('goog.math.Vec2');
goog.require('pl.retained.Panel');
goog.require('pl.retained.Stage');
goog.require('pl.retained.TileLayer');


/**
 * @constructor
 */
demos.Tile = function(canvas) {
  var image = DemoHost.images.get('stars');

  var container = new pl.retained.Panel(500, 500);

  this._tiles = [];

  var size = new goog.math.Size(image.width, image.height);
  for (var i = 0; i < 3; i++) {
    var tileSize = size.clone().scale(Math.pow(2, -i));
    var t = new pl.retained.TileLayer(500, 500, image, tileSize);
    this._tiles.push(t);
    container.addElement(t);
  }

  this._offset = new goog.math.Vec2(0, 0);

  this._stage = new pl.retained.Stage(canvas, container);
};

demos.Tile.description = 'Tile';

demos.Tile.prototype.frame = function() {
  this._offset.x -= 10;
  for (var i = 0; i < this._tiles.length; i++) {
    var t = this._tiles[i];
    var o = this._offset.clone().scale(Math.pow(2, -i));
    t.setOffset(o);
  }

  this._stage.draw();
};
