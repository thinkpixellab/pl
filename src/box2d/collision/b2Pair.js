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

goog.provide('box2d.Pair');

goog.require('box2d.Settings');

// The pair manager is used by the broad-phase to quickly add/remove/find pairs
// of overlapping proxies. It is based closely on code provided by Pierre Terdiman.
// http:
/**
 @constructor
 */
box2d.Pair = function() {};
box2d.Pair.prototype = {

  SetBuffered: function() {
    this.status |= box2d.Pair.Flags.pairBuffered;
  },
  ClearBuffered: function() {
    this.status &= ~box2d.Pair.Flags.pairBuffered;
  },
  IsBuffered: function() {
    return (this.status & box2d.Pair.Flags.pairBuffered) == box2d.Pair.Flags.pairBuffered;
  },

  SetRemoved: function() {
    this.status |= box2d.Pair.Flags.pairRemoved;
  },
  ClearRemoved: function() {
    this.status &= ~box2d.Pair.Flags.pairRemoved;
  },
  IsRemoved: function() {
    return (this.status & box2d.Pair.Flags.pairRemoved) == box2d.Pair.Flags.pairRemoved;
  },

  SetFinal: function() {
    this.status |= box2d.Pair.Flags.pairFinal;
  },
  IsFinal: function() {
    return (this.status & box2d.Pair.Flags.pairFinal) == box2d.Pair.Flags.pairFinal;
  },

  proxyId1: 0,
  proxyId2: 0,
  next: 0,
  status: 0
};

/**
  @type {box2d.Contact}
*/
box2d.Pair.prototype.contactData = null;

/** @const @type {number} */
box2d.Pair.b2_nullPair = box2d.Settings.USHRT_MAX;
/** @const @type {number} */
box2d.Pair.b2_nullProxy = box2d.Settings.USHRT_MAX;
/** @const @type {number} */
box2d.Pair.b2_tableCapacity = box2d.Settings.b2_maxPairs;
/** @const @type {number} */
box2d.Pair.b2_tableMask = box2d.Pair.b2_tableCapacity - 1;

/**
 @enum {number}
 */
box2d.Pair.Flags = {
  pairBuffered: 0x0001,
  pairRemoved: 0x0002,
  pairFinal: 0x0004
};
