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
  Action,
  Editor as KetcherEditor,
  FloatingToolsParams,
  fromDescriptorsAlign,
  fromMultipleMove,
  fromNewCanvas,
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
  Pile,
  provideEditorSettings,
  Render,
  ReStruct,
  Scale,
  Struct,
  Vec2,
  ketcherProvider,
  KetcherLogger,
  fromPaste,
  Coordinates,
  Atom,
  Pool,
} from 'ketcher-core';
import {
  DOMSubscription,
  PipelineSubscription,
  Subscription,
} from 'subscription';

import closest from './shared/closest';
import { customOnChangeHandler } from './utils';
import { isEqual } from 'lodash/fp';
import { toolsMap } from './tool';
import { Highlighter } from './highlighter';
import { setFunctionalGroupsTooltip } from './utils/functionalGroupsTooltip';
import { ContextMenuInfo } from '../ui/views/components/ContextMenu/contextMenu.types';
import { HoverIcon } from './HoverIcon';
import RotateController from './tool/rotate-controller';
import {
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from './tool/Tool';
import { getSelectionMap, getStructCenter } from './utils/structLayout';

const SCALE = provideEditorSettings().microModeScale;
const HISTORY_SIZE = 32; // put me to options

const structObjects: Array<keyof typeof ReStruct.maps> = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  'rgroupAttachmentPoints',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'functionalGroups',
  'frags',
  'merge',
  'rgroups',
  'rgroupAttachmentPoints',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

function selectStereoFlagsIfNecessary(
  atoms: Pool<Atom>,
  explicitlySelectedAtoms: number[],
): number[] {
  const fragmentToAtoms: Map<number, number[]> = new Map();
  atoms.forEach((atom, atomId) => {
    const atomFragment = atom.fragment;
    if (atomFragment === -1) {
      return;
    }

    const currentAtoms = fragmentToAtoms.get(atomFragment) ?? [];
    const updatedAtoms = currentAtoms.concat(atomId);
    fragmentToAtoms.set(atomFragment, updatedAtoms);
  });

  let stereoFlags: number[] = [];
  fragmentToAtoms.forEach((fragmentAtoms, fragmentId) => {
    const shouldSelectStereoFlag = fragmentAtoms.every((atomId) =>
      explicitlySelectedAtoms.includes(atomId),
    );

    if (shouldSelectStereoFlag) {
      stereoFlags = stereoFlags.concat(fragmentId);
    }
  });

  return stereoFlags;
}

export interface Selection {
  atoms?: Array<number>;
  bonds?: Array<number>;
  enhancedFlags?: Array<number>;
  rxnPluses?: Array<number>;
  rxnArrows?: Array<number>;
  texts?: Array<number>;
  rgroupAttachmentPoints?: Array<number>;
  [MULTITAIL_ARROW_KEY]?: Array<number>;
}

class Editor implements KetcherEditor {
  ketcherId: string;
  #origin?: any;
  render: Render;
  _selection: Selection | null;
  _tool: Tool | null;
  historyStack: Action[];
  historyPtr: number;
  errorHandler: ((message: string) => void) | null;
  highlights: Highlighter;
  hoverIcon: HoverIcon;
  lastCursorPosition: { x: number; y: number };
  contextMenu: ContextMenuInfo;
  rotateController: RotateController;
  event: {
    message: Subscription;
    elementEdit: PipelineSubscription;
    zoomIn: PipelineSubscription;
    zoomOut: PipelineSubscription;
    zoomChanged: PipelineSubscription;
    bondEdit: PipelineSubscription;
    rgroupEdit: PipelineSubscription;
    sgroupEdit: PipelineSubscription;
    sdataEdit: PipelineSubscription;
    quickEdit: PipelineSubscription;
    attachEdit: PipelineSubscription;
    removeFG: PipelineSubscription;
    change: Subscription;
    selectionChange: PipelineSubscription;
    aromatizeStruct: PipelineSubscription;
    dearomatizeStruct: PipelineSubscription;
    enhancedStereoEdit: PipelineSubscription;
    confirm: PipelineSubscription;
    showInfo: PipelineSubscription;
    apiSettings: PipelineSubscription;
    cursor: Subscription;
    updateFloatingTools: Subscription<FloatingToolsParams>;
  };

  public serverSettings = {};

  lastEvent: any;
  macromoleculeConvertionError: string | null | undefined;

  constructor(ketcherId, clientArea, options, serverSettings, prevEditor?) {
    this.render = new Render(
      clientArea,
      Object.assign(
        {
          microModeScale: SCALE,
        },
        options,
      ),
      prevEditor?.render,
      options.reuseRestructIfExist !== false,
    );

    this.ketcherId = ketcherId;
    this._selection = null; // eslint-disable-line
    this._tool = null; // eslint-disable-line
    this.historyStack = [];
    this.historyPtr = 0;
    this.errorHandler = null;
    this.highlights = new Highlighter(this);
    this.renderAndRecoordinateStruct =
      this.renderAndRecoordinateStruct.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setServerSettings(serverSettings);
    this.lastCursorPosition = {
      x: 0,
      y: 0,
    };
    this.hoverIcon = new HoverIcon(this);
    this.hoverIcon.updatePosition();
    this.contextMenu = {};
    this.rotateController = new RotateController(this);

    this.event = {
      message: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      zoomIn: new PipelineSubscription(),
      zoomOut: new PipelineSubscription(),
      zoomChanged: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      removeFG: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription(),
      confirm: new PipelineSubscription(),
      cursor: new PipelineSubscription(),
      showInfo: new PipelineSubscription(),
      apiSettings: new PipelineSubscription(),
      updateFloatingTools: new Subscription(),
    };

    domEventSetup(this, clientArea);
    this.render.paper.canvas.setAttribute('data-testid', 'canvas');
  }

  isDitrty(): boolean {
    const position = this.historyPtr;
    const length = this.historyStack.length;
    if (!length || !this.#origin) {
      return false;
    }
    return !isEqual(this.historyStack[position - 1], this.#origin);
  }

  setOrigin(): void {
    const position = this.historyPtr;
    this.#origin = position ? this.historyStack[position - 1] : null;
  }

  tool(name?: any, opts?: any): Tool | null {
    /* eslint-disable no-underscore-dangle */
    if (arguments.length === 0) {
      return this._tool;
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    const ToolConstructor: ToolConstructorInterface = toolsMap[name];

    const tool = new ToolConstructor(this, opts);

    const isAtomToolChosen = name === 'atom';
    if (!isAtomToolChosen) {
      this.hoverIcon.hide(true);
    }

    if (!tool || tool.isNotActiveTool) {
      return null;
    }

    const isSelectToolChosen = name === 'select';
    if (!isSelectToolChosen) {
      this.rotateController.clean();
    }

    this._tool = tool;
    return this._tool;
    /* eslint-enable no-underscore-dangle */
  }

  clear() {
    this.struct(undefined);
  }

  renderAndRecoordinateStruct(
    struct: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    const action = fromNewCanvas(this.render.ctab, struct);

    this.update(action);

    if (needToCenterStruct) {
      this.centerStruct();
    } else if (x != null && y != null) {
      this.positionStruct(x, y);
    }

    return this.render.ctab.molecule;
  }

  /** Apply {@link value}: {@link Struct} if provided to {@link render} and  */
  struct(
    value?: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    if (arguments.length === 0) {
      return this.render.ctab.molecule;
    }

    KetcherLogger.log('Editor.struct(), start', value, needToCenterStruct);

    this.selection(null);
    const struct = value || new Struct();

    const molecule = this.renderAndRecoordinateStruct(
      struct,
      needToCenterStruct,
      x,
      y,
    );

    this.hoverIcon.create();
    KetcherLogger.log('Editor.struct(), end');
    return molecule;
  }

  // this is used by API addFragment method
  structToAddFragment(struct: Struct, x?: number, y?: number): Struct {
    if (x != null && y != null) {
      const position = new Vec2(x, y);
      const [action] = fromPaste(
        this.render.ctab,
        struct,
        position,
        0,
        false,
        true,
      );
      this.update(action, true);
    } else {
      const superStruct = struct.mergeInto(this.render.ctab.molecule.clone());

      this.renderAndRecoordinateStruct(superStruct);
    }

    this.centerViewportAccordingToStruct();

    return this.render.ctab.molecule;
  }

  setOptions(opts: string) {
    const options = JSON.parse(opts);
    this.event.apiSettings.dispatch({ ...options });
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;
    const result = this.render.updateOptions(opts);
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    return result;
  }

  /** Apply options from {@link value} */
  options(value?: any) {
    if (arguments.length === 0) {
      return this.render.options;
    }

    const struct = this.render.ctab.molecule;
    const zoom = this.render.options.zoom;
    this.render.clientArea.innerHTML = '';
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;

    this.render = new Render(
      this.render.clientArea,
      Object.assign({ microModeScale: SCALE }, value),
    );
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    this.render.setMolecule(struct);
    this.struct(struct.clone());
    this.render.setZoom(zoom);
    this.render.update();
    return this.render.options;
  }

  public setServerSettings(serverSettings) {
    this.serverSettings = serverSettings;
  }

  private updateToolAfterOptionsChange(wasViewOnlyEnabled: boolean) {
    const isViewOnlyEnabled = this.render.options.viewOnlyMode;
    if (
      (!wasViewOnlyEnabled && isViewOnlyEnabled === true) ||
      (wasViewOnlyEnabled && isViewOnlyEnabled === false)
    ) {
      // We need to reset the tool to make sure it was recreated
      this.tool('select');
      this.event.change.dispatch('force');
      ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch('force');
    }
  }

  zoom(value?: any, event?: WheelEvent) {
    if (arguments.length === 0 || this.render.options.zoom === value) {
      return this.render.options.zoom;
    }

    this.render.setZoom(value, event);

    this.render.update();
    this.rotateController.rerender();
    return this.render.options.zoom;
  }

  centerStruct() {
    const structure = this.render.ctab;
    const structCenter = getStructCenter(structure);
    const viewBoxCenter = new Vec2(
      this.render.viewBox.minX + this.render.viewBox.width / 2,
      this.render.viewBox.minY + this.render.viewBox.height / 2,
    );
    const viewBoxCenterInProto = Scale.canvasToModel(
      viewBoxCenter,
      this.render.options,
    );
    const shiftVector = viewBoxCenterInProto.sub(structCenter);

    const structureToMove = getSelectionMap(structure);

    const action = fromMultipleMove(structure, structureToMove, shiftVector);
    this.update(action, true);
  }

  public centerViewportAccordingToStruct(struct: Struct = this.struct()) {
    const isFitMinZoom = this.zoomAccordingContent(struct);

    const structBbox = struct.getCoordBoundingBox();
    const newScrollCoordinates = Coordinates.modelToCanvas(
      isFitMinZoom
        ? new Vec2(
            structBbox.min.x + (structBbox.max.x - structBbox.min.x) / 2,
            structBbox.min.y + (structBbox.max.y - structBbox.min.y) / 2,
          )
        : new Vec2(structBbox.min.x, structBbox.min.y),
    ).sub(
      new Vec2(this.render.viewBox.width / 2, this.render.viewBox.height / 2),
    );

    this.render.setViewBox((viewBox) => {
      return {
        ...viewBox,
        minX: newScrollCoordinates.x,
        minY: newScrollCoordinates.y,
      };
    });
  }

  positionStruct(x: number, y: number) {
    const struct = this.struct();
    const reStruct = this.render.ctab;
    const structBbox = struct.getCoordBoundingBox();
    const shiftVector = new Vec2(x, y).sub(structBbox.min);
    const structureToMove = getSelectionMap(reStruct);
    const action = fromMultipleMove(reStruct, structureToMove, shiftVector);
    this.update(action, true);
    this.centerViewportAccordingToStruct();
  }

  zoomAccordingContent(struct: Struct) {
    const MIN_ZOOM_VALUE = 0.1;
    const MAX_ZOOM_VALUE = 1;
    const MARGIN_IN_PIXELS = 60;
    const parsedStructCoordBoundingBox = struct.getCoordBoundingBox();
    const parsedStructSize = new Vec2(
      parsedStructCoordBoundingBox.max.x - parsedStructCoordBoundingBox.min.x,
      parsedStructCoordBoundingBox.max.y - parsedStructCoordBoundingBox.min.y,
    );
    const parsedStructSizeInPixels = {
      width:
        parsedStructSize.x *
        this.render.options.microModeScale *
        this.render.options.zoom,
      height:
        parsedStructSize.y *
        this.render.options.microModeScale *
        this.render.options.zoom,
    };
    const clientAreaBoundingBox =
      this.render.clientArea.getBoundingClientRect();

    if (
      parsedStructSizeInPixels.width + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.width &&
      parsedStructSizeInPixels.height + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.height
    ) {
      return true;
    }

    let newZoomValue =
      this.render.options.zoom /
      (parsedStructSizeInPixels.height - clientAreaBoundingBox.height >
      parsedStructSizeInPixels.width - clientAreaBoundingBox.width
        ? parsedStructSizeInPixels.height / clientAreaBoundingBox.height
        : parsedStructSizeInPixels.width / clientAreaBoundingBox.width);

    if (newZoomValue >= MAX_ZOOM_VALUE) {
      this.zoom(MAX_ZOOM_VALUE);
      return true;
    }

    newZoomValue -= MARGIN_IN_PIXELS / clientAreaBoundingBox.width;

    this.zoom(
      newZoomValue < MIN_ZOOM_VALUE
        ? MIN_ZOOM_VALUE
        : Number(newZoomValue.toFixed(2)),
    );
    this.event.zoomChanged.dispatch();

    return newZoomValue > MIN_ZOOM_VALUE;
  }

  selection(ci?: any) {
    if (arguments.length === 0) {
      return this._selection; // eslint-disable-line
    }

    let ReStruct = this.render.ctab;
    let selectAll = false;
    this._selection = null; // eslint-disable-line
    if (ci === 'all') {
      selectAll = true;
      // TODO: better way will be this.struct()
      ci = structObjects.reduce((res, key) => {
        res[key] = Array.from(ReStruct[key].keys());
        return res;
      }, {});
    }

    if (ci === 'descriptors') {
      ReStruct = this.render.ctab;
      ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) };
    }

    if (ci) {
      const res: Selection = {};

      Object.keys(ci).forEach((key) => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice();
      });

      if (Object.keys(res).length !== 0) {
        this._selection = res; // eslint-disable-line
      }
      const stereoFlags = selectStereoFlagsIfNecessary(
        this.struct().atoms,
        this.explicitSelected().atoms,
      );
      if (stereoFlags.length !== 0) {
        this._selection && this._selection.enhancedFlags
          ? (this._selection.enhancedFlags = Array.from(
              new Set([...this._selection.enhancedFlags, ...stereoFlags]),
            ))
          : (res.enhancedFlags = stereoFlags);
      }
    }

    this.render.ctab.setSelection(this._selection); // eslint-disable-line
    this.event.selectionChange.dispatch(this._selection); // eslint-disable-line

    if (selectAll) {
      this.rotateController.rerender();
    } else if (this._selection === null) {
      this.rotateController.clean();
    }

    this.render.update(false, null);
    return this._selection; // eslint-disable-line
  }

  hover(
    ci: { id: number; map: string } | null,
    newTool?: any,
    event?: PointerEvent,
  ) {
    const tool = newTool || this._tool; // eslint-disable-line

    if (
      'ci' in tool &&
      (!ci || tool.ci.map !== ci.map || tool.ci.id !== ci.id)
    ) {
      setHover(tool.ci, false, this.render);
      delete tool.ci;
    }

    if (ci && setHover(ci, true, this.render)) {
      tool.ci = ci;
    }

    if (!ci) {
      setFunctionalGroupsTooltip({
        editor: this,
        isShow: false,
      });
      return;
    }

    if (event) {
      setFunctionalGroupsTooltip({
        editor: this,
        event,
        isShow: true,
      });
    }
  }

  update(action: Action | true, ignoreHistory?: boolean) {
    setFunctionalGroupsTooltip({
      editor: this,
      isShow: false,
    });
    if (!ignoreHistory) {
      this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    }
    if (action === true) {
      this.render.update(true, null); // force
    } else {
      if (!ignoreHistory && !action.isDummy()) {
        this.historyStack.splice(this.historyPtr, HISTORY_SIZE + 1, action);
        if (this.historyStack.length > HISTORY_SIZE) {
          this.historyStack.shift();
        }
        this.historyPtr = this.historyStack.length;
        this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
        ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch(action);
      }
      this.render.update(false, null);
    }
  }

  historySize(): { readonly undo: number; readonly redo: number } {
    return {
      undo: this.historyPtr,
      redo: this.historyStack.length - this.historyPtr,
    };
  }

  undo() {
    KetcherLogger.log(
      'Editor.undo(), start, ',
      this.historyPtr,
      this.historyStack,
    );

    const ketcherChangeEvent = ketcherProvider.getKetcher(
      this.ketcherId,
    ).changeEvent;
    if (this.historyPtr === 0) {
      throw new Error('Undo stack is empty');
    }
    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    this.historyPtr--;
    const stack = this.historyStack[this.historyPtr];
    const action = stack.perform(this.render.ctab);

    this.historyStack[this.historyPtr] = action;

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch(); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch();
    } else {
      this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch(action);
    }

    this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.render.update();

    KetcherLogger.log('Editor.undo(), end');
  }

  redo() {
    KetcherLogger.log(
      'Editor.redo(), start, ',
      this.historyPtr,
      this.historyStack,
    );

    const ketcherChangeEvent = ketcherProvider.getKetcher(
      this.ketcherId,
    ).changeEvent;
    if (this.historyPtr === this.historyStack.length) {
      throw new Error('Redo stack is empty');
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    const stack = this.historyStack[this.historyPtr];
    let action!: Action;
    try {
      action = stack.perform(this.render.ctab);
    } finally {
      this.historyStack[this.historyPtr] = action;
      this.historyPtr++;
    }

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch(); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch();
    } else {
      this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch(action);
    }

    this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.render.update();

    KetcherLogger.log('Editor.redo(), end');
  }

  public clearHistory() {
    this.historyStack = [];
    this.historyPtr = 0;
  }

  subscribe(eventName: any, handler: any) {
    const subscriber = {
      handler,
    };

    switch (eventName) {
      case 'change': {
        const subscribeFuncWrapper = (action) =>
          customOnChangeHandler(action, handler);
        subscriber.handler = subscribeFuncWrapper;
        ketcherProvider
          .getKetcher(this.ketcherId)
          .changeEvent.add(subscribeFuncWrapper);
        break;
      }

      default:
        this.event[eventName].add(handler);
    }

    return subscriber;
  }

  unsubscribe(eventName: any, subscriber: any) {
    // Only for event type - subscription
    this.event[eventName].remove(subscriber.handler);
  }

  findItem(event: any, maps: Array<string> | null, skip: any = null) {
    const pos = new Vec2(this.render.page2obj(event));

    return closest.item(this.render.ctab, pos, maps, skip, this.render.options);
  }

  findMerge(srcItems: any, maps: any) {
    return closest.merge(this.render.ctab, srcItems, maps, this.render.options);
  }

  explicitSelected() {
    const selection = this.selection() || {};
    const res = structObjects.reduce((acc, key) => {
      acc[key] = selection[key] ? selection[key].slice() : [];
      return acc;
    }, {} as any);

    const struct = this.render.ctab.molecule;

    // "auto-select" the atoms for the bonds in selection
    if (res.bonds) {
      res.bonds.forEach((bid) => {
        const bond = struct.bonds.get(bid);
        if (bond) {
          res.atoms = res.atoms || [];
          if (res.atoms.indexOf(bond.begin) < 0) {
            res.atoms.push(bond.begin);
          }

          if (res.atoms.indexOf(bond.end) < 0) {
            res.atoms.push(bond.end);
          }
        }
      });
    }

    // "auto-select" the bonds with both atoms selected
    if (res.atoms && res.bonds) {
      struct.bonds.forEach((bond, bid) => {
        if (
          res.bonds.indexOf(bid) < 0 &&
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds = res.bonds || [];
          res.bonds.push(bid);
        }
      });
    }

    return res;
  }

  structSelected() {
    const struct = this.render.ctab.molecule;
    const selection = this.explicitSelected();
    const dst = struct.clone(
      new Pile(selection.atoms),
      new Pile(selection.bonds),
      true,
      null,
      new Pile(selection.simpleObjects),
      new Pile(selection.texts),
      null,
      new Pile(selection.images),
      new Pile(selection[MULTITAIL_ARROW_KEY]),
    );

    // Copy by its own as Struct.clone doesn't support
    // arrows/pluses id sets
    struct.rxnArrows.forEach((item, id) => {
      if (selection.rxnArrows.indexOf(id) !== -1)
        dst.rxnArrows.add(item.clone());
    });
    struct.rxnPluses.forEach((item, id) => {
      if (selection.rxnPluses.indexOf(id) !== -1)
        dst.rxnPluses.add(item.clone());
    });

    dst.isReaction = struct.isReaction && struct.isRxn();

    return dst;
  }

  alignDescriptors() {
    this.selection(null);
    const action = fromDescriptorsAlign(this.render.ctab);
    this.update(action);
    this.render.update(true);
  }

  setMacromoleculeConvertionError(errorMessage: string) {
    this.macromoleculeConvertionError = errorMessage;
  }

  clearMacromoleculeConvertionError() {
    this.macromoleculeConvertionError = null;
  }

  focusCliparea() {
    const cliparea: HTMLElement | null = document.querySelector('.cliparea');
    cliparea?.focus();
  }
}

/**
 * Main button pressed, usually the left button or the un-initialized state
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

function resetSelectionOnCanvasClick(
  editor: Editor,
  eventName: string,
  clientArea: HTMLElement,
  event,
) {
  if (
    eventName === 'mouseup' &&
    editor.selection() &&
    clientArea.contains(event.target)
  ) {
    editor.selection(null);
  }
}

function updateLastCursorPosition(editor: Editor, event) {
  const events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
  if (events.includes(event.type)) {
    const clientAreaBoundingBox =
      editor.render.clientArea.getBoundingClientRect();

    editor.lastCursorPosition = {
      x: event.clientX - clientAreaBoundingBox.x,
      y: event.clientY - clientAreaBoundingBox.y,
    };
  }
}

function isContextMenuClosed(contextMenu: ContextMenuInfo) {
  return !Object.values(contextMenu).some(Boolean);
}

function useToolIfNeeded(
  editor: Editor,
  eventHandlerName: ToolEventHandlerName,
  clientArea: HTMLElement,
  event,
) {
  const editorTool = editor.tool();
  if (!editorTool) {
    return false;
  }

  editor.lastEvent = event;
  const conditions = [
    eventHandlerName in editorTool,
    clientArea.contains(event.target) || editorTool.isSelectionRunning?.(),
    isContextMenuClosed(editor.contextMenu),
  ];

  if (conditions.every((condition) => condition)) {
    editorTool[eventHandlerName]?.(event);
    return true;
  }

  return false;
}

function domEventSetup(editor: Editor, clientArea: HTMLElement) {
  // TODO: addEventListener('resize', ...);
  const trackedDomEvents: {
    target: Node;
    eventName: string;
    toolEventHandler: ToolEventHandlerName;
  }[] = [
    {
      target: clientArea,
      eventName: 'click',
      toolEventHandler: 'click',
    },
    {
      target: clientArea,
      eventName: 'dblclick',
      toolEventHandler: 'dblclick',
    },
    {
      target: clientArea,
      eventName: 'mousedown',
      toolEventHandler: 'mousedown',
    },
    {
      target: document,
      eventName: 'mousemove',
      toolEventHandler: 'mousemove',
    },
    {
      target: document,
      eventName: 'mouseup',
      toolEventHandler: 'mouseup',
    },
    {
      target: document,
      eventName: 'mouseleave',
      toolEventHandler: 'mouseleave',
    },
    {
      target: clientArea,
      eventName: 'mouseleave',
      toolEventHandler: 'mouseLeaveClientArea',
    },
    {
      target: clientArea,
      eventName: 'mouseover',
      toolEventHandler: 'mouseover',
    },
  ];

  trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
    editor.event[eventName] = new DOMSubscription();
    const subs = editor.event[eventName];

    target.addEventListener(eventName, (...args) => {
      if (window.isPolymerEditorTurnedOn) return;
      subs.dispatch(...args);
    });

    subs.add((event) => {
      updateLastCursorPosition(editor, event);

      if (
        ['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) &&
        !isMouseMainButtonPressed(event)
      ) {
        return true;
      }

      if (eventName === 'mousemove') {
        const itemUnderCursor = editor.findItem(event, [
          'atoms',
          'bonds',
          'sgroups',
        ]);
        if (!itemUnderCursor) {
          editor.hover(null);
        }
      }

      if (eventName !== 'mouseup' && eventName !== 'mouseleave') {
        // to complete drag actions
        if (!event.target || event.target.nodeName === 'DIV') {
          // click on scroll
          editor.hover(null);
          return true;
        }
      }

      const isToolUsed = useToolIfNeeded(
        editor,
        toolEventHandler,
        clientArea,
        event,
      );
      if (isToolUsed) {
        return true;
      }

      resetSelectionOnCanvasClick(editor, eventName, clientArea, event);

      return true;
    }, -1);
  });
}

export { Editor };
export default Editor;

function setHover(ci: any, visible: any, render: any) {
  if (highlightTargets.indexOf(ci.map) === -1) {
    return false;
  }

  let item: any = null;

  if (ci.map === 'merge') {
    Object.keys(ci.items).forEach((mp) => {
      ci.items[mp].forEach((dstId) => {
        item = render.ctab[mp].get(dstId)!;

        if (item) {
          item.setHover(visible, render);
        }
      });
    });

    return true;
  }

  if (ci.map === 'functionalGroups') ci.map = 'sgroups'; // TODO: Refactor object

  item = (render.ctab[ci.map] as Map<any, any>).get(ci.id);
  if (!item) {
    return true; // TODO: fix, attempt to highlight a deleted item
  }

  if (
    (ci.map === 'sgroups' && item.item.type === 'DAT') ||
    ci.map === 'sgroupData'
  ) {
    // set highlight for both the group and the data item
    const item1 = render.ctab.sgroups.get(ci.id);
    if (item1) {
      item1.setHover(visible, render);
    }

    const item2 = render.ctab.sgroupData.get(ci.id);
    if (item2) {
      item2.setHover(visible, render);
    }
  } else {
    item.setHover(visible, render);
  }
  return true;
}
