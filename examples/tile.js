goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
goog.require('pl.retained.Container');
goog.require('pl.retained.Stage');
goog.require('pl.retained.TileLayer');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

var stage, fpsLogger, logger, tiles;
var offset;



function init() {
  pl.DebugDiv.enable();

  logger = goog.debug.LogManager.getRoot();
  fpsLogger = new pl.FpsLogger();

  var canvas = document.getElementById('content');

  var image =
  /** @type {!HTMLImageElement} */
  (goog.dom.createDom(goog.dom.TagName.IMG, {
    'src': 'stars.png',
    'width': '1024',
    'height': '687'
  }));

  var container = new pl.retained.Container(500, 500);

  tiles = [];

  var size = new goog.math.Size(image.width, image.height);
  for (var i = 0; i < 3; i++) {
    var tileSize = size.clone().scale(Math.pow(2, -i));
    var t = new pl.retained.TileLayer(500, 500, image, tileSize);
    tiles.push(t);
    container.addElement(t);
  }

  offset = new goog.math.Vec2(0, 0);

  stage = new pl.retained.Stage(canvas, container);

  update();
  tick();
}



function update() {
  fpsLogger.AddInterval();

  offset.x -= 10;
  for (var i = 0; i < tiles.length; i++) {
    var t = tiles[i];
    var o = offset.clone().scale(Math.pow(2, -i));
    t.setOffset(o);
  }

  stage.draw();

  //goog.Timer.callOnce(update, 1000);
  pl.ex.requestAnimationFrame(update);
}



function tick() {
  pl.DebugDiv.clear();
  logger.info(fpsLogger.fps);
  goog.Timer.callOnce(tick, 2000);
}
