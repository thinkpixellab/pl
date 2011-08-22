goog.require('goog.debug.LogManager');
goog.require('goog.math.Coordinate');
goog.require('goog.Timer');
goog.require('goog.math.Vec2');

goog.require('pl.ex');
goog.require('pl.retained.Stage');
goog.require('pl.retained.Text');
goog.require('pl.retained.Container');
goog.require('pl.FpsLogger');
goog.require('pl.DebugDiv');

var text, stage, fpsLogger, logger, container;
var rotation = 0;

function init() {
  pl.DebugDiv.enable();

  logger = goog.debug.LogManager.getRoot();
  fpsLogger = new pl.FpsLogger();

  var canvas = document.getElementById('content');

  text = new pl.retained.Text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", 400, 400);
  text.fillStyle = 'blue';
  text.multiLine = true;

  container = new pl.retained.Container(400, 400);
  container.addElement(text);
  
  stage = new pl.retained.Stage(canvas, container);

  update();
  tick();
}



function update() {
  fpsLogger.AddInterval();

  var element = container;
  
  element.transform = element.transform || new goog.graphics.AffineTransform();

  element.transform.rotate(Math.PI * 0.001, 200, 200);

    //element.transform.scale(1.01, 1.01);

  element.invalidateDraw();

  stage.draw();

  goog.Timer.callOnce(update);
  //pl.ex.requestAnimationFrame(update);
}



function tick() {
  pl.DebugDiv.clear();
  logger.info(fpsLogger.fps);
  goog.Timer.callOnce(tick, 2000);
}
