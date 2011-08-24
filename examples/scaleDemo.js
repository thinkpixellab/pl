goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
goog.require('pl.gfx');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.CarouselContainer');
goog.require('pl.retained.Animation');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

var fpsLogger, logger;
var stage, container;
var animation;



function init() {
  pl.DebugDiv.enable();

  logger = goog.debug.LogManager.getRoot();
  fpsLogger = new pl.FpsLogger();

  var canvas =
  /** @type {!HTMLCanvasElement} */
  (document.getElementById('content'));

  container = new pl.retained.Text("Dude", 300, 50);
  container.fillStyle = 'white';
  container.textFillStyle = 'black';
  container.center(new goog.math.Coordinate(250, 250));
  container.transform = new goog.graphics.AffineTransform();

  stage = new pl.retained.Stage(canvas, container);

  var frames = 50;

  animation = new pl.retained.Animation(container, frames, function(i, element) {
    var scale = 1 - i / frames;
    pl.ex.affineOffsetScale(element.transform, scale, scale, element.width / 2, element.height / 2);
    element.invalidateDraw();
  });

  update();
  tick();
}



function update() {
  fpsLogger.AddInterval();

  animation.tick();
  stage.draw();

  //goog.Timer.callOnce(update);
  pl.ex.requestAnimationFrame(update);
}



function tick() {
  pl.DebugDiv.clear();
  logger.info(fpsLogger.fps);
  goog.Timer.callOnce(tick, 2000);
}
