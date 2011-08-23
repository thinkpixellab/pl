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

goog.provide('box2d.Shape');

goog.require('box2d.Mat22');
goog.require('box2d.ShapeDef');
goog.require('box2d.Vec2');

// Shapes are created automatically when a body is created.
// Client code does not normally interact with shapes.
/**
 @constructor
 @param {!box2d.ShapeDef} def
 @param {!box2d.Body} body
 */
box2d.Shape = function(def, body) {
  // initialize instance variables for references
  this.m_R = new box2d.Mat22();
  this.m_position = new box2d.Vec2();
  //
  this.m_userData = def.userData;

  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;

  this.m_proxyId = box2d.Pair.b2_nullProxy;

  this.m_maxRadius = 0.0;

  this.categoryBits = def.categoryBits;
  this.maskBits = def.maskBits;
  this.m_groupIndex = def.groupIndex;
};

box2d.Shape.prototype.TestPoint = function(p) {
  return false;
};
box2d.Shape.prototype.GetUserData = function() {
  return this.m_userData;
};
box2d.Shape.prototype.GetType = function() {
  return this.m_type;
};
box2d.Shape.prototype. // Get the parent body of this shape.
GetBody = function() {
  return this.m_body;
};
box2d.Shape.prototype.GetPosition = function() {
  return this.m_position;
};
box2d.Shape.prototype.GetRotationMatrix = function() {
  return this.m_R;
};

// Remove and then add proxy from the broad-phase.
// This is used to refresh the collision filters.
box2d.Shape.prototype.ResetProxy = function(broadPhase) {};

// Get the next shape in the parent body's shape list.
box2d.Shape.prototype.GetNext = function() {
  return this.m_next;
};

//--------------- Internals Below -------------------
// Internal use only. Do not call.
//box2d.Shape::~box2d.Shape()
//{
//  this.m_body->m_world->m_broadPhase->this.DestroyProxy(this.m_proxyId);
//}
box2d.Shape.prototype.DestroyProxy = function() {
  if (this.m_proxyId != box2d.Pair.b2_nullProxy) {
    this.m_body.m_world.m_broadPhase.DestroyProxy(this.m_proxyId);
    this.m_proxyId = box2d.Pair.b2_nullProxy;
  }
};

// Internal use only. Do not call.
box2d.Shape.prototype.Synchronize = function(position1, R1, position2, R2) {};
box2d.Shape.prototype.QuickSync = function(position, R) {};
box2d.Shape.prototype.Support = function(dX, dY, out) {};
box2d.Shape.prototype.GetMaxRadius = function() {
  return this.m_maxRadius;
};

box2d.Shape.Destroy = function(shape) {
  if (shape.m_proxyId != box2d.Pair.b2_nullProxy) {
    shape.m_body.m_world.m_broadPhase.DestroyProxy(shape.m_proxyId);
  }
};

box2d.Shape.PolyMass = function(massData, vs, count, rho) {
  //box2d.Settings.b2Assert(count >= 3);
  //var center = new box2d.Vec2(0.0, 0.0);
  var center = new box2d.Vec2();
  center.SetZero();

  var area = 0.0;
  var I = 0.0;

  // pRef is the reference point for forming triangles.
  // It's location doesn't change the result (except for rounding error).
  var pRef = new box2d.Vec2(0.0, 0.0);

  var inv3 = 1.0 / 3.0;

  for (var i = 0; i < count; ++i) {
    // Triangle vertices.
    var p1 = pRef;
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[i + 1] : vs[0];

    var e1 = box2d.Vec2.subtract(p2, p1);
    var e2 = box2d.Vec2.subtract(p3, p1);

    var D = box2d.Vec2.cross(e1, e2);

    var triangleArea = 0.5 * D;
    area += triangleArea;

    // Area weighted centroid
    // center += triangleArea * inv3 * (p1 + p2 + p3);
    var tVec = new box2d.Vec2();
    tVec.SetV(p1);
    tVec.add(p2);
    tVec.add(p3);
    tVec.scale(inv3 * triangleArea);
    center.add(tVec);

    var px = p1.x;
    var py = p1.y;
    var ex1 = e1.x;
    var ey1 = e1.y;
    var ex2 = e2.x;
    var ey2 = e2.y;

    var intx2 = inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;

    I += D * (intx2 + inty2);
  }

  // Total mass
  massData.mass = rho * area;

  // Center of mass
  //box2d.Settings.b2Assert(area > Number.MIN_VALUE);
  center.scale(1.0 / area);
  massData.center = center;

  // Inertia tensor relative to the center.
  I = rho * (I - area * goog.math.Vec2.dot(center, center));
  massData.I = I;
};
box2d.Shape.PolyCentroid = function(vs, count, out) {
  //box2d.Settings.b2Assert(count >= 3);
  //box2d.Vec2 c; c.Set(0.0f, 0.0f);
  var cX = 0.0;
  var cY = 0.0;
  //float32 area = 0.0f;
  var area = 0.0;

  // pRef is the reference point for forming triangles.
  // It's location doesn't change the result (except for rounding error).
  //box2d.Vec2 pRef(0.0f, 0.0f);
  var pRefX = 0.0;
  var pRefY = 0.0;
  /*
    // This code would put the reference point inside the polygon.
    for (var i = 0; i < count; ++i)
    {
      //pRef += vs[i];
      pRef.x += vs[i].x;
      pRef.y += vs[i].y;
    }
    pRef.x *= 1.0 / count;
    pRef.y *= 1.0 / count;
  */

  //const float32 inv3 = 1.0f / 3.0f;
  var inv3 = 1.0 / 3.0;

  for (var i = 0; i < count; ++i) {
    // Triangle vertices.
    //box2d.Vec2 p1 = pRef;
    var p1X = pRefX;
    var p1Y = pRefY;
    //box2d.Vec2 p2 = vs[i];
    var p2X = vs[i].x;
    var p2Y = vs[i].y;
    //box2d.Vec2 p3 = i + 1 < count ? vs[i+1] : vs[0];
    var p3X = i + 1 < count ? vs[i + 1].x : vs[0].x;
    var p3Y = i + 1 < count ? vs[i + 1].y : vs[0].y;

    //box2d.Vec2 e1 = p2 - p1;
    var e1X = p2X - p1X;
    var e1Y = p2Y - p1Y;
    //box2d.Vec2 e2 = p3 - p1;
    var e2X = p3X - p1X;
    var e2Y = p3Y - p1Y;

    //float32 D = b2Cross(e1, e2);
    var D = (e1X * e2Y - e1Y * e2X);

    //float32 triangleArea = 0.5f * D;
    var triangleArea = 0.5 * D;
    area += triangleArea;

    // Area weighted centroid
    //c += triangleArea * inv3 * (p1 + p2 + p3);
    cX += triangleArea * inv3 * (p1X + p2X + p3X);
    cY += triangleArea * inv3 * (p1Y + p2Y + p3Y);
  }

  // Centroid
  //box2d.Settings.b2Assert(area > Number.MIN_VALUE);
  cX *= 1.0 / area;
  cY *= 1.0 / area;

  // Replace return with 'out' vector
  //return c;
  out.Set(cX, cY);
};
