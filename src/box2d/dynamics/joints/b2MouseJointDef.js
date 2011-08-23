/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

goog.provide('box2d.MouseJointDef');

goog.require('box2d.JointDef');

/**
 @constructor
 @extends {box2d.JointDef}
 */
box2d.MouseJointDef = function() {
  box2d.JointDef.call(this, false);

  // The constructor for b2JointDef
  this.type = box2d.Joint.e_unknownJoint;
  this.userData = null;
  this.body1 = null;
  this.body2 = null;
  //
  // initialize instance variables for references
  this.target = new box2d.Vec2();
  //
  this.type = box2d.Joint.e_mouseJoint;
  this.maxForce = 0.0;
  this.frequencyHz = 5.0;
  this.dampingRatio = 0.7;
  this.timeStep = 1.0 / 60.0;
};
goog.inherits(box2d.MouseJointDef, box2d.JointDef);
