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

goog.provide('box2d.BodyDef');

goog.require('box2d.Settings');
goog.require('box2d.ShapeDef');

/**
 @constructor
 */
box2d.BodyDef = function() {
  /**
   @type {!Array.<!box2d.ShapeDef>}
   */
  this.shapes = new Array();
  /**
   @type {Object}
   */
  this.userData = null;
  for (var i = 0; i < box2d.Settings.b2_maxShapesPerBody; i++) {
    this.shapes[i] = null;
  }
  /**
   @type {!box2d.Vec2}
   */
  this.position = new box2d.Vec2(0.0, 0.0);
  /**
   @type {number}
   */
  this.rotation = 0.0;
  /**
   @type {!box2d.Vec2}
   */
  this.linearVelocity = new box2d.Vec2(0.0, 0.0);
  /**
   @type {number}
   */
  this.angularVelocity = 0.0;
  /**
   @type {number}
   */
  this.linearDamping = 0.0;
  /**
   @type {number}
   */
  this.angularDamping = 0.0;
  /**
   @type {boolean}
   */
  this.allowSleep = true;
  /**
   @type {boolean}
   */
  this.isSleeping = false;
  /**
   @type {boolean}
   */
  this.preventRotation = false;
};

/**
 @param {!box2d.ShapeDef} shape
 */
box2d.BodyDef.prototype.AddShape = function(shape) {
  for (var i = 0; i < box2d.Settings.b2_maxShapesPerBody; ++i) {
    if (this.shapes[i] == null) {
      this.shapes[i] = shape;
      break;
    }
  }
};
