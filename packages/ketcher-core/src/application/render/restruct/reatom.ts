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

import {
  Atom,
  Bond,
  Box2Abs,
  FunctionalGroup,
  SGroup,
  StereoFlag,
  StereoLabel,
  Struct,
  Vec2,
} from 'domain/entities';
import { ElementColor, Elements } from 'domain/constants';
import {
  LayerMap,
  StereLabelStyleType,
  StereoColoringType,
} from './generalEnumTypes';

import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { tfx } from 'utilities';
import {
  RenderOptions,
  RenderOptionStyles,
} from 'application/render/render.types';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { attachmentPointNames } from 'domain/types';
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';
import { VALENCE_MAP } from 'application/render/restruct/constants';
import { SUPERATOM_CLASS_TEXT } from 'application/render/restruct/resgroup';

interface ElemAttr {
  text: string;
  path: any;
  rbb: { x: number; y: number; width: number; height: number };
}

const StereoLabelMinOpacity = 0.3;
const MAX_LABEL_LENGTH = 8;

export enum ShowHydrogenLabels {
  Off = 'off',
  Hetero = 'Hetero',
  Terminal = 'Terminal',
  TerminalAndHetero = 'Terminal and Hetero',
  On = 'all',
}

export enum ShowHydrogenLabelNames {
  Off = 'Off',
  Hetero = 'Hetero',
  Terminal = 'Terminal',
  TerminalAndHetero = 'Terminal and Hetero',
  On = 'On',
}

class ReAtom extends ReObject {
  a: Atom;
  showLabel: boolean;
  showInfoLabel: boolean;
  hydrogenOnTheLeft: boolean;
  color: string;
  component: number;
  label?: ElemAttr;
  infoLabel?: string;
  cip?: {
    // Raphael paths
    path: any;
    text: any;
    rectangle: any;
  };

  private expandedMonomerAttachmentPoints?: any; // Raphael paths

  constructor(atom: Atom) {
    super('atom');
    this.a = atom; // TODO rename a to item
    this.showLabel = false;
    this.showInfoLabel = false;

    this.hydrogenOnTheLeft = false;

    this.color = '#000000';
    this.component = -1;
  }

  static isSelectable(): true {
    return true;
  }

  getVBoxObj(render: Render): Box2Abs | null {
    if (this.visel.boundingBox) {
      return ReObject.prototype.getVBoxObj.call(this, render);
    }
    return new Box2Abs(this.a.pp, this.a.pp);
  }

  drawHover(render: Render) {
    const ret = this.makeHoverPlate(render);

    render.ctab.addReObjectPath(LayerMap.atom, this.visel, ret);

    return ret;
  }

  setHover(hover: boolean, render: Render) {
    super.setHover(hover, render);

    if (!hover || this.selected) {
      this.expandedMonomerAttachmentPoints?.hide();

      return;
    }

    if (this.expandedMonomerAttachmentPoints?.removed) {
      this.expandedMonomerAttachmentPoints = undefined;
    }

    if (this.expandedMonomerAttachmentPoints) {
      this.expandedMonomerAttachmentPoints.show();
    } else {
      this.expandedMonomerAttachmentPoints =
        this.makeMonomerAttachmentPointHighlightPlate(render);
    }
  }

  public makeMonomerAttachmentPointHighlightPlate(render: Render) {
    const restruct = render.ctab;
    const struct = restruct.molecule;
    const aid = struct.atoms.keyOf(this.a) || undefined;
    const sgroup = struct.getGroupFromAtomId(aid);

    if (!(sgroup instanceof MonomerMicromolecule)) {
      return;
    }

    let style: RenderOptionStyles | undefined;

    if (Atom.isSuperatomAttachmentAtom(struct, aid)) {
      style = { fill: 'none', stroke: '#4da3f8', 'stroke-width': '2px' };
    }

    if (Atom.isSuperatomLeavingGroupAtom(struct, aid)) {
      style = {
        fill: '#fff8c5',
        stroke: '#f8dc8f',
        'stroke-width': '2px',
      };
    }

    if (style) {
      const path = this.makeHighlightePlate(restruct, style, -4);

      restruct.addReObjectPath(LayerMap.atom, this.visel, path);

      return path;
    }
  }

  getLabeledSelectionContour(render: Render, highlightPadding = 0) {
    const { paper, ctab: restruct, options } = render;
    const { fontszInPx, radiusScaleFactor } = options;
    const padding = fontszInPx * radiusScaleFactor + highlightPadding;
    const radius = fontszInPx * radiusScaleFactor * 2 + highlightPadding;
    const box = this.getVBoxObj(restruct.render)!;
    const ps1 = Scale.modelToCanvas(box.p0, restruct.render.options);
    const ps2 = Scale.modelToCanvas(box.p1, restruct.render.options);
    const width = ps2.x - ps1.x;
    const height = fontszInPx * 1.23;
    return paper.rect(
      ps1.x - padding,
      ps1.y - padding,
      width + padding * 2,
      height + padding * 2,
      radius,
    );
  }

  getUnlabeledSelectionContour(render: Render, highlightPadding = 0) {
    const { paper, options } = render;
    const { atomSelectionPlateRadius } = options;
    const ps = Scale.modelToCanvas(this.a.pp, options);
    return paper.circle(
      ps.x,
      ps.y,
      atomSelectionPlateRadius + highlightPadding,
    );
  }

  getSelectionContour(render: Render, highlightPadding = 0) {
    const hasLabel =
      (this.a.pseudo && this.a.pseudo.length > 1 && !getQueryAttrsText(this)) ||
      (this.showLabel && this.a.implicitH !== 0);

    return hasLabel
      ? this.getLabeledSelectionContour(render, highlightPadding)
      : this.getUnlabeledSelectionContour(render, highlightPadding);
  }

  private isPlateShouldBeHidden = (atom: Atom, render: Render) => {
    const sgroups = render.ctab.sgroups;
    const functionalGroups = render.ctab.molecule.functionalGroups;
    const struct = render.ctab.molecule;
    const atomId = struct.atoms.keyOf(atom) as number;

    return (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
      ) || Atom.isHiddenLeavingGroupAtom(struct, atomId)
    );
  };

  private makeHighlightePlate = (
    restruct: ReStruct,
    style: RenderOptionStyles,
    highlightPadding = -2,
  ) => {
    const atom = this.a;
    const { render } = restruct;
    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }

    return this.getSelectionContour(render, highlightPadding).attr(style);
  };

  makeHoverPlate(render: Render) {
    const atom = this.a;
    const { options } = render;
    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }

    return this.getSelectionContour(render).attr(options.hoverStyle);
  }

  makeSelectionPlate(restruct: ReStruct) {
    const atom = this.a;
    const { render } = restruct;
    const { options } = render;

    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }
    return this.getSelectionContour(render).attr(options.selectionStyle);
  }

  private isNeedShiftForCharge(showCharge: boolean, bondLength: number) {
    const MIN_BOND_LENGTH = 24;
    const isBondLengthTooShort = bondLength <= MIN_BOND_LENGTH;
    const hasCharge = this.a.charge !== null && this.a.charge !== 0;
    return showCharge && isBondLengthTooShort && hasCharge;
  }

  private getRatio(
    renderOptions: RenderOptions,
    bondLen: number | null,
  ): number {
    const DEFAULT_BOND_LENGTH = 40;
    const DEFAULT_SUB_FONT_SIZE = 13;
    const subFontSize = renderOptions.fontszsubInPx || DEFAULT_SUB_FONT_SIZE;
    if (!bondLen) return 1;
    const showCharge = renderOptions.showCharge;

    const isNeedShift = this.isNeedShiftForCharge(showCharge, bondLen);

    if (!isNeedShift) {
      return 1;
    }

    const DEFAULT_PROPORTION = DEFAULT_BOND_LENGTH / DEFAULT_SUB_FONT_SIZE;
    const currentProportion = bondLen / subFontSize;
    const ratio = currentProportion / DEFAULT_PROPORTION;
    return ratio;
  }

  /**
   * if atom is rendered as Abbreviation: O, NH, ...
   * In this case we need to shift the bond render start position to free space for Atom,
   * same for the Attachment point
   */
  getShiftedSegmentPosition(
    renderOptions: RenderOptions,
    direction: Vec2,
    _atomPosition?: Vec2,
    bondLen: number | null = null,
  ): Vec2 {
    const atomPosition = Scale.modelToCanvas(
      _atomPosition || this.a.pp,
      renderOptions,
    );
    let atomSymbolShift = 0;
    const exts = this.visel.exts;
    const ratio = this.getRatio(renderOptions, bondLen);
    for (let k = 0; k < exts.length; ++k) {
      const box = exts[k].translate(atomPosition);
      const shiftRayBox = util.shiftRayBox(atomPosition, direction, box);
      const shift = shiftRayBox * ratio;
      atomSymbolShift = Math.max(atomSymbolShift, shift);
    }

    if (atomSymbolShift > 0) {
      return atomPosition.addScaled(
        direction,
        atomSymbolShift + 3 * renderOptions.lineWidth,
      );
    } else {
      return atomPosition;
    }
  }

  hasAttachmentPoint(): boolean {
    return Boolean(this.a.attachmentPoints);
  }

  show(restruct: ReStruct, aid: number, options: any): void {
    // eslint-disable-line max-statements
    const struct = restruct.molecule;
    const atom = struct.atoms.get(aid)!;
    const sgroups = struct.sgroups;
    const functionalGroups = struct.functionalGroups;
    const render = restruct.render;
    const ps = Scale.modelToCanvas(this.a.pp, render.options);
    const sgroup = restruct.molecule.getGroupFromAtomId(aid);

    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
      )
    ) {
      const isPositionAtom =
        sgroup?.getContractedPosition(restruct.molecule).atomId === aid;
      if (isPositionAtom) {
        const position = Scale.modelToCanvas(
          sgroup instanceof MonomerMicromolecule
            ? (sgroup.pp as Vec2)
            : this.a.pp,
          render.options,
        );
        const fontFamily = options.font.substr(
          options.font.indexOf(' ') + 1,
          options.font.length,
        );
        const sGroupName =
          sgroup.data.name || SUPERATOM_CLASS_TEXT[sgroup.data.class] || '';
        const path = render.paper
          .text(position.x, position.y, sGroupName)
          .attr({
            'font-weight': 700,
            'font-size': options.fontszInPx,
            'font-family': fontFamily,
          });

        path.node?.setAttribute('data-sgroup-id', sgroup.id);
        path.node?.setAttribute('data-sgroup-name', sGroupName);
        path.node?.setAttribute('data-sgroup-type', sgroup.type);

        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          path,
          position,
          true,
        );
      }
      return;
    }

    if (Atom.isHiddenLeavingGroupAtom(struct, aid)) {
      return;
    }

    this.hydrogenOnTheLeft = shouldHydrogenBeOnLeft(restruct.molecule, this);
    this.showLabel = isLabelVisible(restruct, render.options, this);
    this.color = 'black'; // reset color

    let delta;
    let rightMargin;
    let leftMargin;
    let implh;
    let isHydrogen;
    let label;
    let index: any = null;

    if (this.showLabel) {
      const data = buildLabel(this, render.paper, ps, options, aid, sgroup);
      delta = 0.5 * options.lineWidth;
      label = data.label;
      rightMargin = data.rightMargin;
      leftMargin = data.leftMargin;
      implh = Math.floor(this.a.implicitH);
      isHydrogen = label.text === 'H';

      if (label.background) {
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          label.background,
          ps,
          true,
        );
      }
      restruct.addReObjectPath(LayerMap.data, this.visel, label.path, ps, true);
    }

    if (options.showAtomIds) {
      index = {};
      index.text = aid.toString();
      let idPos = this.hydrogenOnTheLeft
        ? Vec2.lc(ps, 1, new Vec2({ x: -2, y: 0, z: 0 }), 6)
        : Vec2.lc(ps, 1, new Vec2({ x: 2, y: 0, z: 0 }), 6);
      if (this.showLabel) {
        idPos = Vec2.lc(idPos, 1, new Vec2({ x: 1, y: -3, z: 0 }), 6);
      }
      index.path = render.paper.text(idPos.x, idPos.y, index.text).attr({
        font: options.font,
        'font-size': options.fontszsubInPx,
        fill: '#070',
      });
      index.rbb = util.relBox(index.path.getBBox());
      draw.recenterText(index.path, index.rbb);
      restruct.addReObjectPath(LayerMap.indices, this.visel, index.path, ps);
    }

    if (this.showLabel) {
      let hydroIndex: any = null;
      if (isHydrogen && implh > 0) {
        hydroIndex = showHydroIndex(this, render, implh, rightMargin);
        rightMargin += hydroIndex.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydroIndex.path,
          ps,
          true,
        );
      }

      if (this.a.radical !== 0) {
        const radical = showRadical(this, render);
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          radical.path,
          ps,
          true,
        );
      }
      if (this.a.isotope !== null) {
        const isotope = showIsotope(this, render, leftMargin);
        leftMargin -= isotope.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          isotope.path,
          ps,
          true,
        );
      }
      if (
        !isHydrogen &&
        !this.a.alias &&
        implh > 0 &&
        displayHydrogen(this, options.showHydrogenLabels)
      ) {
        const data = showHydrogen(this, render, implh, {
          hydrogen: {},
          hydroIndex,
          rightMargin,
          leftMargin,
        });
        const hydrogen = data.hydrogen;
        hydroIndex = data.hydroIndex;
        rightMargin = data.rightMargin;
        leftMargin = data.leftMargin;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydrogen.path,
          ps,
          true,
        );
        if (hydroIndex != null) {
          restruct.addReObjectPath(
            LayerMap.data,
            this.visel,
            hydroIndex.path,
            ps,
            true,
          );
        }
      }
      if (this.a.charge === 0) {
        this.a.charge = null;
      }
      if (this.a.charge && options.showCharge) {
        const charge = showCharge(this, render, rightMargin);
        rightMargin += charge.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          charge.path,
          ps,
          true,
        );
      }
      if (this.a.explicitValence >= 0 && options.showValence) {
        const valence = showExplicitValence(this, render, rightMargin);
        rightMargin += valence.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          valence.path,
          ps,
          true,
        );
      }

      if (this.a.badConn && options.showValenceWarnings) {
        const warning = showWarning(this, render, leftMargin, rightMargin);
        restruct.addReObjectPath(
          LayerMap.warnings,
          this.visel,
          warning.path,
          ps,
          true,
        );
      }
      if (index) {
        /* eslint-disable no-mixed-operators */
        pathAndRBoxTranslate(
          index.path,
          index.rbb,
          -0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
          0.3 * label.rbb.height,
        );
        /* eslint-enable no-mixed-operators */
      }
    }

    // draw hover after label is calculated
    this.setHover(this.hover, render);

    const stereoLabel = this.a.stereoLabel; // Enhanced Stereo
    const aamText = getAamText(this);
    const customQueryText = checkIsSmartPropertiesExist(this.a)
      ? getOnlyQueryAttributesCustomQuery(this.a)
      : getQueryAttrsText(this);
    let shortenCustomQueryText = customQueryText;
    let customQueryTooltipText: string | undefined;

    if (shortenCustomQueryText.length > MAX_LABEL_LENGTH) {
      customQueryTooltipText = shortenCustomQueryText;
      shortenCustomQueryText = `${shortenCustomQueryText.substring(
        0,
        MAX_LABEL_LENGTH,
      )}...`;
    }

    // we render them together to avoid possible collisions

    const fragmentId = Number(restruct.atoms.get(aid)?.a.fragment);
    // TODO: fragment should not be null
    const fragment = restruct.molecule.frags.get(fragmentId);

    const displayStereoLabel = shouldDisplayStereoLabel(
      stereoLabel,
      options.stereoLabelStyle,
      options.ignoreChiralFlag,
      fragment?.enhancedStereoFlag,
    );

    let text = '';

    if (displayStereoLabel) {
      text = `${stereoLabel}\n`;
    }

    if (shortenCustomQueryText.length > 0) {
      text += `${shortenCustomQueryText}\n`;
    }

    if (aamText.length > 0) {
      text += `.${aamText}.`;
    }

    if (text.length > 0) {
      const elem = Elements.get(this.a.label);
      const aamPath = render.paper.text(ps.x, ps.y, text).attr({
        font: options.font,
        'font-size': options.fontszsubInPx,
        fill:
          options.atomColoring && elem ? ElementColor[this.a.label] : '#000',
      });
      if (stereoLabel) {
        // use dom element to change color of stereo label which is the first element
        // of just created text
        // text -> tspan
        const color = getStereoAtomColor(render.options, stereoLabel);
        aamPath.node.childNodes[0].setAttribute('fill', color);
        const opacity = getStereoAtomOpacity(render.options, stereoLabel);
        aamPath.node.childNodes[0].setAttribute('fill-opacity', opacity);
      }
      const aamBox = util.relBox(aamPath.getBBox());
      draw.recenterText(aamPath, aamBox);
      const visel = this.visel;
      let t = 3;
      let dir = this.bisectLargestSector(restruct.molecule);
      // estimate the shift to clear the atom label
      for (let i = 0; i < visel.exts.length; ++i) {
        t = Math.max(t, util.shiftRayBox(ps, dir, visel.exts[i].translate(ps)));
      }
      // estimate the shift backwards to account for the size of the aam/query text box itself
      t += util.shiftRayBox(ps, dir.negated(), Box2Abs.fromRelBox(aamBox));
      dir = dir.scaled(8 + t);
      pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
      restruct.addReObjectPath(LayerMap.data, this.visel, aamPath, ps, true);

      if (customQueryTooltipText) {
        addTooltip(aamPath.node, customQueryTooltipText);
      }
    }

    // Checking whether atom is highlighted and what's the last color
    const highlights = restruct.molecule.highlights;
    let isHighlighted = false;
    let highlightColor = '';
    highlights.forEach((highlight) => {
      const hasCurrentHighlight = highlight.atoms?.includes(aid);
      isHighlighted = isHighlighted || hasCurrentHighlight;
      if (hasCurrentHighlight) {
        highlightColor = highlight.color;
      }
    });

    // Drawing highlight
    if (isHighlighted) {
      const style = { fill: highlightColor, stroke: 'none' };

      const path = this.makeHighlightePlate(restruct, style);
      restruct.addReObjectPath(LayerMap.hovering, this.visel, path);
    }

    if (atom.cip) {
      const paper = render.paper;
      const options = render.options;
      const ps = Scale.modelToCanvas(this.a.pp, options);

      const cipText = paper.text(ps.x, ps.y, `(${this.a.cip})`).attr({
        font: options.font,
        'font-size': Math.floor(options.fontszInPx * 0.8),
        'pointer-events': 'none',
      });
      const cipTextBBox = cipText.getBBox();

      const rect = paper
        .rect(
          cipTextBBox.x - 1,
          cipTextBBox.y - 1,
          cipTextBBox.width + 2,
          cipTextBBox.height + 2,
          3,
          3,
        )
        .attr({ stroke: 'none' });

      const cipGroup = paper.set();
      cipGroup.push(rect, cipText);
      const cipGroupRelBox = util.relBox(cipGroup.getBBox());

      let baseDistance = 3;
      const direction = this.bisectLargestSector(render.ctab.molecule);
      for (let i = 0; i < this.visel.exts.length; ++i) {
        baseDistance = Math.max(
          baseDistance,
          util.shiftRayBox(ps, direction, this.visel.exts[i].translate(ps)),
        );
      }
      const shiftDistance =
        baseDistance +
        util.shiftRayBox(
          ps,
          direction.negated(),
          Box2Abs.fromRelBox(cipTextBBox),
        );
      const shiftVector = direction.scaled(3 + shiftDistance);
      pathAndRBoxTranslate(
        cipGroup,
        cipGroupRelBox,
        shiftVector.x,
        shiftVector.y,
      );

      render.ctab.addReObjectPath(
        LayerMap.additionalInfo,
        this.visel,
        cipGroup,
        ps,
        false,
      );

      this.cip = { path: cipGroup, text: cipText, rectangle: rect };
    }

    if (this.showLabel && this.showInfoLabel) {
      const path = render.paper.text(ps.x, ps.y, this.infoLabel).attr({
        font: options.font,
        'font-size': options.fontszsubInPx * 0.75,
        fill: '#309BBF',
      });

      const bbTooltip = path.getBBox();
      const paddingX = 5;
      const paddingY = 2;

      const halfWidthInfoLabel = bbTooltip.width / 2 + paddingX;
      const halfHeightInfoLabel = bbTooltip.height / 2 + paddingY;

      path.translateAbs(
        rightMargin + halfWidthInfoLabel,
        -path.getBBox().height / 2 - halfHeightInfoLabel,
      );

      const rect = render.paper
        .rect(
          bbTooltip.x - paddingX,
          bbTooltip.y - paddingY,
          bbTooltip.width + paddingX * 2,
          bbTooltip.height + paddingY * 2,
          6,
        )
        .attr({ fill: '#CDF1FC', stroke: 'none' });

      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        [rect, path],
        ps,
        true,
      );
    }
  }

  getLargestSectorFromNeighbors(struct: Struct): {
    neighborAngle: number;
    largestAngle: number;
  } {
    let angles: Array<number> = [];
    this.a.neighbors.forEach((halfBondId) => {
      const halfBond = struct.halfBonds.get(halfBondId);
      halfBond && angles.push(halfBond.ang);
    });
    angles = angles.sort((a, b) => a - b);
    const largeAngles: Array<number> = [];
    for (let i = 0; i < angles.length - 1; ++i) {
      largeAngles.push(angles[(i + 1) % angles.length] - angles[i]);
    }
    largeAngles.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
    let largestAngle = 0;
    let neighborAngle = -Math.PI / 2;
    for (let i = 0; i < angles.length; ++i) {
      if (largeAngles[i] > largestAngle) {
        largestAngle = largeAngles[i];
        neighborAngle = angles[i];
      }
    }

    return { neighborAngle, largestAngle };
  }

  bisectLargestSector(struct: Struct): Vec2 {
    const { largestAngle, neighborAngle } =
      this.getLargestSectorFromNeighbors(struct);
    const bisectAngle = neighborAngle + largestAngle / 2;
    return newVectorFromAngle(bisectAngle);
  }
}

function getStereoAtomColor(options, stereoLabel) {
  if (
    !stereoLabel ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return '#000';
  }

  return getColorFromStereoLabel(options, stereoLabel);
}

export function getColorFromStereoLabel(options, stereoLabel) {
  const stereoLabelType = stereoLabel.match(/\D+/g)[0];

  switch (stereoLabelType) {
    case StereoLabel.And:
      return options.colorOfAndCenters;
    case StereoLabel.Or:
      return options.colorOfOrCenters;
    case StereoLabel.Abs:
      return options.colorOfAbsoluteCenters;
    default:
      return '#000';
  }
}

function getStereoAtomOpacity(options, stereoLabel) {
  const stereoLabelType = stereoLabel.match(/\D+/g)[0];
  const stereoLabelNumber = +stereoLabel.replace(stereoLabelType, '');
  if (
    !options.autoFadeOfStereoLabels ||
    stereoLabelType === StereoLabel.Abs ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return 1;
  }
  return Math.max(1 - (stereoLabelNumber - 1) / 10, StereoLabelMinOpacity);
}

function shouldDisplayStereoLabel(
  stereoLabel,
  labelStyle,
  ignoreChiralFlag,
  flag: StereoFlag | undefined,
): boolean {
  if (!stereoLabel) {
    return false;
  }

  const stereoLabelType = stereoLabel.match(/\D+/g)[0];

  if (ignoreChiralFlag && stereoLabelType === StereoLabel.Abs) {
    return false;
  }
  if (ignoreChiralFlag && stereoLabelType !== StereoLabel.Abs) {
    return true;
  }

  switch (labelStyle) {
    case StereLabelStyleType.Off:
      return false;
    case StereLabelStyleType.On:
      return true;
    case StereLabelStyleType.Classic:
      return !!(
        flag === StereoFlag.Mixed || stereoLabelType === StereoLabel.Or
      );
    case StereLabelStyleType.IUPAC:
      return !!(
        flag === StereoFlag.Mixed && stereoLabelType !== StereoLabel.Abs
      );
    default:
      return true;
  }
}

function isLabelVisible(restruct, options, atom: ReAtom) {
  const isAttachmentPointAtom = Boolean(atom.a.attachmentPoints);
  const isCarbon = atom.a.label.toLowerCase() === 'c';
  const visibleTerminal =
    options.showHydrogenLabels !== ShowHydrogenLabels.Off &&
    options.showHydrogenLabels !== ShowHydrogenLabels.Hetero;

  const neighborsLength =
    atom.a.neighbors.length === 0 ||
    (atom.a.neighbors.length < 2 && visibleTerminal);

  if (isAttachmentPointAtom && isCarbon) {
    return false;
  }

  const shouldBeVisible =
    neighborsLength ||
    options.carbonExplicitly ||
    options.showHydrogenLabels === ShowHydrogenLabels.On ||
    atom.a.alias ||
    atom.a.isotope !== null ||
    atom.a.radical !== 0 ||
    atom.a.charge !== null ||
    atom.a.explicitValence >= 0 ||
    atom.a.atomList !== null ||
    atom.a.rglabel !== null ||
    (atom.a.badConn && options.showValenceWarnings) ||
    atom.a.label.toLowerCase() !== 'c';

  if (shouldBeVisible) return true;

  if (atom.a.neighbors.length === 2) {
    const nei1 = atom.a.neighbors[0];
    const nei2 = atom.a.neighbors[1];
    const hb1 = restruct.molecule.halfBonds.get(nei1);
    const hb2 = restruct.molecule.halfBonds.get(nei2);
    const bond1 = restruct.bonds.get(hb1.bid);
    const bond2 = restruct.bonds.get(hb2.bid);

    const sameNotStereo =
      bond1.b.type === bond2.b.type &&
      bond1.b.stereo === Bond.PATTERN.STEREO.NONE &&
      bond2.b.stereo === Bond.PATTERN.STEREO.NONE;

    if (sameNotStereo && Math.abs(Vec2.cross(hb1.dir, hb2.dir)) < 0.2) {
      return true;
    }
  }

  return false;
}

function displayHydrogen(atom: ReAtom, hydrogenLabels: ShowHydrogenLabels) {
  return (
    hydrogenLabels === ShowHydrogenLabels.On ||
    (hydrogenLabels === ShowHydrogenLabels.Terminal &&
      atom.a.neighbors.length < 2) ||
    (hydrogenLabels === ShowHydrogenLabels.Hetero &&
      atom.label?.text.toLowerCase() !== 'c') ||
    (hydrogenLabels === ShowHydrogenLabels.TerminalAndHetero &&
      (atom.a.neighbors.length < 2 || atom.label?.text.toLowerCase() !== 'c'))
  );
}

function shouldHydrogenBeOnLeft(struct, atom) {
  if (atom.a.neighbors.length === 0) {
    if (atom.a.label === 'D' || atom.a.label === 'T') {
      return false;
    } else {
      const element = Elements.get(atom.a.label);
      return !element || Boolean(element.leftH);
    }
  }

  if (atom.a.neighbors.length === 1) {
    const neighbor = atom.a.neighbors[0];
    const neighborDirection = struct.halfBonds.get(neighbor).dir;

    return neighborDirection.x > 0;
  }

  return false;
}

function getOnlyQueryAttributesCustomQuery(atom: Atom) {
  const queryText =
    atom.queryProperties.customQuery ||
    getAtomCustomQuery(
      {
        ...atom,
        ...atom.queryProperties,
      },
      true,
    );
  return queryText;
}

function addTooltip(node, text: string) {
  const tooltip = text.split(/(?<=[;,])/).join(' ');
  node.childNodes[0].setAttribute('data-tooltip', util.escapeHtml(tooltip));
}

function buildLabel(
  atom: ReAtom,
  paper: any,
  ps: Vec2,
  options: any,
  atomId: number,
  sgroup?: SGroup,
): {
  rightMargin: number;
  leftMargin: number;
  label: ElemAttr;
} {
  const {
    atomColoring,
    font,
    fontszInPx,
    currentlySelectedMonomerAttachmentPoint,
    connectedMonomerAttachmentPoints,
    usageInMacromolecule,
  } = options;
  // eslint-disable-line max-statements
  const label: any = {
    text: getLabelText(atom.a, atomId, sgroup),
  };
  let tooltip: string | null = null;
  if (!label.text) {
    label.text = 'R#';
  }

  if (label.text === atom.a.label) {
    const element = Elements.get(label.text);
    if (atomColoring && element) {
      atom.color = ElementColor[label.text] || '#000';
    }
  }

  const shouldStyleLabel = usageInMacromolecule !== undefined;
  const isMonomerAttachmentPoint = attachmentPointNames.includes(label.text);
  const isMonomerAttachmentPointSelected =
    currentlySelectedMonomerAttachmentPoint === label.text;
  const isMonomerAttachmentPointUsed =
    connectedMonomerAttachmentPoints?.includes(label.text);

  const { color, fill, stroke } = util.useLabelStyles(
    isMonomerAttachmentPointSelected,
    isMonomerAttachmentPointUsed,
    usageInMacromolecule,
  );

  if (isMonomerAttachmentPoint && shouldStyleLabel) {
    atom.color = color;
  }

  if (label.text?.length > MAX_LABEL_LENGTH) {
    tooltip = label.text;
    label.text = `${label.text?.substring(0, 8)}...`;
  }

  const { previewOpacity } = options;

  // not properly centered otherwise
  if (label.text === '*') {
    ps.x = ps.x - 1;
    ps.y = ps.y + 3;
  }

  label.path = paper.text(ps.x, ps.y, label.text).attr({
    font,
    'font-size': fontszInPx,
    fill: atom.color,
    'font-style': atom.a.pseudo ? 'italic' : '',
    'fill-opacity': atom.a.isPreview ? previewOpacity : 1,
  });

  if (isMonomerAttachmentPoint && shouldStyleLabel) {
    const backgroundSize = fontszInPx * 2;

    label.background = paper
      .rect(
        ps.x - backgroundSize / 2,
        ps.y - backgroundSize / 2,
        backgroundSize,
        backgroundSize,
        10,
      )
      .attr({ fill })
      .attr({ stroke });
  }
  if (tooltip) {
    addTooltip(label.path.node, tooltip);
  }

  label.rbb = util.relBox(label.path.getBBox());
  draw.recenterText(label.path, label.rbb);
  let rightMargin =
    (label.rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom); //
  let leftMargin =
    (-label.rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom);

  if (atom.a.atomList !== null) {
    const xShift =
      ((atom.hydrogenOnTheLeft ? -1 : 1) *
        (label.rbb.width - label.rbb.height)) /
      2;
    pathAndRBoxTranslate(
      label.path,
      label.rbb,
      xShift,

      0,
    );
    rightMargin += xShift;
    leftMargin += xShift;
  }

  atom.label = label;
  return { label, rightMargin, leftMargin };
}

function getLabelText(atom, atomId: number, sgroup?: SGroup) {
  if (sgroup?.isSuperatomWithoutLabel) {
    const attachmentPoint = sgroup
      .getAttachmentPoints()
      .find((attachmentPoint) => {
        return attachmentPoint.leaveAtomId === atomId;
      });

    if (attachmentPoint && attachmentPoint.attachmentPointNumber) {
      return getAttachmentPointLabel(attachmentPoint.attachmentPointNumber);
    }
  }

  if (atom.atomList !== null) return atom.atomList.label();

  if (atom.pseudo) return atom.pseudo;

  if (atom.alias) return atom.alias;

  if (atom.label === 'R#' && atom.rglabel !== null) {
    let text = '';

    for (let rgi = 0; rgi < 32; rgi++) {
      if (atom.rglabel & (1 << rgi)) {
        // eslint-disable-line max-depth
        text += 'R' + (rgi + 1).toString();
      }
    }

    if (
      sgroup instanceof MonomerMicromolecule &&
      Atom.isSuperatomLeavingGroupAtom(sgroup, atomId)
    ) {
      text = sgroup?.monomer?.monomerItem?.props?.MonomerCaps?.[text] || text;
    }

    return text;
  }

  return atom.label;
}

function showHydroIndex(atom, render, implh, rightMargin): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const hydroIndex: any = {};
  hydroIndex.text = (implh + 1).toString();
  hydroIndex.path = render.paper.text(ps.x, ps.y, hydroIndex.text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
  draw.recenterText(hydroIndex.path, hydroIndex.rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    hydroIndex.path,
    hydroIndex.rbb,
    rightMargin + 0.5 * hydroIndex.rbb.width + delta,
    0.2 * atom.label.rbb.height,
  );
  /* eslint-enable no-mixed-operators */
  return hydroIndex;
}

function showRadical(atom: ReAtom, render: Render): Omit<ElemAttr, 'text'> {
  const ps: Vec2 = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const paper: any = render.paper;
  const radical: any = {};
  let hshift;
  switch (atom.a.radical) {
    case 1:
      radical.path = paper.set();
      hshift = 1.6 * options.lineWidth;
      radical.path.push(
        draw.radicalBullet(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalBullet(paper, ps.add(new Vec2(hshift, 0)), options),
      );
      radical.path.attr('fill', atom.color);
      break;
    case 2:
      radical.path = paper.set();
      radical.path.push(draw.radicalBullet(paper, ps, options));
      radical.path.attr('fill', atom.color);
      break;
    case 3:
      radical.path = paper.set();
      hshift = 1.6 * options.lineWidth;
      radical.path.push(
        draw.radicalCap(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalCap(paper, ps.add(new Vec2(hshift, 0)), options),
      );
      radical.path.attr('stroke', atom.color);
      break;
    default:
      break;
  }
  radical.rbb = util.relBox(radical.path.getBBox());
  let vshift = -0.5 * (atom.label!.rbb.height + radical.rbb.height);
  if (atom.a.radical === 3) vshift -= options.lineWidth / 2;
  pathAndRBoxTranslate(radical.path, radical.rbb, 0, vshift);
  return radical;
}

function showIsotope(
  atom: ReAtom,
  render: Render,
  leftMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const isotope: any = {};
  isotope.text = atom.a.isotope === null ? '' : atom.a.isotope.toString();
  isotope.path = render.paper.text(ps.x, ps.y, isotope.text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  isotope.rbb = util.relBox(isotope.path.getBBox());
  draw.recenterText(isotope.path, isotope.rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    isotope.path,
    isotope.rbb,
    leftMargin - 0.5 * isotope.rbb.width - delta,
    -0.3 * atom.label!.rbb.height,
  );
  /* eslint-enable no-mixed-operators */
  return isotope;
}

function showCharge(
  atom: ReAtom,
  render: Render,
  rightMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const charge: any = {};
  charge.text = '';
  if (atom.a.charge !== null) {
    const absCharge = Math.abs(atom.a.charge);
    if (absCharge !== 1) charge.text = absCharge.toString();
    if (atom.a.charge < 0) charge.text += '\u2013';
    else charge.text += '+';
  } else {
    charge.text = '';
  }

  charge.path = render.paper.text(ps.x, ps.y, charge.text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  charge.rbb = util.relBox(charge.path.getBBox());
  draw.recenterText(charge.path, charge.rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    charge.path,
    charge.rbb,
    rightMargin + 0.5 * charge.rbb.width + delta,
    -0.3 * atom.label!.rbb.height,
  );
  /* eslint-enable no-mixed-operators */
  return charge;
}

function showExplicitValence(
  atom: ReAtom,
  render: Render,
  rightMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const valence: any = {};
  valence.text = VALENCE_MAP[atom.a.explicitValence];
  if (!valence.text) {
    throw new Error('invalid valence ' + atom.a.explicitValence.toString());
  }
  valence.text = '(' + valence.text + ')';
  valence.path = render.paper.text(ps.x, ps.y, valence.text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  valence.rbb = util.relBox(valence.path.getBBox());
  draw.recenterText(valence.path, valence.rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    valence.path,
    valence.rbb,
    rightMargin + 0.5 * valence.rbb.width + delta,
    -0.3 * atom.label!.rbb.height,
  );
  /* eslint-enable no-mixed-operators */
  return valence;
}

function showHydrogen(
  atom: ReAtom,
  render: Render,
  implh: number,
  data: {
    hydrogen: any;
    hydroIndex: number;
    rightMargin: number;
    leftMargin: number;
  },
): {
  hydrogen: ElemAttr;
  hydroIndex: ElemAttr;
  rightMargin: number;
  leftMargin: number;
} {
  // eslint-disable-line max-statements
  let hydroIndex: any = data.hydroIndex;
  const hydrogenLeft = atom.hydrogenOnTheLeft;
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const hydrogen = data.hydrogen;
  hydrogen.text = 'H';
  hydrogen.path = render.paper.text(ps.x, ps.y, hydrogen.text).attr({
    font: options.font,
    'font-size': options.fontszInPx,
    fill: atom.color,
  });
  hydrogen.rbb = util.relBox(hydrogen.path.getBBox());
  draw.recenterText(hydrogen.path, hydrogen.rbb);
  if (!hydrogenLeft) {
    pathAndRBoxTranslate(
      hydrogen.path,
      hydrogen.rbb,
      data.rightMargin + 0.35 * hydrogen.rbb.width + delta,
      0,
    );
    data.rightMargin += hydrogen.rbb.width + delta;
  }
  if (implh > 1) {
    hydroIndex = {};
    hydroIndex.text = implh.toString();
    hydroIndex.path = render.paper.text(ps.x, ps.y, hydroIndex.text).attr({
      font: options.font,
      'font-size': options.fontszsubInPx,
      fill: atom.color,
    });
    hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
    draw.recenterText(hydroIndex.path, hydroIndex.rbb);
    if (!hydrogenLeft) {
      pathAndRBoxTranslate(
        hydroIndex.path,
        hydroIndex.rbb,
        data.rightMargin +
          0.15 * hydroIndex.rbb.width * (options.zoom > 1 ? 1 : options.zoom) +
          delta,
        0.2 * atom.label!.rbb.height,
      );
      data.rightMargin += hydroIndex.rbb.width + delta;
    }
  }
  if (hydrogenLeft) {
    if (hydroIndex != null) {
      pathAndRBoxTranslate(
        hydroIndex.path,
        hydroIndex.rbb,
        data.leftMargin - 0.4 * hydroIndex.rbb.width - delta,
        0.2 * atom.label!.rbb.height,
      );
      data.leftMargin -= hydroIndex.rbb.width + delta;
    }
    pathAndRBoxTranslate(
      hydrogen.path,
      hydrogen.rbb,
      data.leftMargin -
        0.4 *
          hydrogen.rbb.width *
          (implh > 1 && options.zoom < 1 ? options.zoom : 1) -
        delta,
      0,
    );
    data.leftMargin -= hydrogen.rbb.width + delta;
  }
  return Object.assign(data, { hydrogen, hydroIndex });
}

function showWarning(
  atom,
  render,
  leftMargin,
  rightMargin,
): { rbb: DOMRect; path: any } {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const delta = 0.5 * render.options.lineWidth;
  const warning: any = {};
  const y = ps.y + atom.label.rbb.height / 2 + delta;
  warning.path = render.paper
    .path(
      'M{0},{1}L{2},{3}',
      tfx(ps.x + leftMargin),
      tfx(y),
      tfx(ps.x + rightMargin),
      tfx(y),
    )
    .attr(render.options.lineattr)
    .attr({ stroke: '#F00' });
  warning.rbb = util.relBox(warning.path.getBBox());
  return warning;
}

function getAamText(atom) {
  let aamText = '';
  if (atom.a.aam > 0) aamText += atom.a.aam;
  if (atom.a.invRet > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.invRet === 1) aamText += 'Inv';
    else if (atom.a.invRet === 2) aamText += 'Ret';
    else throw new Error('Invalid value for the invert/retain flag');
  }
  if (atom.a.exactChangeFlag > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.exactChangeFlag === 1) aamText += 'ext';
    else throw new Error('Invalid value for the exact change flag');
  }
  return aamText;
}

function getRingBondCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 'rb' + value.toString();
  } else if (value === -1) {
    attrText = 'rb0';
  } else if (value === -2) {
    attrText = 'rb*';
  } else {
    throw new Error('Ring bond count invalid');
  }
  return attrText;
}

function getRingConnectivity(value: number) {
  if (value > 0) {
    return 'x' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'x0';
  } else {
    return '';
  }
}

function getDegree(value: number) {
  if (value > 0) {
    return 'D' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'D0';
  } else {
    return '';
  }
}

function getSubstitutionCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 's' + value.toString();
  } else if (value === -1) {
    attrText = 's0';
  } else if (value === -2) {
    attrText = 's*';
  } else {
    throw new Error('Substitution count invalid');
  }
  return attrText;
}

export function getAtomType(atom: Atom) {
  return atom.atomList
    ? 'list'
    : atom.pseudo === atom.label
    ? 'pseudo'
    : 'single';
}

export function checkIsSmartPropertiesExist(atom) {
  const smartsSpecificProperties = [
    'ringMembership',
    'ringSize',
    'connectivity',
    'chirality',
    'aromaticity',
    'customQuery',
  ];
  return smartsSpecificProperties.some((name) => atom.queryProperties?.[name]);
}

export function getAtomCustomQuery(atom, includeOnlyQueryAttributes?: boolean) {
  let queryAttrsText = '';
  const nonQueryAttributes = ['charge', 'explicitValence', 'isotope'];

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };
  const patterns: {
    [key: string]: (value: string, atom) => string;
  } = {
    isotope: (value) => value,
    aromaticity: (value) => (value === 'aromatic' ? 'a' : 'A'),
    charge: (value) => {
      if (value === '') return value;
      const regExpResult = /^([+-]?)([0-9]{1,3}|1000)([+-]?)$/.exec(value);
      const charge = regExpResult
        ? parseInt(
            regExpResult[1] + regExpResult[3] + regExpResult[2],
          ).toString()
        : value;
      return charge[0] !== '-' ? `+${charge}` : charge;
    },
    unsaturatedAtom: (value) => (Number(value) === 1 ? 'u' : ''),
    explicitValence: (value) => (Number(value) !== -1 ? `v${value}` : ''),
    ringBondCount: (value) => getRingConnectivity(Number(value)),
    substitutionCount: (value) => getDegree(Number(value)),
    hCount: (value) =>
      Number(value) > 0 ? 'H' + (Number(value) - 1).toString() : '',
    implicitHCount: (value) => `h${value}`,
    ringMembership: (value) => `R${value}`,
    ringSize: (value) => `r${value}`,
    connectivity: (value) => `X${value}`,
    chirality: (value) => (value === 'clockwise' ? '@@' : '@'),
  };

  for (const propertyName in patterns) {
    if (
      includeOnlyQueryAttributes &&
      nonQueryAttributes.includes(propertyName)
    ) {
      continue;
    }

    const value = atom[propertyName];
    if (propertyName in atom && value !== null) {
      const attrText = patterns[propertyName](value, atom);
      if (attrText) {
        addSemicolon();
      }
      queryAttrsText += attrText;
    }
  }

  return queryAttrsText;
}

function getQueryAttrsText(atom): string {
  let queryAttrsText = '';

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };

  const { ringBondCount, substitutionCount, unsaturatedAtom, hCount } = atom.a;

  if (ringBondCount !== 0) {
    queryAttrsText += getRingBondCountAttrText(ringBondCount);
  }
  if (substitutionCount !== 0) {
    addSemicolon();
    queryAttrsText += getSubstitutionCountAttrText(substitutionCount);
  }
  if (unsaturatedAtom > 0) {
    addSemicolon();
    if (unsaturatedAtom === 1) queryAttrsText += 'u';
    else throw new Error('Unsaturated atom invalid value');
  }
  if (hCount > 0) {
    addSemicolon();
    queryAttrsText += 'H' + (hCount - 1).toString();
  }
  return queryAttrsText;
}

function pathAndRBoxTranslate(path, rbb, x, y) {
  path.translateAbs(x, y);
  rbb.x += x;
  rbb.y += y;
}

function newVectorFromAngle(angle: number): Vec2 {
  return new Vec2(Math.cos(angle), Math.sin(angle));
}

export default ReAtom;
