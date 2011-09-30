goog.provide('pl.retained._NavLayerTxPanel');

goog.require('goog.asserts');

/**
 * @constructor
 * @extends {pl.retained.Panel}
 * @param {!HTMLCanvasElement} lastCanvas
 * @param {!goog.graphics.AffineTransform} startTx The transform describing the initial orientation of
 the new child to the old child.
 * @param {!goog.graphics.AffineTransform} ghostTx describes the relationship of the last child to the
 Container.
 * @param {number} frameCount
 * @param {boolean} isChildCentered
 * @param {!goog.math.Vec2} childOffset
 */
pl.retained._NavLayerTxPanel = function(width, height, lastCanvas, newChild, startTx, ghostTx, frameCount, isChildCentered, childOffset) {
  goog.base(this, width, height);
  this.clip = false;

  /**
   * @private
   * @type {number}
   **/
  this._frames = frameCount;

  this._lastImage = new pl.retained.Image(lastCanvas, lastCanvas.width, lastCanvas.height);
  this._newChild = newChild;

  this.addElement(this._lastImage);
  this.addElement(newChild);

  // transform lastImage to be in the correct position, given newChild
  var lastTx = this._lastImage.addTransform();
  lastTx.copyFrom(startTx.createInverse());

  childOffset = childOffset.clone();
  if (isChildCentered) {
    var parentSize = this.getSize();
    var childSize = newChild.getSize();
    var vec = new goog.math.Vec2(parentSize.width - childSize.width, parentSize.height - childSize.height);
    vec.scale(0.5);
    childOffset.add(vec);
  }
  this._goalTx = goog.graphics.AffineTransform.getTranslateInstance(childOffset.x, childOffset.y);


  this._startTx = ghostTx.clone().concatenate(startTx);

  // at this point, the 'children' of this element are oriented correctly
  // new we want to add a tx to this guy to put him in the right start position
  this._myTx = this.addTransform();

  this._myTx.copyFrom(this._startTx);

  this._i = 0;

};
goog.inherits(pl.retained._NavLayerTxPanel, pl.retained.Panel);

pl.retained._NavLayerTxPanel.prototype.isDone = function() {
  goog.asserts.assert(goog.math.isInt(this._frames));
  goog.asserts.assert(this._frames >= 0);
  goog.asserts.assert(this._i >= 0);
  return this._i >= this._frames;
};

pl.retained._NavLayerTxPanel.prototype.dispose = function() {
  this.remove(this._newChild);
};

/**
 * @override
 **/
pl.retained._NavLayerTxPanel.prototype.update = function() {
  goog.asserts.assert(goog.math.isInt(this._frames));
  goog.asserts.assert(this._frames >= 0);
  if (this._i < this._frames) {
    goog.asserts.assert(!this.isDone());
    var ratio = this._i / (this._frames - 1);
    var newTx = pl.gfx.lerpTx(this._startTx, this._goalTx, ratio);
    this._myTx.copyFrom(newTx);

    this._lastImage.alpha = 1 - ratio;
    this._lastImage.invalidateDraw();

    this._newChild.alpha = ratio;
    this._newChild.invalidateDraw();

    goog.base(this, 'update');
    this.invalidateDraw();
    this._i++;
  } else {
    goog.asserts.assert(this.isDone());
    goog.asserts.assert(this._newChild.alpha === 1);
    goog.asserts.assert(this._lastImage.alpha === 0);
  }
};
