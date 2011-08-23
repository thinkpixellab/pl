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

goog.provide('box2d.Mat22');

/** @constructor
 @param {number=} angle
 @param {box2d.Vec2=} c1
 @param {box2d.Vec2=} c2 */
box2d.Mat22 = function(angle, c1, c2) {
  if (angle == null) angle = 0;
  // initialize instance variables for references

  /** @type {!box2d.Vec2} */
  this.col1 = new box2d.Vec2();

  /** @type {!box2d.Vec2} */
  this.col2 = new box2d.Vec2();
  //
  if (c1 != null && c2 != null) {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
  } else {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    this.col1.x = c;
    this.col2.x = -s;
    this.col1.y = s;
    this.col2.y = c;
  }
};

/** @param {number} angle */
box2d.Mat22.prototype.Set = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c;
};

/**
 @param {!goog.math.Coordinate} c1
 @param {!goog.math.Coordinate} c2 */
box2d.Mat22.prototype.SetVV = function(c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
};

/** @return {box2d.Mat22} */
box2d.Mat22.prototype.Copy = function() {
  return new box2d.Mat22(0, this.col1, this.col2);
};

/** @param {box2d.Mat22} m */
box2d.Mat22.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
};

/** @param {box2d.Mat22} m */
box2d.Mat22.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
};

box2d.Mat22.prototype.SetIdentity = function() {
  this.col1.x = 1.0;
  this.col2.x = 0.0;
  this.col1.y = 0.0;
  this.col2.y = 1.0;
};

box2d.Mat22.prototype.SetZero = function() {
  this.col1.x = 0.0;
  this.col2.x = 0.0;
  this.col1.y = 0.0;
  this.col2.y = 0.0;
};

/** @param {box2d.Mat22} out */
box2d.Mat22.prototype.Invert = function(out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  //var B = new box2d.Mat22();
  var det = a * d - b * c;
  //box2d.Settings.b2Assert(det != 0.0);
  det = 1.0 / det;
  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out;
};

// this.Solve A * x = b
/**
 @param {box2d.Vec2} out
 @param {number} bX
 @param {number} bY */
box2d.Mat22.prototype.Solve = function(out, bX, bY) {
  //float32 a11 = this.col1.x, a12 = this.col2.x, a21 = this.col1.y, a22 = this.col2.y;
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  //float32 det = a11 * a22 - a12 * a21;
  var det = a11 * a22 - a12 * a21;
  //box2d.Settings.b2Assert(det != 0.0);
  det = 1.0 / det;
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);

  return out;
};

box2d.Mat22.prototype.Abs = function() {
  this.col1.Abs();
  this.col2.Abs();
};
