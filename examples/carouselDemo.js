goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
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

  container = new pl.retained.CarouselContainer(400, 400);
  container.radius(new goog.math.Size(250, 20));

  for (var i = 0; i < 10; i++) {

    var text = new pl.retained.Text("Dude - " + i, 150, 30);
    text.fillStyle = i % 2 ? '#FFF' : '#DDD';
    text.textFillStyle = 'black';
    container.addElement(text);
  }

  stage = new pl.retained.Stage(canvas, container);

  var frameCount = 200;
  animation = new pl.retained.Animation(container, frameCount, function(i, element) {
    element.angle(i * Math.PI * 2 / frameCount);
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
