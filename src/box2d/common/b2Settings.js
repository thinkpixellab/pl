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

goog.provide('box2d.Settings');

/** @const @type {number} */
box2d.Settings.USHRT_MAX = 0x0000ffff;
/** @const @type {number} */
box2d.Settings.invalid = box2d.Settings.USHRT_MAX;
/** @const @type {number} */
box2d.Settings.b2_pi = Math.PI;
/** @const @type {number} */
box2d.Settings.b2_massUnitsPerKilogram = 1.0;
/** @const @type {number} */
box2d.Settings.b2_timeUnitsPerSecond = 1.0;
/** @const @type {number} */
box2d.Settings.b2_lengthUnitsPerMeter = 30.0;
/** @const @type {number} */
box2d.Settings.b2_maxManifoldPoints = 2;
/** @const @type {number} */
box2d.Settings.b2_maxShapesPerBody = 64;
/** @const @type {number} */
box2d.Settings.b2_maxPolyVertices = 8;
/** @const @type {number} */
box2d.Settings.b2_maxProxies = 1024;
/** @const @type {number} */
box2d.Settings.b2_maxPairs = 8 * box2d.Settings.b2_maxProxies;
/** @const @type {number} */
box2d.Settings.b2_linearSlop = 0.005 * box2d.Settings.b2_lengthUnitsPerMeter;
/** @const @type {number} */
box2d.Settings.b2_angularSlop = 2.0 / 180.0 * box2d.Settings.b2_pi;
/** @const @type {number} */
box2d.Settings.b2_velocityThreshold = 1.0 * box2d.Settings.b2_lengthUnitsPerMeter / box2d.Settings.b2_timeUnitsPerSecond;
/** @const @type {number} */
box2d.Settings.b2_maxLinearCorrection = 0.2 * box2d.Settings.b2_lengthUnitsPerMeter;
/** @const @type {number} */
box2d.Settings.b2_maxAngularCorrection = 8.0 / 180.0 * box2d.Settings.b2_pi;
/** @const @type {number} */
box2d.Settings.b2_contactBaumgarte = 0.2;
/** @const @type {number} */
box2d.Settings.b2_timeToSleep = 0.5 * box2d.Settings.b2_timeUnitsPerSecond;
/** @const @type {number} */
box2d.Settings.b2_linearSleepTolerance = 0.01 * box2d.Settings.b2_lengthUnitsPerMeter / box2d.Settings.b2_timeUnitsPerSecond;
/** @const @type {number} */
box2d.Settings.b2_angularSleepTolerance = 2.0 / 180.0 / box2d.Settings.b2_timeUnitsPerSecond;
/** @const @type {number} */
box2d.Settings.FLT_EPSILON = 0.0000001192092896;
/** @const @type {function(boolean)} */
box2d.Settings.b2Assert = function(a) {
  if (!a) {
    throw 'Assert Failed!';
  }
};
