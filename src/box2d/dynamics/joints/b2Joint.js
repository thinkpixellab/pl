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

goog.provide('box2d.Joint');

goog.require('box2d.JointNode');

/**
 @constructor
 */
box2d.Joint = function(def) {
  // initialize instance variables for references
  /**
   @type {!box2d.JointNode}
   */
  this.m_node1 = new box2d.JointNode();
  /**
   @type {!box2d.JointNode}
   */
  this.m_node2 = new box2d.JointNode();
  //
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_body1 = def.body1;
  this.m_body2 = def.body2;
  this.m_collideConnected = def.getCollideConnected();
  this.m_islandFlag = false;
  this.m_userData = def.userData;
};

box2d.Joint.prototype.GetType = function() {
  return this.m_type;
};
box2d.Joint.prototype.GetAnchor1 = function() {
  return null;
};
box2d.Joint.prototype.GetAnchor2 = function() {
  return null;
};
box2d.Joint.prototype.GetReactionForce = function(invTimeStep) {
  return null;
};
box2d.Joint.prototype.GetReactionTorque = function(invTimeStep) {
  return 0.0;
};
box2d.Joint.prototype.GetBody1 = function() {
  return this.m_body1;
};
box2d.Joint.prototype.GetBody2 = function() {
  return this.m_body2;
};
box2d.Joint.prototype.GetNext = function() {
  return this.m_next;
};
box2d.Joint.prototype.GetUserData = function() {
  return this.m_userData;
};

//--------------- Internals Below -------------------
//virtual ~b2Joint() {}
box2d.Joint.prototype.PrepareVelocitySolver = function() {};
box2d.Joint.SolveVelocityConstraints = function(step) {};

// This returns true if the position errors are within tolerance.
box2d.Joint.prototype.PreparePositionSolver = function() {};
box2d.Joint.prototype.SolvePositionConstraints = function() {
  return false;
};

/**
 @const
 @type {number}
 */
box2d.Joint.e_unknownJoint = 0;
/**
 @const
 @type {number}
 */
box2d.Joint.e_revoluteJoint = 1;
/**
 @const
 @type {number}
 */
box2d.Joint.e_prismaticJoint = 2;
/**
 @const
 @type {number}
 */
box2d.Joint.e_distanceJoint = 3;
/**
 @const
 @type {number}
 */
box2d.Joint.e_pulleyJoint = 4;
/**
 @const
 @type {number}
 */
box2d.Joint.e_mouseJoint = 5;
/**
 @const
 @type {number}
 */
box2d.Joint.e_gearJoint = 6;
/**
 @const
 @type {number}
 */
box2d.Joint.e_inactiveLimit = 0;
/**
 @const
 @type {number}
 */
box2d.Joint.e_atLowerLimit = 1;
/**
 @const
 @type {number}
 */
box2d.Joint.e_atUpperLimit = 2;
/**
 @const
 @type {number}
 */
box2d.Joint.e_equalLimits = 3;
