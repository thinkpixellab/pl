goog.provide('demos.Tile');

goog.require('goog.Timer');
goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Vec2');
goog.require('pl.ex');
goog.require('pl.retained.Container');
goog.require('pl.retained.Stage');
goog.require('pl.retained.TileLayer');


/**
 * @constructor
 */
demos.Tile = function(canvas) {
  var image =
  /** @type {!HTMLImageElement} */
  (goog.dom.createDom(goog.dom.TagName.IMG, {
    'src': 'stars.png',
    'width': '1024',
    'height': '687'
  }));

  var container = new pl.retained.Container(500, 500);

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
