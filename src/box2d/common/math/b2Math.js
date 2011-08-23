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

goog.provide('box2d.Math');

goog.require('box2d.Mat22');
goog.require('box2d.Vec2');

goog.require('goog.math');

/**
 @param {!box2d.Mat22} A
 @param {!box2d.Vec2} v
 @return {!box2d.Vec2}
 */
box2d.Math.b2MulMV = function(A, v) {
  return new box2d.Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
};

/**
 @return {!box2d.Vec2}
 */
box2d.Math.b2MulTMV = function(A, v) {
  return new box2d.Vec2(goog.math.Vec2.dot(v, A.col1), goog.math.Vec2.dot(v, A.col2));
};

box2d.Math.b2MulMM = function(A, B) {
  return new box2d.Mat22(0, box2d.Math.b2MulMV(A, B.col1), box2d.Math.b2MulMV(A, B.col2));
};

box2d.Math.b2AbsM = function(A) {
  return new box2d.Mat22(0, box2d.Vec2.abs(A.col1), box2d.Vec2.abs(A.col2));
};

/**
 @param {number} a
 @param {number} low
 @param {number} high
 @return {number}
 */
box2d.Math.b2Clamp = function(a, low, high) {
  return Math.max(low, Math.min(a, high));
};
