goog.provide('demos');

goog.require('demos.CarouselDemo');
goog.require('demos.Demo');
goog.require('demos.NavLayerDemo');
goog.require('demos.RotateTextDemo');
goog.require('demos.ScaleDemo');
goog.require('demos.SwapDemo');
goog.require('demos.TileDemo');

/**
 * @type {Object.<string, function(new:demos.Demo, !HTMLCanvasElement)>}
 **/
demos.all = {
  'Carousel': demos.CarouselDemo,
  'Scale': demos.ScaleDemo,
  'Swap': demos.SwapDemo,
  'Tile': demos.TileDemo,
  'Rotate': demos.RotateTextDemo,
  'Nav Layer': demos.NavLayerDemo
};
