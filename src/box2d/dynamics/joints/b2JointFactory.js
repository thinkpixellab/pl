goog.provide('box2d.JointFactory');

goog.require('box2d.DistanceJoint');
goog.require('box2d.GearJoint');
goog.require('box2d.MouseJoint');
goog.require('box2d.PrismaticJoint');
goog.require('box2d.PulleyJoint');
goog.require('box2d.RevoluteJoint');

box2d.JointFactory.Create = function(def) {
  switch (def.type) {
  case box2d.Joint.e_distanceJoint:
    {
      return new box2d.DistanceJoint(def);
    }
  case box2d.Joint.e_mouseJoint:
    {
      return new box2d.MouseJoint(def);
    }
  case box2d.Joint.e_prismaticJoint:
    {
      return new box2d.PrismaticJoint(def);
    }
  case box2d.Joint.e_revoluteJoint:
    {
      return new box2d.RevoluteJoint(def);
    }
  case box2d.Joint.e_pulleyJoint:
    {
      return new box2d.PulleyJoint(def);
    }
  case box2d.Joint.e_gearJoint:
    {
      return new box2d.GearJoint(def);
    }
  default:
    throw 'def not supported';
  }
};
