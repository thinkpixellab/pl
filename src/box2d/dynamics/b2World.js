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

goog.provide('box2d.World');

goog.require('box2d.Body');
goog.require('box2d.BodyDef');
goog.require('box2d.BroadPhase');
goog.require('box2d.CollisionFilter');
goog.require('box2d.ContactManager');
goog.require('box2d.Island');
goog.require('box2d.JointDef');
goog.require('box2d.JointFactory');
goog.require('box2d.TimeStep');
goog.require('box2d.WorldListener');

/**
 @constructor
 @param {!box2d.AABB} worldAABB
 @param {!goog.math.Vec2} gravity
 @param {boolean} doSleep
 */
box2d.World = function(worldAABB, gravity, doSleep) {
  // initialize instance variables for references
  this.m_step = new box2d.TimeStep();

  /**
   @private
   @type {!box2d.ContactManager}
   */
  this.m_contactManager = new box2d.ContactManager(this);

  this.m_listener = null;
  /**
   @type {!box2d.CollisionFilter}
   */
  this.collisionFilter = box2d.CollisionFilter.b2_defaultFilter;

  this.m_bodyList = null;

  /**
   @type {box2d.Contact}
   */
  this.m_contactList = null;
  this.m_jointList = null;

  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;

  this.m_bodyDestroyList = null;

  this.m_allowSleep = doSleep;

  this.m_gravity = gravity;

  this.m_contactManager.m_world = this;
  this.m_broadPhase = new box2d.BroadPhase(worldAABB, this.m_contactManager);

  var bd = new box2d.BodyDef();
  this.m_groundBody = this.CreateBody(bd);

  /**
   @type {!Array.<box2d.Pair>}
   */
  this.lastPairs = [];

  /**
   @type {boolean}
   */
  this.sleeping = false;
};

// Set a callback to notify you when a joint is implicitly destroyed
// when an attached body is destroyed.
box2d.World.prototype.SetListener = function(listener) {
  this.m_listener = listener;
};

/**
 Register a collision filter to provide specific control over collision.
 Otherwise the default filter is used (box2d.CollisionFilter).
 @param {!box2d.CollisionFilter} filter
 */
box2d.World.prototype.SetFilter = function(filter) {
  this.collisionFilter = filter;
};

// Create and destroy rigid bodies. Destruction is deferred until the
// the next call to this.Step. This is done so that bodies may be destroyed
// while you iterate through the contact list.
/**
 @param {!box2d.BodyDef} def
 @return {!box2d.Body}
 */
box2d.World.prototype.CreateBody = function(def) {
  var b = new box2d.Body(def, this);
  b.m_prev = null;

  b.m_next = this.m_bodyList;
  if (this.m_bodyList) {
    this.m_bodyList.m_prev = b;
  }
  this.m_bodyList = b;
  ++this.m_bodyCount;

  return b;
};
// Body destruction is deferred to make contact processing more robust.
/**
 @param {!box2d.Body} b
 */
box2d.World.prototype.DestroyBody = function(b) {

  if (b.m_flags & box2d.Body.Flags.destroyFlag) {
    return;
  }

  // Remove from normal body list.
  if (b.m_prev) {
    b.m_prev.m_next = b.m_next;
  }

  if (b.m_next) {
    b.m_next.m_prev = b.m_prev;
  }

  if (b == this.m_bodyList) {
    this.m_bodyList = b.m_next;
  }

  b.m_flags |= box2d.Body.Flags.destroyFlag;
  //box2d.Settings.b2Assert(this.m_bodyCount > 0);
  --this.m_bodyCount;

  // Add to the deferred destruction list.
  b.m_prev = null;
  b.m_next = this.m_bodyDestroyList;
  this.m_bodyDestroyList = b;
};
box2d.World.prototype.CleanBodyList = function() {
  this.m_contactManager.m_destroyImmediate = true;

  var b = this.m_bodyDestroyList;
  while (b) {
    //box2d.Settings.b2Assert((b.m_flags & box2d.Body.Flags.destroyFlag) != 0);
    // Preserve the next pointer.
    var b0 = b;
    b = b.m_next;

    // Delete the attached joints
    var jn = b0.m_jointList;
    while (jn) {
      var jn0 = jn;
      jn = jn.next;

      if (this.m_listener) {
        this.m_listener.NotifyJointDestroyed(jn0.joint);
      }

      this.DestroyJoint(jn0.joint);
    }

    // Delete the attached contacts.
    var contact = b0.m_contactList;
    while (contact) {
      var contact0 = contact;
      contact = contact.next;
      this.m_contactManager.DestroyContact(contact0.contact);
    }

    b0.Destroy();
  }

  // Reset the list.
  this.m_bodyDestroyList = null;

  this.m_contactManager.m_destroyImmediate = false;
};

/**
 @param {!box2d.JointDef} def
 @return {!box2d.Joint}
 */
box2d.World.prototype.CreateJoint = function(def) {
  var j = box2d.JointFactory.Create(def);

  // Connect to the world list.
  j.m_prev = null;
  j.m_next = this.m_jointList;
  if (this.m_jointList) {
    this.m_jointList.m_prev = j;
  }
  this.m_jointList = j;
  ++this.m_jointCount;

  // Connect to the bodies
  j.m_node1.joint = j;
  j.m_node1.other = j.m_body2;
  j.m_node1.prev = null;
  j.m_node1.next = j.m_body1.m_jointList;
  if (j.m_body1.m_jointList) j.m_body1.m_jointList.prev = j.m_node1;
  j.m_body1.m_jointList = j.m_node1;

  j.m_node2.joint = j;
  j.m_node2.other = j.m_body1;
  j.m_node2.prev = null;
  j.m_node2.next = j.m_body2.m_jointList;
  if (j.m_body2.m_jointList) j.m_body2.m_jointList.prev = j.m_node2;
  j.m_body2.m_jointList = j.m_node2;

  // If the joint prevents collisions, then reset collision filtering.
  if (def.getCollideConnected() == false) {
    // Reset the proxies on the body with the minimum number of shapes.
    var b = def.body1.m_shapeCount < def.body2.m_shapeCount ? def.body1 : def.body2;
    for (var s = b.m_shapeList; s; s = s.m_next) {
      s.ResetProxy(this.m_broadPhase);
    }
  }

  return j;
};
box2d.World.prototype.DestroyJoint = function(j) {

  var collideConnected = j.m_collideConnected;

  // Remove from the world.
  if (j.m_prev) {
    j.m_prev.m_next = j.m_next;
  }

  if (j.m_next) {
    j.m_next.m_prev = j.m_prev;
  }

  if (j == this.m_jointList) {
    this.m_jointList = j.m_next;
  }

  // Disconnect from island graph.
  var body1 = j.m_body1;
  var body2 = j.m_body2;

  // Wake up touching bodies.
  body1.WakeUp();
  body2.WakeUp();

  // Remove from body 1
  if (j.m_node1.prev) {
    j.m_node1.prev.next = j.m_node1.next;
  }

  if (j.m_node1.next) {
    j.m_node1.next.prev = j.m_node1.prev;
  }

  if (j.m_node1 == body1.m_jointList) {
    body1.m_jointList = j.m_node1.next;
  }

  j.m_node1.prev = null;
  j.m_node1.next = null;

  // Remove from body 2
  if (j.m_node2.prev) {
    j.m_node2.prev.next = j.m_node2.next;
  }

  if (j.m_node2.next) {
    j.m_node2.next.prev = j.m_node2.prev;
  }

  if (j.m_node2 == body2.m_jointList) {
    body2.m_jointList = j.m_node2.next;
  }

  j.m_node2.prev = null;
  j.m_node2.next = null;

  --this.m_jointCount;

  // If the joint prevents collisions, then reset collision filtering.
  if (collideConnected == false) {
    // Reset the proxies on the body with the minimum number of shapes.
    var b = body1.m_shapeCount < body2.m_shapeCount ? body1 : body2;
    for (var s = b.m_shapeList; s; s = s.m_next) {
      s.ResetProxy(this.m_broadPhase);
    }
  }
};

// The world provides a single ground body with no collision shapes. You
// can use this to simplify the creation of joints.
box2d.World.prototype.GetGroundBody = function() {
  return this.m_groundBody;
};

/**
 @param {number} dt
 @param {number} iterations
 */
box2d.World.prototype.Step = function(dt, iterations) {

  var b;
  var other;

  this.m_step.dt = dt;
  this.m_step.iterations = iterations;
  if (dt > 0.0) {
    this.m_step.inv_dt = 1.0 / dt;
  } else {
    this.m_step.inv_dt = 0.0;
  }

  this.m_positionIterationCount = 0;

  // Handle deferred body destruction.
  this.CleanBodyList();

  // Handle deferred contact destruction.
  this.m_contactManager.CleanContactList();

  // Update contacts.
  this.m_contactManager.Collide();

  // Size the island for the worst case.
  var island = new box2d.Island(this.m_bodyCount, this.m_contactCount, this.m_jointCount);

  // Clear all the island flags.
  for (b = this.m_bodyList; b != null; b = b.m_next) {
    b.m_flags &= ~box2d.Body.Flags.islandFlag;
  }
  for (var c = this.m_contactList; c != null; c = c.m_next) {
    c.m_flags &= ~box2d.Contact.e_islandFlag;
  }
  for (var j = this.m_jointList; j != null; j = j.m_next) {
    j.m_islandFlag = false;
  }

  // Build and simulate all awake islands.
  var stackSize = this.m_bodyCount;
  var stack = new Array(this.m_bodyCount);
  for (var k = 0; k < this.m_bodyCount; k++)
  stack[k] = null;

  for (var seed = this.m_bodyList; seed != null; seed = seed.m_next) {
    if (seed.m_flags & (box2d.Body.Flags.staticFlag | box2d.Body.Flags.islandFlag | box2d.Body.Flags.sleepFlag | box2d.Body.Flags.frozenFlag)) {
      continue;
    }

    // Reset island and stack.
    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= box2d.Body.Flags.islandFlag;

    // Perform a depth first search (DFS) on the constraint graph.
    while (stackCount > 0) {
      // Grab the next body off the stack and add it to the island.
      b = stack[--stackCount];
      island.AddBody(b);

      // Make sure the body is awake.
      b.m_flags &= ~box2d.Body.Flags.sleepFlag;

      // To keep islands, we don't
      // propagate islands across static bodies.
      if (b.m_flags & box2d.Body.Flags.staticFlag) {
        continue;
      }

      // Search all contacts connected to this body.
      for (var cn = b.m_contactList; cn != null; cn = cn.next) {
        if (cn.contact.m_flags & box2d.Contact.e_islandFlag) {
          continue;
        }

        island.AddContact(cn.contact);
        cn.contact.m_flags |= box2d.Contact.e_islandFlag;

        other = cn.other;
        if (other.m_flags & box2d.Body.Flags.islandFlag) {
          continue;
        }

        //box2d.Settings.b2Assert(stackCount < stackSize);
        stack[stackCount++] = other;
        other.m_flags |= box2d.Body.Flags.islandFlag;
      }

      // Search all joints connect to this body.
      for (var jn = b.m_jointList; jn != null; jn = jn.next) {
        if (jn.joint.m_islandFlag == true) {
          continue;
        }

        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;

        other = jn.other;
        if (other.m_flags & box2d.Body.Flags.islandFlag) {
          continue;
        }

        //box2d.Settings.b2Assert(stackCount < stackSize);
        stack[stackCount++] = other;
        other.m_flags |= box2d.Body.Flags.islandFlag;
      }
    }

    island.Solve(this.m_step, this.m_gravity);

    this.m_positionIterationCount = Math.max(this.m_positionIterationCount, box2d.Island.m_positionIterationCount);

    if (this.m_allowSleep) {
      this.sleeping = island.UpdateSleep(dt);
    }

    // Post solve cleanup.
    for (var i = 0; i < island.m_bodyCount; ++i) {
      // Allow static bodies to participate in other islands.
      b = island.m_bodies[i];
      if (b.m_flags & box2d.Body.Flags.staticFlag) {
        b.m_flags &= ~box2d.Body.Flags.islandFlag;
      }

      // Handle newly frozen bodies.
      if (b.IsFrozen() && this.m_listener) {
        var response = this.m_listener.NotifyBoundaryViolated(b);
        if (response == box2d.WorldListener.b2_destroyBody) {
          this.DestroyBody(b);
          b = null;
          island.m_bodies[i] = null;
        }
      }
    }
  }

  this.lastPairs = this.m_broadPhase.Commit();
};

// this.Query the world for all shapes that potentially overlap the
// provided AABB. You provide a shape pointer buffer of specified
// size. The number of shapes found is returned.
box2d.World.prototype.Query = function(aabb, shapes, maxCount) {

  var results = new Array();
  var count = this.m_broadPhase.QueryAABB(aabb, results, maxCount);

  for (var i = 0; i < count; ++i) {
    shapes[i] = results[i];
  }

  return count;
};

// You can use these to iterate over all the bodies, joints, and contacts.
box2d.World.prototype.GetBodyList = function() {
  return this.m_bodyList;
};
box2d.World.prototype.GetJointList = function() {
  return this.m_jointList;
};
box2d.World.prototype.GetContactList = function() {
  return this.m_contactList;
};

box2d.World.s_enablePositionCorrection = 1;
box2d.World.s_enableWarmStarting = 1;
