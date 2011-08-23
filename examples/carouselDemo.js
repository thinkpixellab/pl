goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.Container');
goog.require('pl.retained.Animation');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

var fpsLogger, logger;
var text, stage, container;
var animation;



function init() {
  pl.DebugDiv.enable();

  logger = goog.debug.LogManager.getRoot();
  fpsLogger = new pl.FpsLogger();

  var canvas = document.getElementById('content');

  text = new pl.retained.Text("Swap!", 400, 400);
  text.fillStyle = 'blue';
  text.multiLine = true;

  container = new pl.retained.Container(400, 400);
  container.addElement(text);

  stage = new pl.retained.Stage(canvas, container);

  animation = new pl.retained.Animation(container, 100, function(i, element) {
    if (i === 0) {
      element.transform = new goog.graphics.AffineTransform();
    }
    var transform = element.transform;
    //transform.setToRotation(Math.PI * 2 * i / 100, 200, 200);
    var scale = 0.9;
    transform.translate(200 / scale - 200, 200 / scale - 200);
    transform.scale(scale, scale);
    //transform.translate(200/scale,200/scale);
  });

  update();
  tick();
}



function update() {
  fpsLogger.AddInterval();

  animation.tick();

  stage.draw();

  //goog.Timer.callOnce(update, 500);
  pl.ex.requestAnimationFrame(update);
}



function tick() {
  pl.DebugDiv.clear();
  logger.info(fpsLogger.fps);
  goog.Timer.callOnce(tick, 2000);
}
