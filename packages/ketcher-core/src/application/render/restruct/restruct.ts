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
  Pile,
  Pool,
  RGroupAttachmentPoint,
  SGroup,
  Struct,
  Vec2,
} from 'domain/entities';
import assert from 'assert';
import { LayerMap } from './generalEnumTypes';
import ReAtom from './reatom';
import ReBond from './rebond';
import ReDataSGroupData from './redatasgroupdata';
import ReEnhancedFlag from './reenhancedFlag';
import ReFrag from './refrag';
import ReLoop from './reloop';
import ReRGroup from './rergroup';
import ReRxnArrow from './rerxnarrow';
import ReRxnPlus from './rerxnplus';
import ReSGroup from './resgroup';
import ReSimpleObject from './resimpleObject';
import ReText from './retext';
import { Render } from '../raphaelRender';
import Visel from './visel';
import util from '../util';
import { ReRGroupAttachmentPoint } from './rergroupAttachmentPoint';
import { ReImage } from 'application/render/restruct/reImage';
import { IMAGE_KEY, MULTITAIL_ARROW_KEY } from 'domain/constants';
import { ReMultitailArrow } from './remultitailArrow';

class ReStruct {
  public static readonly maps = {
    atoms: ReAtom,
    bonds: ReBond,
    rxnPluses: ReRxnPlus,
    rxnArrows: ReRxnArrow,
    frags: ReFrag,
    rgroups: ReRGroup,
    rgroupAttachmentPoints: ReRGroupAttachmentPoint,
    sgroupData: ReDataSGroupData,
    enhancedFlags: ReEnhancedFlag,
    sgroups: ReSGroup,
    reloops: ReLoop,
    simpleObjects: ReSimpleObject,
    texts: ReText,
    [IMAGE_KEY]: ReImage,
    [MULTITAIL_ARROW_KEY]: ReMultitailArrow,
  } as const;

  public render: Render;
  public molecule: Struct;
  public atoms: Map<number, ReAtom> = new Map();
  public visibleAtoms: Map<number, ReAtom> = new Map();
  public visibleBonds: Map<number, ReBond> = new Map();
  public bonds: Map<number, ReBond> = new Map();
  public reloops: Map<number, ReLoop> = new Map();
  public rxnPluses: Map<number, ReRxnPlus> = new Map();
  public rxnArrows: Map<number, ReRxnArrow> = new Map();
  public frags: Pool = new Pool();
  public rgroups: Pool = new Pool();
  public rgroupAttachmentPoints: Pool<ReRGroupAttachmentPoint> = new Pool();

  public sgroups: Map<number, ReSGroup> = new Map();
  public sgroupData: Map<number, ReDataSGroupData> = new Map();
  public enhancedFlags: Map<number, ReEnhancedFlag> = new Map();
  public simpleObjects: Map<number, ReSimpleObject> = new Map();
  public texts: Map<number, ReText> = new Map();
  public images = new Map<number, ReImage>();
  public multitailArrows = new Map<number, ReMultitailArrow>();

  private initialized = false;
  private layers: Record<LayerMap, any> = {} as Record<LayerMap, unknown>;
  public connectedComponents: Pool = new Pool();
  private ccFragmentType: Pool = new Pool();
  private structChanged = false;
  public needRecalculateVisibleAtomsAndBonds = false;

  // TWIMC, Those maps are accessed via dynamic names, using static maps field + 'Changed' string
  private atomsChanged: Map<number, 1> = new Map();
  private simpleObjectsChanged: Map<number, ReSimpleObject> = new Map();
  private rxnArrowsChanged: Map<number, ReRxnArrow> = new Map();
  private rxnPlusesChanged: Map<number, ReRxnPlus> = new Map();
  private enhancedFlagsChanged: Map<number, ReEnhancedFlag> = new Map();
  private bondsChanged: Map<number, ReEnhancedFlag> = new Map();
  private textsChanged: Map<number, ReText> = new Map();
  private imagesChanged = new Map<number, ReImage>();
  private multitailArrowsChanged = new Map<number, ReMultitailArrow>();
  private snappingBonds: number[] = [];

  constructor(
    molecule,
    render: Render | { skipRaphaelInitialization: boolean; theme },
  ) {
    // eslint-disable-line max-statements
    this.render = render as Render;
    this.molecule = molecule || new Struct();
    this.initLayers();
    this.clearMarks();
    // TODO: eachItem ?

    molecule.atoms.forEach((atom, aid) => {
      this.atoms.set(aid, new ReAtom(atom));
    });

    molecule.bonds.forEach((bond, bid) => {
      this.bonds.set(bid, new ReBond(bond));
    });

    molecule.loops.forEach((loop, lid) => {
      this.reloops.set(lid, new ReLoop(loop));
    });

    molecule.rxnPluses.forEach((item, id) => {
      this.rxnPluses.set(id, new ReRxnPlus(item));
    });

    molecule.rxnArrows.forEach((item, id) => {
      this.rxnArrows.set(id, new ReRxnArrow(item));
    });

    molecule.simpleObjects.forEach((item, id) => {
      this.simpleObjects.set(id, new ReSimpleObject(item));
    });

    molecule.texts.forEach((item, id) => {
      this.texts.set(id, new ReText(item));
    });

    molecule.frags.forEach((item, id) => {
      this.frags.set(id, new ReFrag(item));
      if (item) this.enhancedFlags.set(id, new ReEnhancedFlag());
    });

    molecule.rgroups.forEach((item, id) => {
      this.rgroups.set(id, new ReRGroup(item));
    });

    molecule.rgroupAttachmentPoints.forEach(
      (item: RGroupAttachmentPoint, id: number) => {
        const reAtom = this.atoms.get(item.atomId);
        assert(reAtom != null);
        this.rgroupAttachmentPoints.set(
          id,
          new ReRGroupAttachmentPoint(item, reAtom),
        );
      },
    );

    molecule.sgroups.forEach((item, id) => {
      this.sgroups.set(id, new ReSGroup(item));
      if (item.type === 'DAT' && !item.data.attached) {
        this.sgroupData.set(id, new ReDataSGroupData(item));
      }
    });
    molecule.images.forEach((item, id) => {
      this.images.set(id, new ReImage(item));
    });
    molecule.multitailArrows.forEach((item, id) => {
      this.multitailArrows.set(id, new ReMultitailArrow(item));
    });
  }

  get visibleRGroupAttachmentPoints() {
    const sgroups = this.molecule.sgroups;
    const functionalGroups = this.molecule.functionalGroups;
    return this.rgroupAttachmentPoints.filter((_id, reItem) => {
      const atomId = reItem.item.atomId;
      const atom = this.molecule.atoms.get(atomId);
      assert(atom != null);
      return !FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
      );
    });
  }

  connectedComponentRemoveAtom(aid: number, reAtom?: ReAtom): void {
    const atom = reAtom || this.atoms.get(aid);
    if (!atom || atom.component < 0) return;
    const cc = this.connectedComponents.get(atom.component);

    cc.delete(aid);
    if (cc.size < 1) this.connectedComponents.delete(atom.component);

    atom.component = -1;
  }

  clearConnectedComponents(): void {
    this.connectedComponents.clear();
    this.atoms.forEach((atom) => {
      atom.component = -1;
    });
  }

  getConnectedComponent(
    aid: Array<number> | number,
    adjacentComponents: Pile,
  ): Pile {
    const list = Array.isArray(aid) ? Array.from(aid) : [aid];
    const ids = new Pile();

    while (list.length > 0) {
      const aid = list.pop()!;
      ids.add(aid);
      const atom = this.atoms.get(aid);
      if (!atom) continue;
      if (atom.component >= 0) adjacentComponents.add(atom.component);

      atom.a.neighbors.forEach((neighbor) => {
        const halfBond = this.molecule.halfBonds.get(neighbor);
        if (!halfBond) return;
        const neiId = halfBond.end;
        if (!ids.has(neiId)) list.push(neiId);
      });
    }

    return ids;
  }

  addConnectedComponent(idSet: Pile<number>): number {
    const compId = this.connectedComponents.add(idSet);
    const adjacentComponents = new Pile();
    const aidSet = this.getConnectedComponent(
      Array.from(idSet),
      adjacentComponents,
    );

    adjacentComponents.delete(compId);

    let type = -1;
    aidSet.forEach((aid) => {
      const atom = this.atoms.get(aid);
      if (!atom) return;
      atom.component = compId;
      if (atom.a.rxnFragmentType !== -1) type = atom.a.rxnFragmentType;
    });

    this.ccFragmentType.set(compId, type);
    return compId;
  }

  removeConnectedComponent(ccid: number): boolean {
    this.connectedComponents.get(ccid).forEach((aid) => {
      const atom = this.atoms.get(aid);
      if (atom) atom.component = -1;
    });

    return this.connectedComponents.delete(ccid);
  }

  assignConnectedComponents(): void {
    this.atoms.forEach((atom, aid) => {
      if (atom.component >= 0) return;

      const adjacentComponents = new Pile();
      const idSet = this.getConnectedComponent(aid, adjacentComponents);
      adjacentComponents.forEach((ccid) => {
        this.removeConnectedComponent(ccid);
      });

      this.addConnectedComponent(idSet);
    });
  }

  initLayers(): void {
    for (const group in LayerMap) {
      this.layers[LayerMap[group]] = this.render.paper
        .rect(0, 0, 10, 10)
        .attr({
          class: group + 'Layer',
          fill: '#000',
          opacity: '0.0',
        })
        .toFront();
    }
  }

  addReObjectPath(
    group: LayerMap,
    visel: Visel,
    path,
    pos: Vec2 | null = null,
    visible = false,
  ): void {
    // eslint-disable-line max-params
    if (!path || !this.layers[group].node.parentNode) return;
    const paths = Array.isArray(path) ? path : [path];

    paths.forEach((path) => {
      const offset = this.render.options.offset;
      let bb = visible ? Box2Abs.fromRelBox(util.relBox(path.getBBox())) : null;
      const ext = pos && bb ? bb.translate(pos.negated()) : null;
      if (offset !== null) {
        path.translateAbs(offset.x, offset.y);
        bb = bb ? bb.translate(offset) : null;
      }
      visel.add(path, bb, ext);
      path.insertBefore(this.layers[LayerMap[group]]);
    });
  }

  clearMarks(): void {
    Object.keys(ReStruct.maps).forEach((map) => {
      this[map + 'Changed'] = new Map();
    });

    this.structChanged = false;
  }

  markItemRemoved(): void {
    this.structChanged = true;
  }

  markBond(bid: number, mark: number): void {
    this.markItem('bonds', bid, mark);
  }

  markAtom(aid: number, mark: number): void {
    this.markItem('atoms', aid, mark);
  }

  markRgroupAttachmentPoint(rgAPid: number, mark: number): void {
    this.markItem('rgroupAttachmentPoints', rgAPid, mark);
  }

  markItem(map: string, id: number, mark: number): void {
    const mapChanged = this[map + 'Changed'];

    const value = mapChanged.has(id)
      ? Math.max(mark, mapChanged.get(id))
      : mark;

    mapChanged.set(id, value);

    if (this[map].has(id)) this.clearVisel(this[map].get(id).visel);
  }

  clearVisel(visel: Visel): void {
    visel.paths.forEach((path) => {
      path.remove();
    });
    visel.clear();
  }

  eachItem(func) {
    Object.keys(ReStruct.maps).forEach((map) => {
      this[map].forEach(func);
    });
  }

  /**
   * Why?
   * we can't use just getVBoxObj and the center for atoms
   * because this will lead incorrect center position for the move atom around it
   * because of atom's vBox contain text label with is not constant after flip/rotate
   * and this lead to unstable flip tool work
   */
  // eslint-disable-next-line no-use-before-define
  getSelectionBoxCenter(selection: SelectionMap): Vec2 | undefined {
    let boundingBox: Box2Abs | null = null;

    for (const atomId of selection.atoms ?? []) {
      const atomPositionPoint = this.atoms.get(atomId)!.a.pp;
      const atomBox = new Box2Abs(atomPositionPoint, atomPositionPoint);
      boundingBox =
        boundingBox == null ? atomBox : Box2Abs.union(boundingBox, atomBox);
    }
    const selectionExceptAtoms = { ...selection };
    delete selectionExceptAtoms.atoms;

    const selectionExceptAtomsBoundingBox =
      this.getBoundingBoxForSelection(selectionExceptAtoms);
    if (selectionExceptAtomsBoundingBox) {
      boundingBox = boundingBox
        ? Box2Abs.union(boundingBox, selectionExceptAtomsBoundingBox)
        : selectionExceptAtomsBoundingBox;
    }

    return boundingBox?.centre();
  }

  // eslint-disable-next-line no-use-before-define
  getVBoxObj(selection?: SelectionMap): Box2Abs {
    if (isSelectionEmpty(selection)) {
      selection = this.getAllElementsAsSelectionMap();
    }

    let boundingBox = this.getBoundingBoxForSelection(selection);

    boundingBox = boundingBox || new Box2Abs(0, 0, 0, 0);
    return boundingBox;
  }

  // eslint-disable-next-line no-use-before-define
  private getAllElementsAsSelectionMap(): SelectionMap {
    // eslint-disable-next-line no-use-before-define
    const selection: SelectionMap = {};
    Object.keys(ReStruct.maps).forEach((map) => {
      selection[map] = Array.from(this[map].keys());
    });
    return selection;
  }

  // eslint-disable-next-line no-use-before-define
  private getBoundingBoxForSelection(selection: SelectionMap): Box2Abs | null {
    let boundingBox: Box2Abs | null = null;
    Object.keys(ReStruct.maps).forEach((elementKey) => {
      selection[elementKey]?.forEach((elementId) => {
        const element = this[elementKey].get(elementId);
        if (element) {
          const box = element.getVBoxObj(this.render);
          if (box) {
            boundingBox = boundingBox
              ? Box2Abs.union(boundingBox, box)
              : box.clone();
          }
        }
      });
    });
    return boundingBox;
  }

  translate(d): void {
    this.eachItem((item) => item.visel.translate(d));
  }

  scale(s: number): void {
    // NOTE: bounding boxes are not valid after scaling
    this.eachItem((item) => scaleVisel(item.visel, s));
  }

  /** Visel is a shorthand for VISual ELement */
  clearVisels(): void {
    this.eachItem((item) => this.clearVisel(item.visel));
  }

  recalculateVisibleAtomsAndBonds() {
    this.visibleAtoms = new Map();
    this.visibleBonds = new Map();

    this.atoms.forEach((atom, aid) => {
      if (
        (!FunctionalGroup.isAtomInContractedFunctionalGroup(
          atom.a,
          this.molecule.sgroups,
          this.molecule.functionalGroups,
        ) ||
          this.molecule
            .getGroupFromAtomId(aid)
            ?.getContractedPosition(this.molecule).atomId === aid) &&
        !Atom.isHiddenLeavingGroupAtom(this.molecule, aid)
      ) {
        this.visibleAtoms.set(aid, atom);
      }
    });

    this.bonds.forEach((bond, bid) => {
      if (
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          bond.b,
          this.molecule.sgroups,
          this.molecule.functionalGroups,
        ) &&
        !SGroup.isBondInContractedSGroup(bond.b, this.molecule.sgroups) &&
        !Bond.isBondToHiddenLeavingGroup(this.molecule, bond.b)
      ) {
        this.visibleBonds.set(bid, bond);
      }
    });
  }

  update(force: boolean): boolean {
    // eslint-disable-line max-statements
    force = force || !this.initialized;

    if (force || this.needRecalculateVisibleAtomsAndBonds) {
      this.recalculateVisibleAtomsAndBonds();
      this.needRecalculateVisibleAtomsAndBonds = false;
    }

    // check items to update
    Object.keys(ReStruct.maps).forEach((map) => {
      const mapChanged = this[map + 'Changed'];
      if (force) {
        this[map].forEach((_item, id) => mapChanged.set(id, 1));
      } else {
        // check if some of the items marked are already gone
        mapChanged.forEach((_value, id) => {
          if (!this[map].has(id)) mapChanged.delete(id);
        });
      }
    });

    this.atomsChanged.forEach((_value, aid) =>
      this.connectedComponentRemoveAtom(aid),
    );

    // clean up empty fragments
    // TODO: fragment removal should be triggered by the action responsible for the fragment contents removal and form an operation of its own
    const emptyFrags = this.frags.filter(
      (fid, frag) => !frag.calcBBox(this.render.ctab, fid, this.render),
    );

    emptyFrags.forEach((frag, fid) => {
      this.clearVisel(frag.visel);
      this.frags.delete(fid);
      this.molecule.frags.delete(fid);
    });

    Object.keys(ReStruct.maps).forEach((map) => {
      const mapChanged = this[map + 'Changed'];

      mapChanged.forEach((_value, id) => {
        if (this[map].get(id).visel) {
          this.clearVisel(this[map].get(id).visel);
        }
        this.structChanged = this.structChanged || mapChanged.get(id) > 0;
      });
    });
    // TODO: when to update sgroup?
    this.sgroups.forEach((sgroup) => {
      this.clearVisel(sgroup.visel);
      sgroup.hovering = null;
      sgroup.selectionPlate = null;
    });

    // TODO [RB] need to implement update-on-demand for fragments and r-groups
    this.frags.forEach((frag) => {
      this.clearVisel(frag.visel);
    });

    this.rgroups.forEach((rgroup) => {
      this.clearVisel(rgroup.visel);
    });

    if (force) {
      // clear and recreate all half-bonds
      this.clearConnectedComponents();
      this.molecule.initHalfBonds();
      this.molecule.initNeighbors();
    }

    // only update half-bonds adjacent to atoms that have moved
    const atomsChangedArray = Array.from(this.atomsChanged.keys());
    this.molecule.updateHalfBonds(atomsChangedArray);
    this.molecule.sortNeighbors(atomsChangedArray);

    this.assignConnectedComponents();
    this.initialized = true;

    this.verifyLoops();
    const updLoops = force || this.structChanged;
    if (updLoops) this.updateLoops();
    this.showAtoms();
    this.showBonds();
    this.showRgroupAttachmentPoints();
    if (updLoops) this.showLoops();
    this.showReactionSymbols();
    this.showSGroups();

    this.showFragments();
    this.showRGroups();
    this.showEnhancedFlags();
    this.showSimpleObjects();
    this.showTexts();
    this.showImages();
    this.showMultitailArrows();
    this.clearMarks();

    return true;
  }

  updateLoops(): void {
    this.reloops.forEach((reloop) => {
      this.clearVisel(reloop.visel);
    });
    const ret = this.molecule.findLoops();
    ret.bondsToMark.forEach((bid) => {
      this.markBond(bid, 1);
    });
    ret.newLoops.forEach((loopId) => {
      this.reloops.set(loopId, new ReLoop(this.molecule.loops.get(loopId)));
    });
  }

  showLoops(): void {
    const options = this.render.options;
    this.reloops.forEach((reloop, rlid) => {
      reloop.show(this, rlid, options);
    });
  }

  showSimpleObjects(): void {
    const options = this.render.options;

    this.simpleObjectsChanged.forEach((_value, id) => {
      const simpleObject = this.simpleObjects.get(id);
      if (simpleObject) simpleObject.show(this, options);
    });
  }

  showTexts() {
    const options = this.render.options;

    this.textsChanged.forEach((_value, id) => {
      const text = this.texts.get(id);
      if (text) text.show(this, id, options);
    });
  }

  showReactionSymbols(): void {
    const options = this.render.options;

    this.rxnArrowsChanged.forEach((_value, id) => {
      const arrow = this.rxnArrows.get(id);
      if (arrow) arrow.show(this, id, options);
    });

    this.rxnPlusesChanged.forEach((_value, id) => {
      const plus = this.rxnPluses.get(id);
      if (plus) plus.show(this, id, options);
    });
  }

  showSGroups(): void {
    this.molecule.sGroupForest
      .getSGroupsBFS()
      .reverse()
      .forEach((id) => {
        const resgroup = this.sgroups.get(id);
        if (!resgroup) return;
        resgroup.show(this);
      });
  }

  showFragments(): void {
    this.frags.forEach((frag, id) => {
      const path = frag.draw(this.render, id);
      if (path) {
        this.addReObjectPath(LayerMap.data, frag.visel, path, null, true);
      }
      // TODO fragment selection & highlighting
    });
  }

  showRGroups(): void {
    const options = this.render.options;
    this.rgroups.forEach((rgroup, id) => {
      rgroup.show(this, id, options);
    });
  }

  loopRemove(loopId: number): void {
    const reloop = this.reloops.get(loopId);
    if (!reloop) {
      return;
    }
    this.clearVisel(reloop.visel);

    const bondlist: Array<number> = [];

    reloop.loop.hbs.forEach((hbid) => {
      const hb = this.molecule.halfBonds.get(hbid);
      if (!hb) return;
      hb.loop = -1;
      this.markBond(hb.bid, 1);
      this.markAtom(hb.begin, 1);
      bondlist.push(hb.bid);
    });

    this.reloops.delete(loopId);
    this.molecule.loops.delete(loopId);
  }

  verifyLoops(): void {
    this.reloops.forEach((reloop, rlid) => {
      if (!reloop.isValid(this.molecule, rlid)) this.loopRemove(rlid);
    });
  }

  getRGroupAttachmentPointsVBoxByAtomIds(atomsIds: number[]): Box2Abs | null {
    let allAtomAttachmentPointsVBox: Box2Abs | null = null;

    atomsIds.forEach((atomId) => {
      const attachmentPointIds =
        this.molecule.getRGroupAttachmentPointsByAtomId(atomId);

      const oneAtomAttachmentPointsVBox = attachmentPointIds.reduce(
        (previousVBox, attachmentPointId) => {
          const attachmentPoint =
            this.rgroupAttachmentPoints.get(attachmentPointId);
          assert(attachmentPoint != null);
          const currentVBox = attachmentPoint.getVBoxObj(this.render);
          return previousVBox && currentVBox
            ? Box2Abs.union(previousVBox, currentVBox)
            : currentVBox;
        },
        null as Box2Abs | null,
      );

      if (allAtomAttachmentPointsVBox && oneAtomAttachmentPointsVBox) {
        allAtomAttachmentPointsVBox = Box2Abs.union(
          allAtomAttachmentPointsVBox,
          oneAtomAttachmentPointsVBox,
        );
      } else {
        allAtomAttachmentPointsVBox =
          allAtomAttachmentPointsVBox ?? oneAtomAttachmentPointsVBox;
      }
    });

    return allAtomAttachmentPointsVBox;
  }

  private showRgroupAttachmentPoints() {
    // why update all rgroupAttachmentPoints instead of changed ones?
    // 1. The label of an R-Group attachment point may be affected by other R-Group attachment points
    // 2. The visibility of an an R-Group attachment point may be affected by contracting/expanding an S-Group
    this.rgroupAttachmentPoints.forEach((_value, id) => {
      const rgroupAttachmentPoint = this.rgroupAttachmentPoints.get(id);
      if (rgroupAttachmentPoint?.visel) {
        this.clearVisel(rgroupAttachmentPoint.visel);
      }

      const attachedAtomId = rgroupAttachmentPoint?.item.atomId;
      const sgroup = this.molecule.getGroupFromAtomId(attachedAtomId);
      const isInsideContractedSGroup = Boolean(sgroup?.isContracted());
      if (isInsideContractedSGroup) {
        return;
      }

      rgroupAttachmentPoint?.show(this, id);
    });
  }

  private showAtoms(): void {
    // eslint-disable-line max-statements
    const options = this.render.options;
    this.atomsChanged.forEach((_value, aid) => {
      const atom = this.atoms.get(aid);
      if (atom) atom.show(this, aid, options);
    });
  }

  showEnhancedFlags(): void {
    const options = this.render.options;

    this.enhancedFlagsChanged.forEach((_value, chid) => {
      const flag = this.enhancedFlags.get(chid);
      if (flag) flag.show(this, chid, options);
    });
  }

  showBonds(): void {
    // eslint-disable-line max-statements
    const options = this.render.options;

    this.bondsChanged.forEach((_value, bid) => {
      const bond = this.bonds.get(bid);
      if (bond) {
        bond.show(this, bid, options);
      }
    });
  }

  showImages() {
    const options = this.render.options;
    this.imagesChanged.forEach((_, id) => {
      const image = this.images.get(id);
      if (image) {
        image.show(this, options);
      }
    });
  }

  showMultitailArrows() {
    this.multitailArrowsChanged.forEach((_, id) => {
      const multitailArrow = this.multitailArrows.get(id);
      if (multitailArrow) {
        multitailArrow.show(this, this.render.options);
      }
    });
  }

  setSelection(selection?) {
    const atoms: { selected: boolean; sgroup: number }[] = [];

    Object.keys(ReStruct.maps).forEach((map) => {
      const [mapValues] = this[map].values(); // hack to include ReSGroup, figure out better solution
      if (ReStruct.maps[map].isSelectable() || mapValues instanceof ReSGroup) {
        this[map].forEach((item, id) => {
          if (item instanceof ReAtom) {
            let sgroup;
            for (const sgId of item.a.sgs.values()) {
              sgroup = sgId;
            }
            atoms.push({
              selected: item.selected,
              sgroup,
            });
          }
          if (
            item instanceof ReSGroup &&
            FunctionalGroup.isContractedFunctionalGroup(
              item?.item?.id,
              this.molecule.functionalGroups,
            )
          ) {
            const sGroupAtoms = atoms.filter(
              (atom) => atom.sgroup === item?.item?.id,
            );
            item.selected =
              sGroupAtoms.length > 0 &&
              sGroupAtoms.some((atom) => atom.selected);
          }

          let selected = selection?.[map]
            ? selection[map].indexOf(id) > -1
            : item.selected;

          if (selection === null) {
            selected = false;
          }

          this.showItemSelection(item, selected);
        });
      }
    });
  }

  showItemSelection(item, selected) {
    const exists = isSelectionSvgObjectExists(item);
    // TODO: simplify me, who sets `removed`?
    item.selected = selected;
    if (item instanceof ReDataSGroupData) item.sgroup.selected = selected;
    if (selected) {
      if (!exists) {
        const render = this.render;
        const options = render.options;
        const paper = render.paper;

        item.selectionPlate = item.makeSelectionPlate(this, paper, options);
        this.addReObjectPath(
          LayerMap.selectionPlate,
          item.visel,
          item.selectionPlate,
        );

        if (typeof item.makeAdditionalInfo === 'function') {
          item.additionalInfo = item.makeAdditionalInfo(this);
          this.addReObjectPath(
            LayerMap.additionalInfo,
            item.visel,
            item.additionalInfo,
          );
        }
      }
      if (item.selectionPlate) {
        item.selectionPlate.show();
        item.additionalInfo?.show();
        item.cip?.rectangle.attr({
          fill: '#7f7',
          stroke: '#7f7',
        });
        if (item.togglePoints) item.togglePoints(true);
      }
    } else if (exists && item.selectionPlate) {
      item.selectionPlate.hide();
      if (item.togglePoints) item.togglePoints(false);
      item.additionalInfo?.hide();
      item.cip?.rectangle.attr({
        fill: 'none',
        stroke: 'none',
      });
    }
  }

  addSnappingBonds(bondId: number) {
    this.snappingBonds.push(bondId);
  }

  clearSnappingBonds() {
    this.snappingBonds = [];
  }

  isSnappingBond(bondId: number) {
    return this.snappingBonds.includes(bondId);
  }
}

// eslint-disable-next-line no-use-before-define
function isSelectionEmpty(selection?: SelectionMap): selection is undefined {
  if (!selection) return true;

  const anySelection = Object.keys(ReStruct.maps).some(
    (map) => selection[map] && selection[map].length > 0,
  );

  return !anySelection;
}

function scaleRPath(path, scaleFactor: number): void {
  if (path.type === 'set') {
    // TODO: rework scaling
    for (let i = 0; i < path.length; ++i) scaleRPath(path[i], scaleFactor);
  } else {
    if (!(typeof path.attrs === 'undefined')) {
      if ('font-size' in path.attrs) {
        path.attr('font-size', path.attrs['font-size'] * scaleFactor);
      } else if ('stroke-width' in path.attrs) {
        path.attr('stroke-width', path.attrs['stroke-width'] * scaleFactor);
      }
    }
    path.scale(scaleFactor, scaleFactor, 0, 0);
  }
}

function scaleVisel(visel, s) {
  for (let i = 0; i < visel.paths.length; ++i) scaleRPath(visel.paths[i], s);
}

/**
 * SelectionPlate could be an item then value would be in it
 * or it could be a set of items then removed value need to be check on at least one of items in set
 * @param item
 * @returns {boolean}
 */
function isSelectionSvgObjectExists(item) {
  return (
    item &&
    item.selectionPlate !== null &&
    ((!item.selectionPlate?.items && !item.selectionPlate?.removed) ||
      (Array.isArray(item.selectionPlate?.items) &&
        !item.selectionPlate[0]?.removed))
  );
}

type SelectionMap = Partial<
  Record<keyof typeof ReStruct.maps, number[] | undefined>
>;

export default ReStruct;
