goog.provide('demos');

goog.require('demos.CarouselDemo');
goog.require('demos.DemoBase');
goog.require('demos.GraphDemo');
goog.require('demos.NavLayerDemo');
goog.require('demos.RotateTextDemo');
goog.require('demos.ScaleDemo');
goog.require('demos.Squares');
goog.require('demos.SwapDemo');
goog.require('demos.TileDemo');


/**
 * @type {Object.<string, function(new:demos.DemoBase, !HTMLCanvasElement)>}
 **/
demos.all = {
  'Graph': demos.GraphDemo,
  'Squares': demos.Squares,
  'Carousel': demos.CarouselDemo,
  'Scale': demos.ScaleDemo,
  'Swap': demos.SwapDemo,
  'Tile': demos.TileDemo,
  'Rotate': demos.RotateTextDemo,
  'Nav Layer': demos.NavLayerDemo
};
