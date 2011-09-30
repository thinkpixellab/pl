goog.provide('pl.gfx');

goog.require('goog.asserts');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math.Size');

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string|CanvasGradient|CanvasPattern} fill
 */
pl.gfx.fillCircle = function(ctx, x, y, radius, fill) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// 2011-08-17
// Discovered here: http://stackoverflow.com/questions/4478742/html5-canvas-can-i-somehow-use-linefeeds-in-filltext
// Inspired by: http://stackoverflow.com/users/128165/gaby-aka-g-petrioli
// Created by: http://stackoverflow.com/users/791890/jeffchan
// Copied from: http://jsfiddle.net/jeffchan/WHgaY/76/
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} lineHeight
 * @param {number} fitWidth
 * @param {boolean=} opt_measureOnly
 */
pl.gfx.multiFillText = function(ctx, text, x, y, lineHeight, fitWidth, opt_measureOnly) {
  var measureOnly = Boolean(opt_measureOnly);

  text = text.replace(/(\r\n|\n\r|\r|\n)/g, '\n');
  var sections = text.split('\n');

  var i, index, str, wordWidth, words, currentLine = 0,
    maxHeight = 0,
    maxWidth = 0;

  var printNextLine = function(str) {
    if (!measureOnly) {
      ctx.fillText(str, x, y + (lineHeight * currentLine));
    }

    currentLine++;
    wordWidth = ctx.measureText(str).width;
    if (wordWidth > maxWidth) {
      maxWidth = wordWidth;
    }
  };

  for (i = 0; i < sections.length; i++) {
    words = sections[i].split(' ');
    index = 1;

    while (words.length > 0 && index <= words.length) {

      str = words.slice(0, index).join(' ');
      wordWidth = ctx.measureText(str).width;

      if (wordWidth > fitWidth) {
        if (index === 1) {
          // Falls to this case if the first word in words[] is bigger than fitWidth
          // so we print this word on its own line; index = 2 because slice is
          str = words.slice(0, 1).join(' ');
          words = words.splice(1);
        } else {
          str = words.slice(0, index - 1).join(' ');
          words = words.splice(index - 1);
        }

        printNextLine(str);

        index = 1;
      } else {
        index++;
      }
    }

    // The left over words on the last line
    if (index > 0) {
      printNextLine(words.join(' '));
    }

  }

  maxHeight = lineHeight * (currentLine);

  return new goog.math.Size(maxWidth, maxHeight);
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!goog.graphics.AffineTransform} tx
 */
pl.gfx.setTransform = function(ctx, tx) {
  ctx.setTransform(tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {?goog.graphics.AffineTransform} tx
 */
pl.gfx.transform = function(ctx, tx) {
  if (tx) {
    ctx.transform(tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
  }
};

/**
 * @param {!goog.graphics.AffineTransform} tx
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} offsetX
 * @param {number} offsetY
 */
pl.gfx.affineOffsetScale = function(tx, scaleX, scaleY, offsetX, offsetY) {
  tx.setTransform(scaleX, 0, 0, scaleY, (1 - scaleX) * offsetX, (1 - scaleY) * offsetY);
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!goog.math.Rect} rect
 */
pl.gfx.fillRect = function(ctx, rect) {
  ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
};

/**
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!Array.<!goog.math.Coordinate>} points
 */
pl.gfx.lineToPath = function(ctx, points) {
  if (points.length >= 2) {
    var point = points[0];
    ctx.moveTo(point.x, point.y);
    for (var i = 1; i < points.length; i++) {
      point = points[i];
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
  }
};

/**
 * @param {goog.graphics.AffineTransform} source
 * @param {goog.graphics.AffineTransform} target
 * @param {number} lerp
 * @return {!goog.graphics.AffineTransform}
 */
pl.gfx.lerpTx = function(source, target, lerp) {
  var m00 = goog.math.lerp(source.getScaleX(), target.getScaleX(), lerp);
  var m10 = goog.math.lerp(source.getShearY(), target.getShearY(), lerp);
  var m01 = goog.math.lerp(source.getShearX(), target.getShearX(), lerp);
  var m11 = goog.math.lerp(source.getScaleY(), target.getScaleY(), lerp);
  var m02 = goog.math.lerp(source.getTranslateX(), target.getTranslateX(), lerp);
  var m12 = goog.math.lerp(source.getTranslateY(), target.getTranslateY(), lerp);

  return new goog.graphics.AffineTransform(m00, m10, m01, m11, m02, m12);
};

/**
 * Given an item of `itemSize` provide the transform needed to make it fit into
 * `targetRect`
 * @param {!goog.math.Size} itemSize
 * @param {!goog.math.Rect} targetRect
 * @return {!goog.graphics.AffineTransform}
 */
pl.gfx.getTransitionTx = function(itemSize, targetRect) {
  goog.asserts.assert(itemSize.width > 0);
  goog.asserts.assert(itemSize.height > 0);

  var tx = goog.graphics.AffineTransform.getTranslateInstance(targetRect.left, targetRect.top);
  var scaleX = targetRect.width / itemSize.width;
  var scaleY = targetRect.height / itemSize.height;
  tx.scale(scaleX, scaleY);
  return tx;
};

/**
 * @param {!goog.math.Size} parentSize
 * @param {!goog.math.Size} childSize
 * @param {!pl.retained.HorizontalAlignment} horizontalAlignment
 * @param {!pl.retained.VerticalAlignment} verticalAlignment
 * @param {!goog.math.Vec2} offset
 * @return {!goog.math.Vec2}
 */
pl.gfx.getOffsetVector = function(parentSize, childSize, horizontalAlignment, verticalAlignment, offset) {
  // we'll return this value...clone it to ensure encapsulation
  offset = offset.clone();
  switch (horizontalAlignment) {
  case pl.retained.HorizontalAlignment.LEFT:
    //no-op
    break;
  case pl.retained.HorizontalAlignment.CENTER:
    offset.x += (parentSize.width - childSize.width) / 2;
    break;
  case pl.retained.HorizontalAlignment.RIGHT:
    offset.x += parentSize.width - childSize.width;
    break;
  default:
    throw Error('horizontalAlignment value not expected ' + horizontalAlignment);
  }

  switch (verticalAlignment) {
  case pl.retained.VerticalAlignment.TOP:
    //no-op
    break;
  case pl.retained.VerticalAlignment.CENTER:
    offset.y += (parentSize.height - childSize.height) / 2;
    break;
  case pl.retained.VerticalAlignment.BOTTOM:
    offset.y += parentSize.height - childSize.height;
    break;
  default:
    throw Error('verticalAlignment value not expected ' + verticalAlignment);
  }

  return offset;
};
