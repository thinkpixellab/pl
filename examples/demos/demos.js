goog.provide('demos');

goog.require('demos.CarouselDemo');
goog.require('demos.RotateText');
goog.require('demos.ScaleDemo');
goog.require('demos.Swap');
goog.require('demos.Tile');

demos.all = {
  'Carousel': demos.CarouselDemo,
  'Scale': demos.ScaleDemo,
  'Swap': demos.Swap,
  'Tile': demos.Tile,
  'Rotate': demos.RotateText
};
