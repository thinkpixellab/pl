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

goog.provide('box2d.Body');
goog.require('box2d.MassData');
goog.require('box2d.Mat22');
goog.require('box2d.Math');
goog.require('box2d.ShapeFactory');
goog.require('box2d.Vec2');

// A rigid body. Internal computation are done in terms
// of the center of mass position. The center of mass may
// be offset from the body's origin.
/**
 @constructor
 @param {!box2d.BodyDef} bd
 @param {!box2d.World} world
 */
box2d.Body = function(bd, world) {
  /**
   @private
   @type {!box2d.Mat22}
   */
  this.sMat0 = new box2d.Mat22();
  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_position = new box2d.Vec2();
  this.m_position.SetV(bd.position);
  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_position0 = new box2d.Vec2();
  this.m_position0.SetV(this.m_position);

  var i = 0;
  var sd;
  var massData;

  /**
   @private
   @type {number}
   */
  this.m_flags = 0;
  /**
   @private
   @type {number}
   */
  this.m_rotation = bd.rotation;
  this.m_R = new box2d.Mat22(0);
  this.m_R.Set(this.m_rotation);
  this.m_rotation0 = this.m_rotation;
  this.m_world = world;

  this.m_linearDamping = box2d.Math.b2Clamp(1.0 - bd.linearDamping, 0.0, 1.0);
  this.m_angularDamping = box2d.Math.b2Clamp(1.0 - bd.angularDamping, 0.0, 1.0);

  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_force = new box2d.Vec2(0.0, 0.0);
  /**
   @private
   @type {number}
   */
  this.m_torque = 0.0;

  /**
   @private
   @type {number}
   */
  this.m_mass = 0.0;

  var massDatas = new Array(box2d.Settings.b2_maxShapesPerBody);
  for (i = 0; i < box2d.Settings.b2_maxShapesPerBody; i++) {
    massDatas[i] = new box2d.MassData();
  }

  // Compute the shape mass properties, the bodies total mass and COM.
  this.m_shapeCount = 0;
  this.m_center = new box2d.Vec2(0.0, 0.0);
  for (i = 0; i < box2d.Settings.b2_maxShapesPerBody; ++i) {
    sd = bd.shapes[i];
    if (sd == null) break;
    massData = massDatas[i];
    sd.ComputeMass(massData);
    this.m_mass += massData.mass;
    //this.m_center += massData->mass * (sd->localPosition + massData->center);
    this.m_center.x += massData.mass * (sd.localPosition.x + massData.center.x);
    this.m_center.y += massData.mass * (sd.localPosition.y + massData.center.y);
    ++this.m_shapeCount;
  }

  // Compute center of mass, and shift the origin to the COM.
  if (this.m_mass > 0.0) {
    this.m_center.scale(1.0 / this.m_mass);
    this.m_position.add(box2d.Math.b2MulMV(this.m_R, this.m_center));
  } else {
    this.m_flags |= box2d.Body.Flags.staticFlag;
  }

  // Compute the moment of inertia.
  this.m_I = 0.0;
  for (i = 0; i < this.m_shapeCount; ++i) {
    sd = bd.shapes[i];
    massData = massDatas[i];
    this.m_I += massData.I;
    var r = box2d.Vec2.subtract(box2d.Vec2.add(sd.localPosition, massData.center), this.m_center);
    this.m_I += massData.mass * goog.math.Vec2.dot(r, r);
  }

  if (this.m_mass > 0.0) {
    this.m_invMass = 1.0 / this.m_mass;
  } else {
    this.m_invMass = 0.0;
  }

  if (this.m_I > 0.0 && bd.preventRotation == false) {
    this.m_invI = 1.0 / this.m_I;
  } else {
    this.m_I = 0.0;
    this.m_invI = 0.0;
  }

  // Compute the center of mass velocity.
  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_linearVelocity = box2d.Vec2.add(bd.linearVelocity, box2d.Vec2.crossScalar(bd.angularVelocity, this.m_center));
  this.m_angularVelocity = bd.angularVelocity;

  /**
   @type {box2d.Joint}
   */
  this.m_jointList = null;
  this.m_contactList = null;
  this.m_prev = null;
  this.m_next = null;

  // Create the shapes.
  this.m_shapeList = null;
  for (i = 0; i < this.m_shapeCount; ++i) {
    sd = bd.shapes[i];
    var shape = box2d.ShapeFactory.Create(sd, this, this.m_center);
    shape.m_next = this.m_shapeList;
    this.m_shapeList = shape;
  }

  this.m_sleepTime = 0.0;
  if (bd.allowSleep) {
    this.m_flags |= box2d.Body.Flags.allowSleepFlag;
  }
  if (bd.isSleeping) {
    this.m_flags |= box2d.Body.Flags.sleepFlag;
  }

  if ((this.m_flags & box2d.Body.Flags.sleepFlag) || this.m_invMass == 0.0) {
    this.m_linearVelocity.Set(0.0, 0.0);
    this.m_angularVelocity = 0.0;
  }

  this.m_userData = bd.userData;
};

// Set the position of the body's origin and rotation (radians).
// This breaks any contacts and wakes the other bodies.
box2d.Body.prototype.SetOriginPosition = function(position, rotation) {
  if (this.IsFrozen()) {
    return;
  }

  this.m_rotation = rotation;
  this.m_R.Set(this.m_rotation);
  this.m_position = box2d.Vec2.add(position, box2d.Math.b2MulMV(this.m_R, this.m_center));

  this.m_position0.SetV(this.m_position);
  this.m_rotation0 = this.m_rotation;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
  }

  this.m_world.m_broadPhase.Commit();
};

// Get the position of the body's origin. The body's origin does not
// necessarily coincide with the center of mass. It depends on how the
// shapes are created.
box2d.Body.prototype.GetOriginPosition = function() {
  return box2d.Vec2.subtract(this.m_position, box2d.Math.b2MulMV(this.m_R, this.m_center));
};

// Set the position of the body's center of mass and rotation (radians).
// This breaks any contacts and wakes the other bodies.
box2d.Body.prototype.SetCenterPosition = function(position, rotation) {
  if (this.IsFrozen()) {
    return;
  }

  this.m_rotation = rotation;
  this.m_R.Set(this.m_rotation);
  this.m_position.SetV(position);

  this.m_position0.SetV(this.m_position);
  this.m_rotation0 = this.m_rotation;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
  }

  this.m_world.m_broadPhase.Commit();
};

// Get the position of the body's center of mass. The body's center of mass
// does not necessarily coincide with the body's origin. It depends on how the
// shapes are created.
box2d.Body.prototype.GetCenterPosition = function() {
  return this.m_position;
};

// Get the rotation in radians.
box2d.Body.prototype.GetRotation = function() {
  return this.m_rotation;
};

box2d.Body.prototype.GetRotationMatrix = function() {
  return this.m_R;
};

// Set/Get the angular velocity.
box2d.Body.prototype.SetAngularVelocity = function(w) {
  this.m_angularVelocity = w;
};
box2d.Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity;
};

// Apply a force at a world point. Additive.
/**
 * @param {!goog.math.Vec2} force
 * @param {!goog.math.Coordinate} point
 */
box2d.Body.prototype.ApplyForce = function(force, point) {
  if (this.IsSleeping() == false) {
    this.m_force.add(force);
    this.m_torque += box2d.Vec2.cross(box2d.Vec2.subtract(point, this.m_position), force);
  }
};

// Apply a torque. Additive.
box2d.Body.prototype.ApplyTorque = function(torque) {
  if (this.IsSleeping() == false) {
    this.m_torque += torque;
  }
};

// Apply an impulse at a point. This immediately modifies the velocity.
box2d.Body.prototype.ApplyImpulse = function(impulse, point) {
  if (this.IsSleeping() == false) {
    this.m_linearVelocity.add(box2d.Vec2.multiplyScalar(this.m_invMass, impulse));
    this.m_angularVelocity += (this.m_invI * box2d.Vec2.cross(box2d.Vec2.subtract(point, this.m_position), impulse));
  }
};

box2d.Body.prototype.GetMass = function() {
  return this.m_mass;
};

box2d.Body.prototype.GetInertia = function() {
  return this.m_I;
};

// Get the world coordinates of a point give the local coordinates
// relative to the body's center of mass.
box2d.Body.prototype.GetWorldPoint = function(localPoint) {
  return box2d.Vec2.add(this.m_position, box2d.Math.b2MulMV(this.m_R, localPoint));
};

// Get the world coordinates of a vector given the local coordinates.
box2d.Body.prototype.GetWorldVector = function(localVector) {
  return box2d.Math.b2MulMV(this.m_R, localVector);
};

// Returns a local point relative to the center of mass given a world point.
box2d.Body.prototype.GetLocalPoint = function(worldPoint) {
  return box2d.Math.b2MulTMV(this.m_R, box2d.Vec2.subtract(worldPoint, this.m_position));
};

// Returns a local vector given a world vector.
box2d.Body.prototype.GetLocalVector = function(worldVector) {
  return box2d.Math.b2MulTMV(this.m_R, worldVector);
};

// Is this body static (immovable)?
box2d.Body.prototype.IsStatic = function() {
  return (this.m_flags & box2d.Body.Flags.staticFlag) == box2d.Body.Flags.staticFlag;
};

box2d.Body.prototype.IsFrozen = function() {
  return (this.m_flags & box2d.Body.Flags.frozenFlag) == box2d.Body.Flags.frozenFlag;
};

// Is this body sleeping (not simulating).
box2d.Body.prototype.IsSleeping = function() {
  return (this.m_flags & box2d.Body.Flags.sleepFlag) == box2d.Body.Flags.sleepFlag;
};

// You can disable sleeping on this particular body.
box2d.Body.prototype.AllowSleeping = function(flag) {
  if (flag) {
    this.m_flags |= box2d.Body.Flags.allowSleepFlag;
  } else {
    this.m_flags &= ~box2d.Body.Flags.allowSleepFlag;
    this.WakeUp();
  }
};

// Wake up this body so it will begin simulating.
box2d.Body.prototype.WakeUp = function() {
  this.m_flags &= ~box2d.Body.Flags.sleepFlag;
  this.m_sleepTime = 0.0;
};

// Get the list of all shapes attached to this body.
box2d.Body.prototype.GetShapeList = function() {
  return this.m_shapeList;
};

box2d.Body.prototype.GetContactList = function() {
  return this.m_contactList;
};

box2d.Body.prototype.GetJointList = function() {
  return this.m_jointList;
};

// Get the next body in the world's body list.
box2d.Body.prototype.GetNext = function() {
  return this.m_next;
};

box2d.Body.prototype.GetUserData = function() {
  return this.m_userData;
};

// does not support destructors
/*~box2d.Body(){
  box2d.Shape* s = this.m_shapeList;
  while (s)
  {
    box2d.Shape* s0 = s;
    s = s->this.m_next;

    box2d.Shape::this.Destroy(s0);
  }
}*/

box2d.Body.prototype.Destroy = function() {
  var s = this.m_shapeList;
  while (s) {
    var s0 = s;
    s = s.m_next;

    box2d.Shape.Destroy(s0);
  }
};

box2d.Body.prototype.SynchronizeShapes = function() {
  //b2Mat22 R0(this.m_rotation0);
  this.sMat0.Set(this.m_rotation0);
  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position0, this.sMat0, this.m_position, this.m_R);
  }
};

box2d.Body.prototype.QuickSyncShapes = function() {
  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.QuickSync(this.m_position, this.m_R);
  }
};

// This is used to prevent connected bodies from colliding.
// It may lie, depending on the collideConnected flag.
box2d.Body.prototype.IsConnected = function(other) {
  for (var jn = this.m_jointList; jn != null; jn = jn.next) {
    if (jn.other == other) return jn.joint.m_collideConnected == false;
  }

  return false;
};

box2d.Body.prototype.Freeze = function() {
  this.m_flags |= box2d.Body.Flags.frozenFlag;
  this.m_linearVelocity.SetZero();
  this.m_angularVelocity = 0.0;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.DestroyProxy();
  }
};

/**
 @param {!box2d.Vec2} v
 */
box2d.Body.prototype.SetLinearVelocity = function(v) {
  this.m_linearVelocity.SetV(v);
};
/**
 @return {!box2d.Vec2}
 */
box2d.Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity;
};

/**
 @enum {number}
 */
box2d.Body.Flags = {
  staticFlag: 0x0001,
  frozenFlag: 0x0002,
  islandFlag: 0x0004,
  sleepFlag: 0x0008,
  allowSleepFlag: 0x0010,
  destroyFlag: 0x0020
};
