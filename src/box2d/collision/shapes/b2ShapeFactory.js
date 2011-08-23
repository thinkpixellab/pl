
goog.provide('box2d.ShapeFactory');

goog.require('box2d.BoxDef');
goog.require('box2d.CircleDef');
goog.require('box2d.CircleShape');
goog.require('box2d.PolyDef');
goog.require('box2d.PolyShape');
goog.require('box2d.ShapeDef');

/**
 @param {!box2d.ShapeDef} def
 @param {!box2d.Body} body
 @param {!box2d.Vec2} center
 @return {!box2d.Shape}
 */
box2d.ShapeFactory.Create = function(def, body, center) {
  if (def instanceof box2d.CircleDef) {
    return new box2d.CircleShape(def, body, center);
  }
  else if (def instanceof box2d.BoxDef) {
    return new box2d.PolyShape(def, body, center);
  }
  else if (def instanceof box2d.PolyDef) {
    return new box2d.PolyShape(def, body, center);
  }
  else {
    throw 'unsupported ShapeDef';
  }
};
