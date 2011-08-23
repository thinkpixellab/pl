goog.provide('box2d.Util');

box2d.Util.requestAnimFrame = function(callback){
  var func = goog.global['requestAnimationFrame']       ||
             goog.global['webkitRequestAnimationFrame'] ||
             goog.global['mozRequestAnimationFrame']    ||
             goog.global['oRequestAnimationFrame']      ||
             goog.global['msRequestAnimationFrame']     ||
             function(/* function */ callback, /* DOMElement */ element){
               goog.global.setTimeout(callback, 1000 / 60);
             };
  func(callback);
};
