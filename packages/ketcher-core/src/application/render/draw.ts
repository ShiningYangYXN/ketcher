/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { RaphaelPaper, Element } from 'raphael';
import { HalfBond, RxnArrowMode, Vec2 } from 'domain/entities';

import { getOptionsWithConvertedUnits } from './options';
import Raphael from './raphael-ext';
import svgPath from 'svgpath';
import util from './util';
import { ArrowItem, RelativeBox, RenderOptions } from './render.types';
import { tfx } from 'utilities';
import { PathBuilder } from './pathBuilder';

export const ARROW_HEAD_LENGHT = 0.25; // 10
export const ARROW_HEAD_WIDTH = 0.125; // 5
export const ARROW_HEAD_ATTR = 0.1; // 4
export const ARROW_OFFSET = 0.1; // 4
export const ARROW_DASH_INTERVAL = 0.0875; // 3.5
export const ARROW_FAIL_SIGN_WIDTH = 0.2; // 8
export const ARROW_UNBALANCED_OFFSET = 0.2; // 8 (used to be 15)

export function getArrowHeadDimensions(options: RenderOptions) {
  const { microModeScale } = getOptionsWithConvertedUnits(options);

  return {
    arrowHeadLength: ARROW_HEAD_LENGHT * microModeScale,
    arrowHeadWidth: ARROW_HEAD_WIDTH * microModeScale,
    arrowHeadAttr: ARROW_HEAD_ATTR * microModeScale,
    arrowOffset: ARROW_OFFSET * microModeScale,
  };
}

function getUnbalancedArrowHeadOffset(options: RenderOptions) {
  const { microModeScale } = getOptionsWithConvertedUnits(options);

  return ARROW_UNBALANCED_OFFSET * microModeScale;
}

function rectangle(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  return paper.rect(
    tfx(Math.min(points[0].x, points[1].x)),
    tfx(Math.min(points[0].y, points[1].y)),
    tfx(Math.abs(points[1].x - points[0].x)),
    tfx(Math.abs(points[1].y - points[0].y)),
  );
}

function rectangleArrowHighlightAndSelection(
  _paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  length: number,
  angle: number,
) {
  const endX = start.x + length;
  const [wOffset, hOffset] = [5, height || 8];

  const path =
    `M${tfx(start.x - wOffset)},${tfx(start.y)}` +
    `L${tfx(start.x - wOffset)},${tfx(start.y - hOffset)}` +
    `L${tfx(endX + wOffset)},${tfx(start.y - hOffset)}` +
    `L${tfx(endX + wOffset)},${tfx(start.y + (!height ? hOffset : 0))}` +
    `L${tfx(start.x - wOffset)},${tfx(start.y + (!height ? hOffset : 0))}Z`;

  return svgPath(path).rotate(angle, start.x, start.y).toString();
}

function ellipse(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  const rad = Vec2.diff(points[1], points[0]);
  const rx = rad.x / 2;
  const ry = rad.y / 2;
  return paper.ellipse(
    points[0].x + rx,
    points[0].y + ry,
    Math.abs(rx),
    Math.abs(ry),
  );
}

function polyline(paper: RaphaelPaper, points: Vec2[]) {
  const path = ['M', points[0].x, points[0].y];
  for (let i = 1; i < points.length; i++)
    path.push('L', points[i].x, points[i].y);
  return paper.path(path);
}

function line(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  const path = ['M', points[0].x, points[0].y];
  path.push('L', points[1].x, points[1].y);
  return paper.path(path);
}

function arrow(
  paper: RaphaelPaper,
  item: ArrowItem,
  length: number,
  angle: number,
  options: RenderOptions,
  isResizing: boolean,
) {
  const shouldApplySnappingStyle =
    isResizing &&
    ['0', '-0', '90', '-90', '180', '-180'].includes(angle.toFixed());

  switch (item.mode) {
    case RxnArrowMode.OpenAngle: {
      return arrowOpenAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.FilledTriangle: {
      return arrowFilledTriangle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.FilledBow: {
      return arrowFilledBow(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.DashedOpenAngle: {
      return arrowDashedOpenAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.Failed: {
      return arrowFailed(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.Retrosynthetic: {
      return arrowRetrosynthetic(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.BothEndsFilledTriangle: {
      return arrowBothEndsFilledTriangle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EquilibriumFilledHalfBow: {
      return arrowEquilibriumFilledHalfBow(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EquilibriumFilledTriangle: {
      return arrowEquilibriumFilledTriangle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EquilibriumOpenAngle: {
      return arrowEquilibriumOpenAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.UnbalancedEquilibriumFilledHalfBow: {
      return arrowUnbalancedEquilibriumFilledHalfBow(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle: {
      return arrowUnbalancedEquilibriumOpenHalfAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow: {
      return arrowUnbalancedEquilibriumLargeFilledHalfBow(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle: {
      return arrowUnbalancedEquilibriumFilledHalfTriangle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EllipticalArcFilledBow: {
      return arrowEllipticalArcFilledBow(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EllipticalArcFilledTriangle: {
      return arrowEllipticalArcFilledTriangle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EllipticalArcOpenAngle: {
      return arrowEllipticalArcOpenAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
    case RxnArrowMode.EllipticalArcOpenHalfAngle: {
      return arrowEllipticalArcOpenHalfAngle(
        paper,
        item,
        length,
        angle,
        options,
        shouldApplySnappingStyle,
      );
    }
  }
}

function arrowEllipticalArcFilledBow(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const direction = height >= 0 ? 1 : -1;
  const { arrowHeadLength, arrowHeadWidth, arrowHeadAttr } =
    getArrowHeadDimensions(options);

  const length = direction * arrowHeadLength;
  const width = direction * arrowHeadWidth;
  const attr = direction * arrowHeadAttr;

  const endX = start.x + arrowLength;
  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX,
    )},${tfx(start.y)}` +
    `L${tfx(endX - width)},${tfx(start.y - length)}` +
    `l${tfx(width)},${tfx(attr)}` +
    `l${tfx(width)},${tfx(-attr)}` +
    `l${tfx(-width)},${length}`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowEllipticalArcFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);

  const direction = height >= 0 ? 1 : -1;

  const triangleLength = direction * arrowHeadLength;
  const triangleWidth = direction * arrowHeadWidth;

  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX,
    )},${tfx(start.y)}` +
    `L${tfx(endX - triangleWidth)},${tfx(start.y - triangleLength)}` +
    `l${tfx(triangleLength)},${tfx(0)}` +
    `l${tfx(-triangleWidth)},${tfx(triangleLength)}`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowEllipticalArcOpenAngle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const direction = height >= 0 ? 1 : -1;

  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);

  const width = direction * arrowHeadWidth;
  const length = direction * arrowHeadLength;

  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX,
    )},${tfx(start.y)}` +
    `L${tfx(endX - width)},${tfx(start.y - length)}` +
    `M${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX + width)}, ${tfx(start.y - length)}`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowEllipticalArcOpenHalfAngle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const direction = height >= 0 ? 1 : -1;

  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);

  const width = direction * arrowHeadWidth;
  const length = direction * arrowHeadLength;
  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0}, ${tfx(
      endX,
    )},${tfx(start.y)}` +
    `L${tfx(endX + width)}, ${tfx(start.y - length)}`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadAttr, arrowHeadLength } = getArrowHeadDimensions(options);
  const pathBuilder = new PathBuilder().addOpenArrowPathParts(
    start,
    arrowLength,
    arrowHeadLength,
    arrowHeadAttr,
  );
  const transformedPath = svgPath(pathBuilder.build())
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}Z`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowFilledBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowHeadAttr } =
    getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
    `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}Z`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowDashedOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);
  const { microModeScale } = getOptionsWithConvertedUnits(options);

  const dashInterval = ARROW_DASH_INTERVAL * microModeScale;

  const path: string[] = [];

  const endX = start.x + arrowLength;

  // Dashed arrow
  for (let i = 0; i < arrowLength / dashInterval; i++) {
    if (i % 2) {
      path.push(`L${tfx(start.x + i * dashInterval)},${tfx(start.y)}`);
    } else {
      path.push(`M${tfx(start.x + i * dashInterval)},${tfx(start.y)}`);
    }
  }

  // Arrowhead
  path.push(
    `M${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
      `M${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowFailed(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowHeadAttr } =
    getArrowHeadDimensions(options);
  const { microModeScale } = getOptionsWithConvertedUnits(options);

  const failSignWidth = ARROW_FAIL_SIGN_WIDTH * microModeScale;

  const endX = start.x + arrowLength;

  const arrowCenter = endX - (endX - start.x) / 2;

  const path: string[] = [];

  // Arrow with arrowhead
  path.push(
    `M${tfx(start.x)},${tfx(start.y)}` +
      `L${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
      `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
      `L${tfx(endX)},${tfx(start.y)}Z`,
  );

  // Failed sign line 1
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y + failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y - failSignWidth)}`,
  );

  // Failed sign line 2
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y - failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y + failSignWidth)}`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowRetrosynthetic(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowOffset } =
    getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow and arrowhead
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX + arrowHeadLength)},${tfx(start.y)}`,
  );

  // Second arrow and arrowhead
  path.push(
    `M${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(endX + arrowHeadLength)},${tfx(start.y)}`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowBothEndsFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth } = getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(start.x + arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
    `L${tfx(start.x + arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
    `L${tfx(start.x)},${tfx(start.y)}`;

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowEquilibriumFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadAttr, arrowOffset, arrowHeadWidth } =
    getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // top arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(
        start.y - arrowOffset,
      )}Z`,
  );

  // bottom arrow
  path.push(
    `M${tfx(endX)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x + arrowHeadLength - arrowHeadAttr)},${
        start.y + arrowOffset
      }Z`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowEquilibriumFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowOffset, arrowHeadWidth } =
    getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y + arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}Z`,
  );

  // Second arrow
  path.push(
    `M${tfx(endX)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x + arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x)},${tfx(start.y + arrowOffset)}Z`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowEquilibriumOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowOffset } =
    getArrowHeadDimensions(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}`,
  );

  // Second arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y + arrowOffset)}` +
      `M${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength)},${tfx(
        start.y + arrowOffset + arrowHeadWidth,
      )}`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowUnbalancedEquilibriumFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowOffset, arrowHeadAttr } =
    getArrowHeadDimensions(options);
  const unbalanceVal = getUnbalancedArrowHeadOffset(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(
        start.y - arrowOffset,
      )}Z`,
  );

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(endX - unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + unbalanceVal + arrowHeadLength)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x + unbalanceVal + arrowHeadLength - arrowHeadAttr)},${
        start.y + arrowOffset
      }Z`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowUnbalancedEquilibriumOpenHalfAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowOffset } =
    getArrowHeadDimensions(options);
  const unbalanceVal = getUnbalancedArrowHeadOffset(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}`,
  );

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength + unbalanceVal)},${tfx(
        start.y + arrowOffset + arrowHeadWidth,
      )}`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    ...(shouldApplySnappingStyle && {
      stroke: options.arrowSnappingStyle.stroke,
    }),
  });
}

function arrowUnbalancedEquilibriumLargeFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const {
    arrowHeadLength,
    arrowHeadWidth: arrowHeadWidthNormal,
    arrowOffset,
    arrowHeadAttr,
  } = getArrowHeadDimensions(options);
  const unbalanceVal = getUnbalancedArrowHeadOffset(options);

  // Multiplying by 1.5 because it's large variant
  const arrowHeadWidth = arrowHeadWidthNormal * 1.5;

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(
        start.y - arrowOffset,
      )}Z`,
  );

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength + unbalanceVal)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x + arrowHeadLength - arrowHeadAttr + unbalanceVal)},${
        start.y + arrowOffset
      }Z`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function arrowUnbalancedEquilibriumFilledHalfTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions,
  shouldApplySnappingStyle: boolean,
) {
  const { arrowHeadLength, arrowHeadWidth, arrowOffset } =
    getArrowHeadDimensions(options);
  const unbalanceVal = getUnbalancedArrowHeadOffset(options);

  const endX = start.x + arrowLength;

  const path: string[] = [];

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(
        start.y - arrowHeadWidth - arrowOffset,
      )}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowOffset)}Z`,
  );

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowHeadLength + unbalanceVal)},${tfx(
        start.y + arrowHeadWidth + arrowOffset,
      )}` +
      `L${tfx(start.x + arrowHeadLength + unbalanceVal)},${
        start.y + arrowOffset
      }Z`,
  );

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString();

  return paper.path(transformedPath).attr({
    ...options.lineattr,
    fill: '#000',
    ...(shouldApplySnappingStyle && options.arrowSnappingStyle),
  });
}

function plus(paper: RaphaelPaper, point: Vec2, options: RenderOptions) {
  const s = options.microModeScale / 5;
  return paper
    .path(
      'M{0},{4}L{0},{5}M{2},{1}L{3},{1}',
      tfx(point.x),
      tfx(point.y),
      tfx(point.x - s),
      tfx(point.x + s),
      tfx(point.y - s),
      tfx(point.y + s),
    )
    .attr(options.lineattr);
}

function bondSingle(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  const a = halfBond1.p;
  const b = halfBond2.p;
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondSingleUp(
  paper: RaphaelPaper,
  a: Vec2,
  b2: Vec2,
  b3: Vec2,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  // eslint-disable-line max-params
  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}Z',
      tfx(a.x),
      tfx(a.y),
      tfx(b2.x),
      tfx(b2.y),
      tfx(b3.x),
      tfx(b3.y),
    )
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondSingleStereoBold(
  paper: RaphaelPaper,
  a1: Vec2,
  a2: Vec2,
  a3: Vec2,
  a4: Vec2,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  // eslint-disable-line max-params
  const bond = paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z',
      tfx(a1.x),
      tfx(a1.y),
      tfx(a2.x),
      tfx(a2.y),
      tfx(a3.x),
      tfx(a3.y),
      tfx(a4.x),
      tfx(a4.y),
    )
    .attr(options.lineattr)
    .attr({
      stroke: color,
      fill: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
  return bond;
}

function bondDoubleStereoBold(
  paper: RaphaelPaper,
  sgBondPath: Element,
  b1: Vec2,
  b2: Vec2,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  // eslint-disable-line max-params
  return paper.set([
    sgBondPath,
    paper
      .path('M{0},{1}L{2},{3}', tfx(b1.x), tfx(b1.y), tfx(b2.x), tfx(b2.y))
      .attr(options.lineattr)
      .attr({
        stroke: color,
        fill: color,
      })
      .attr(isSnapping ? options.bondSnappingStyle : {}),
  ]);
}

function bondSingleDown(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  d: Vec2,
  nlines: number,
  step: number,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  // eslint-disable-line max-params
  const a = halfBond1.p;
  const n = halfBond1.norm;
  const bsp = 0.7 * options.stereoBond;

  let path = '';
  let p;
  let q;
  let r;
  for (let i = 0; i < nlines; ++i) {
    r = a.addScaled(d, step * i);
    p = r.addScaled(n, (bsp * (i + 0.5)) / (nlines - 0.5));
    q = r.addScaled(n, (-bsp * (i + 0.5)) / (nlines - 0.5));
    path += makeStroke(p, q);
  }
  return paper
    .path(path)
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondSingleEither(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  d: Vec2,
  nlines: number,
  step: number,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  // eslint-disable-line max-params
  const a = halfBond1.p;
  const n = halfBond1.norm;
  const bsp = 0.7 * options.stereoBond;

  let path = 'M' + tfx(a.x) + ',' + tfx(a.y);
  let r = a;
  for (let i = 0; i < nlines; ++i) {
    r = a
      .addScaled(d, step * (i + 0.5))
      .addScaled(n, ((i & 1 ? -1 : +1) * bsp * (i + 0.5)) / (nlines - 0.5));
    path += 'L' + tfx(r.x) + ',' + tfx(r.y);
  }
  return paper
    .path(path)
    .attr(options.lineattr)
    .attr({
      stroke: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondDouble(
  paper: RaphaelPaper,
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  cisTrans: boolean,
  options: RenderOptions,
  isSnapping: boolean,
) {
  // eslint-disable-line max-params
  return paper
    .path(
      cisTrans
        ? 'M{0},{1}L{6},{7}M{4},{5}L{2},{3}'
        : 'M{0},{1}L{2},{3}M{4},{5}L{6},{7}',
      tfx(a1.x),
      tfx(a1.y),
      tfx(b1.x),
      tfx(b1.y),
      tfx(a2.x),
      tfx(a2.y),
      tfx(b2.x),
      tfx(b2.y),
    )
    .attr(options.lineattr)
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondSingleOrDouble(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  nSect: number,
  options: RenderOptions,
  isSnapping: boolean,
) {
  // eslint-disable-line max-statements, max-params
  const a = halfBond1.p;
  const b = halfBond2.p;
  const n = halfBond1.norm;
  const bsp = options.bondSpace / 2;

  let path = '';
  let pi;
  let pp = a;
  for (let i = 1; i <= nSect; ++i) {
    pi = Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect);
    if (i & 1) {
      path += makeStroke(pp, pi);
    } else {
      path += makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp));
      path += makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp));
    }
    pp = pi;
  }
  return paper
    .path(path)
    .attr(options.lineattr)
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondTriple(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  isSnapping: boolean,
  color = '#000',
) {
  const a = halfBond1.p;
  const b = halfBond2.p;
  const n = halfBond1.norm;
  const a2 = a.addScaled(n, options.bondSpace);
  const b2 = b.addScaled(n, options.bondSpace);
  const a3 = a.addScaled(n, -options.bondSpace);
  const b3 = b.addScaled(n, -options.bondSpace);
  return paper
    .path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3))
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color,
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondAromatic(
  paper: RaphaelPaper,
  paths: string[],
  bondShift: number,
  options: RenderOptions,
  isSnapping: boolean,
) {
  const l1 = paper
    .path(paths[0])
    .attr(options.lineattr)
    .attr(isSnapping ? options.bondSnappingStyle : {});
  const l2 = paper
    .path(paths[1])
    .attr(options.lineattr)
    .attr(isSnapping ? options.bondSnappingStyle : {});
  if (bondShift !== undefined && bondShift !== null) {
    (bondShift > 0 ? l1 : l2).attr({ 'stroke-dasharray': '- ' });
  }

  return paper.set([l1, l2]);
}

function bondAny(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  isSnapping: boolean,
) {
  const a = halfBond1.p;
  const b = halfBond2.p;
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'stroke-dasharray': '- ' })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondHydrogen(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  isSnapping: boolean,
) {
  const a = halfBond1.p;
  const b = halfBond2.p;
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({
      'stroke-dasharray': '.',
      'stroke-linecap': 'square',
    })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function bondDative(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  isSnapping: boolean,
) {
  const a = halfBond1.p;
  const b = halfBond2.p;

  if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {
    return paper.path('');
  }

  const directionVec = Vec2.diff(b, a);
  // if bond is too short, draw a symbol instead
  if (directionVec.length() < 5) {
    const angleDegrees =
      Math.atan2(directionVec.y, directionVec.x) * (180 / Math.PI);
    return drawArrowSymbol(paper, b, options, angleDegrees);
  }

  // For normal-length bonds, draw with an arrow
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'arrow-end': 'block-midium-long' })
    .attr(isSnapping ? options.bondSnappingStyle : {});
}

function drawArrowSymbol(
  paper: RaphaelPaper,
  point: Vec2,
  options: RenderOptions,
  angleDegrees: number,
) {
  const baseSize = options.microModeScale * 0.1;
  const arrowHalfWidth = baseSize / 1.32;
  const arrowHeight = baseSize * 2.5;

  const arrowBasePath = `M0,0 L${-arrowHeight},${-arrowHalfWidth} L${-arrowHeight},${arrowHalfWidth} Z`;

  const finalPath = svgPath(arrowBasePath)
    .rotate(angleDegrees, 0, 0)
    .translate(point.x, point.y)
    .toString();

  return paper.path(finalPath).attr({
    ...options.lineattr,
    'stroke-width': 0,
    fill: options.lineattr.stroke,
  });
}

function reactingCenter(
  paper: RaphaelPaper,
  points: Vec2[],
  options: RenderOptions,
) {
  let pathDesc = '';
  for (let i = 0; i < points.length / 2; ++i) {
    pathDesc += makeStroke(points[2 * i], points[2 * i + 1]);
  }
  return paper.path(pathDesc).attr(options.lineattr);
}

function bondMark(
  paper: RaphaelPaper,
  point: Vec2,
  mark: string | null,
  options: RenderOptions,
) {
  const path = paper.text(point.x, point.y, mark).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: '#000',
  });
  const rbb = util.relBox(path.getBBox());
  recenterText(path, rbb);
  return path;
}

function radicalCap(paper: RaphaelPaper, point1: Vec2, options: RenderOptions) {
  const s = options.lineWidth * 0.9;
  const dw = s;
  const dh = 2 * s;
  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}',
      tfx(point1.x - dw),
      tfx(point1.y + dh),
      tfx(point1.x),
      tfx(point1.y),
      tfx(point1.x + dw),
      tfx(point1.y + dh),
    )
    .attr({
      stroke: '#000',
      'stroke-width': options.lineWidth * 0.7,
      'stroke-linecap': 'square',
      'stroke-linejoin': 'miter',
    });
}

function radicalBullet(
  paper: RaphaelPaper,
  point1: Vec2,
  options: RenderOptions,
) {
  return paper.circle(tfx(point1.x), tfx(point1.y), options.lineWidth).attr({
    stroke: null,
    fill: '#000',
  });
}

function bracket(
  paper: RaphaelPaper,
  bracketAngleDirection: Vec2,
  bracketDirection: Vec2,
  bondCenter: Vec2,
  bracketWidth: number,
  bracketHeight: number,
  options: RenderOptions,
) {
  // eslint-disable-line max-params
  bracketWidth = bracketWidth || 0.25;
  bracketHeight = bracketHeight || 1.0;
  const halfBracketHeight = 0.5;
  const bracketPoint0 = bondCenter.addScaled(
    bracketDirection,
    -halfBracketHeight * bracketHeight,
  );
  const bracketPoint1 = bondCenter.addScaled(
    bracketDirection,
    halfBracketHeight * bracketHeight,
  );
  const bracketArc0 = bracketPoint0.addScaled(
    bracketAngleDirection,
    -bracketWidth,
  );
  const bracketArc1 = bracketPoint1.addScaled(
    bracketAngleDirection,
    -bracketWidth,
  );

  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}L{6},{7}',
      tfx(bracketArc0.x),
      tfx(bracketArc0.y),
      tfx(bracketPoint0.x),
      tfx(bracketPoint0.y),
      tfx(bracketPoint1.x),
      tfx(bracketPoint1.y),
      tfx(bracketArc1.x),
      tfx(bracketArc1.y),
    )
    .attr(options.sgroupBracketStyle);
}

function selectionRectangle(
  paper: RaphaelPaper,
  point1: Vec2,
  point2: Vec2,
  options: RenderOptions,
) {
  return paper
    .rect(
      tfx(Math.min(point1.x, point2.x)),
      tfx(Math.min(point1.y, point2.y)),
      tfx(Math.abs(point2.x - point1.x)),
      tfx(Math.abs(point2.y - point1.y)),
    )
    .attr(options.lassoStyle);
}

function selectionPolygon(
  paper: RaphaelPaper,
  r: Vec2[],
  options: RenderOptions,
) {
  const v = r[r.length - 1];
  let pstr = 'M' + tfx(v.x) + ',' + tfx(v.y);
  for (let i = 0; i < r.length; ++i) {
    pstr += 'L' + tfx(r[i].x) + ',' + tfx(r[i].y);
  }
  return paper.path(pstr).attr(options.lassoStyle);
}

function selectionLine(
  paper: RaphaelPaper,
  point1: Vec2,
  point2: Vec2,
  options: RenderOptions,
) {
  return paper.path(makeStroke(point1, point2)).attr(options.lassoStyle);
}

function makeStroke(point1: Vec2, point2: Vec2) {
  return (
    'M' +
    tfx(point1.x) +
    ',' +
    tfx(point1.y) +
    'L' +
    tfx(point2.x) +
    ',' +
    tfx(point2.y) +
    '	'
  );
}

function dashedPath(point1: Vec2, point2: Vec2, dash: number[]) {
  let t0 = 0;
  const t1 = Vec2.dist(point1, point2);
  const d = Vec2.diff(point2, point1).normalized();
  let black = true;
  let path = '';
  let i = 0;

  while (t0 < t1) {
    const len = dash[i % dash.length];
    const t2 = t0 + Math.min(len, t1 - t0);
    if (black) {
      path +=
        'M ' +
        point1.addScaled(d, t0).coordStr() +
        ' L ' +
        point1.addScaled(d, t2).coordStr();
    }
    t0 += len;
    black = !black;
    i++;
  }
  return path;
}

function aromaticBondPaths(
  a2: Vec2,
  a3: Vec2,
  b2: Vec2,
  b3: Vec2,
  mask: number,
  dash: number[] | null,
) {
  // eslint-disable-line max-params
  const l1 = dash && mask & 1 ? dashedPath(a2, b2, dash) : makeStroke(a2, b2);
  const l2 = dash && mask & 2 ? dashedPath(a3, b3, dash) : makeStroke(a3, b3);

  return [l1, l2];
}

function recenterText(path: Element, relativeBox: RelativeBox) {
  // TODO: find a better way
  if (Raphael.vml) {
    const gap = relativeBox.height * 0.16;
    path.translateAbs(0, gap);
    relativeBox.y += gap;
  }
}

function rgroupAttachmentPoint(
  paper: RaphaelPaper,
  shiftedAtomPositionVector: Vec2,
  attachmentPointEnd: Vec2,
  directionVector: Vec2,
  options: RenderOptions,
) {
  const linePath = paper.path(
    'M{0},{1}L{2},{3}',
    tfx(shiftedAtomPositionVector.x),
    tfx(shiftedAtomPositionVector.y),
    tfx(attachmentPointEnd.x),
    tfx(attachmentPointEnd.y),
  );

  const curvePath = paper.path(
    getSvgCurveShapeAttachmentPoint(
      attachmentPointEnd,
      directionVector,
      options.microModeScale,
    ),
  );

  const resultShape = paper
    .set([curvePath, linePath])
    .attr(options.lineattr)
    .attr({ 'stroke-width': options.bondThicknessInPx });

  return resultShape;
}

function getSvgCurveShapeAttachmentPoint(
  centerPosition: Vec2,
  directionVector: Vec2,
  basicSize: number,
): string {
  // declared here https://github.com/epam/ketcher/issues/2165
  // this path has (0,0) in the position of attachment point atom
  const attachmentPointSvgPathString = `M13 1.5l-1.5 3.7c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.8 0l-1.8-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.6 4.2c-0.3 0.9-1.6 0.8-1.9 0l-1.2-3.5`;
  const attachmentPointSvgPathSize = 39.8;

  const shapeScale = basicSize / attachmentPointSvgPathSize;
  const angleDegrees =
    (Math.atan2(directionVector.y, directionVector.x) * 180) / Math.PI - 90;

  return svgPath(attachmentPointSvgPathString)
    .rotate(angleDegrees)
    .scale(shapeScale)
    .translate(centerPosition.x, centerPosition.y)
    .toString();
}

function rgroupAttachmentPointLabel(
  paper: RaphaelPaper,
  labelPosition: Vec2,
  labelText: string,
  options: RenderOptions,
  fill,
) {
  const labelPath = paper
    .text(labelPosition.x, labelPosition.y, labelText)
    .attr({
      font: options.font,
      'font-size': options.fontszInPx * 0.9,
      fill,
    });
  return labelPath;
}

export default {
  recenterText,
  arrow,
  plus,
  aromaticBondPaths,
  bondSingle,
  bondSingleUp,
  bondSingleStereoBold,
  bondDoubleStereoBold,
  bondSingleDown,
  bondSingleEither,
  bondDouble,
  bondSingleOrDouble,
  bondTriple,
  bondAromatic,
  bondAny,
  bondHydrogen,
  bondDative,
  reactingCenter,
  bondMark,
  radicalCap,
  radicalBullet,
  bracket,
  selectionRectangle,
  selectionPolygon,
  selectionLine,
  ellipse,
  rectangle,
  rectangleArrowHighlightAndSelection,
  polyline,
  line,
  rgroupAttachmentPoint,
  rgroupAttachmentPointLabel,
};
