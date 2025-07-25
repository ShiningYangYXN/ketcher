import { Subscription } from 'subscription';
import { ToolEventHandlerName } from 'application/editor/tools/Tool';
import { CoreEditor } from 'application/editor/Editor';
import ZoomTool from 'application/editor/tools/Zoom';
import { SequenceType } from 'domain/entities/monomer-chains/types';
import { ToolName } from 'application/editor/tools/types';

export interface IEditorEvents {
  selectMonomer: Subscription;
  selectPreset: Subscription;
  selectTool: Subscription;
  createBondViaModal: Subscription;
  cancelBondCreationViaModal: Subscription;
  selectMode: Subscription;
  layoutModeChange: Subscription;
  selectHistory: Subscription;
  error: Subscription;
  openErrorModal: Subscription;
  openMonomerConnectionModal: Subscription;
  mouseOverPolymerBond: Subscription;
  mouseLeavePolymerBond: Subscription;
  mouseOnMovePolymerBond: Subscription;
  mouseOverMonomer: Subscription;
  mouseOnMoveMonomer: Subscription;
  mouseLeaveMonomer: Subscription;
  mouseOverAttachmentPoint: Subscription;
  mouseLeaveAttachmentPoint: Subscription;
  mouseUpAttachmentPoint: Subscription;
  mouseDownAttachmentPoint: Subscription;
  mouseOverDrawingEntity: Subscription;
  mouseLeaveDrawingEntity: Subscription;
  mouseUpMonomer: Subscription;
  rightClickSequence: Subscription;
  rightClickCanvas: Subscription;
  rightClickPolymerBond: Subscription;
  rightClickSelectedMonomers: Subscription;
  keyDown: Subscription;
  editSequence: Subscription;
  startNewSequence: Subscription;
  establishHydrogenBond: Subscription;
  deleteHydrogenBond: Subscription;
  turnOnSequenceEditInRNABuilderMode: Subscription;
  turnOffSequenceEditInRNABuilderMode: Subscription;
  modifySequenceInRnaBuilder: Subscription;
  mouseOverSequenceItem: Subscription;
  mouseOnMoveSequenceItem: Subscription;
  mouseLeaveSequenceItem: Subscription;
  changeSequenceTypeEnterMode: Subscription;
  toggleSequenceEditMode: Subscription;
  toggleSequenceEditInRNABuilderMode: Subscription;
  toggleIsSequenceSyncEditMode: Subscription;
  resetSequenceEditMode: Subscription;
  clickOnSequenceItem: Subscription;
  mousedownBetweenSequenceItems: Subscription;
  mouseDownOnSequenceItem: Subscription;
  doubleClickOnSequenceItem: Subscription;
  openConfirmationDialog: Subscription;
  mouseUpAtom: Subscription;
  updateMonomersLibrary: Subscription;
  createAntisenseChain: Subscription;
  copySelectedStructure: Subscription;
  pasteFromClipboard: Subscription;
  deleteSelectedStructure: Subscription;
  selectEntities: Subscription;
  toggleMacromoleculesPropertiesVisibility: Subscription;
  modifyAminoAcids: Subscription;
  setEditorLineLength: Subscription;
  toggleLineLengthHighlighting: Subscription;
  setLibraryItemDragState: Subscription;
  placeLibraryItemOnCanvas: Subscription;
}

export let editorEvents: IEditorEvents;

export function resetEditorEvents() {
  editorEvents = {
    selectMonomer: new Subscription(),
    selectPreset: new Subscription(),
    selectTool: new Subscription(),
    createBondViaModal: new Subscription(),
    cancelBondCreationViaModal: new Subscription(),
    selectMode: new Subscription(),
    layoutModeChange: new Subscription(),
    selectHistory: new Subscription(),
    error: new Subscription(),
    openErrorModal: new Subscription(),
    openMonomerConnectionModal: new Subscription(),
    mouseOverPolymerBond: new Subscription(),
    mouseLeavePolymerBond: new Subscription(),
    mouseOnMovePolymerBond: new Subscription(),
    mouseOverMonomer: new Subscription(),
    mouseOnMoveMonomer: new Subscription(),
    mouseLeaveMonomer: new Subscription(),
    mouseOverAttachmentPoint: new Subscription(),
    mouseLeaveAttachmentPoint: new Subscription(),
    mouseUpAttachmentPoint: new Subscription(),
    mouseDownAttachmentPoint: new Subscription(),
    mouseOverDrawingEntity: new Subscription(),
    mouseLeaveDrawingEntity: new Subscription(),
    mouseUpMonomer: new Subscription(),
    rightClickSequence: new Subscription(),
    rightClickCanvas: new Subscription(),
    rightClickPolymerBond: new Subscription(),
    rightClickSelectedMonomers: new Subscription(),
    keyDown: new Subscription(),
    editSequence: new Subscription(),
    startNewSequence: new Subscription(),
    establishHydrogenBond: new Subscription(),
    deleteHydrogenBond: new Subscription(),
    turnOnSequenceEditInRNABuilderMode: new Subscription(),
    turnOffSequenceEditInRNABuilderMode: new Subscription(),
    modifySequenceInRnaBuilder: new Subscription(),
    mouseOverSequenceItem: new Subscription(),
    mouseOnMoveSequenceItem: new Subscription(),
    mouseLeaveSequenceItem: new Subscription(),
    changeSequenceTypeEnterMode: new Subscription(),
    toggleSequenceEditMode: new Subscription(),
    toggleSequenceEditInRNABuilderMode: new Subscription(),
    toggleIsSequenceSyncEditMode: new Subscription(),
    resetSequenceEditMode: new Subscription(),
    clickOnSequenceItem: new Subscription(),
    mousedownBetweenSequenceItems: new Subscription(),
    mouseDownOnSequenceItem: new Subscription(),
    doubleClickOnSequenceItem: new Subscription(),
    openConfirmationDialog: new Subscription(),
    mouseUpAtom: new Subscription(),
    updateMonomersLibrary: new Subscription(),
    createAntisenseChain: new Subscription(),
    copySelectedStructure: new Subscription(),
    pasteFromClipboard: new Subscription(),
    deleteSelectedStructure: new Subscription(),
    selectEntities: new Subscription(),
    toggleMacromoleculesPropertiesVisibility: new Subscription(),
    modifyAminoAcids: new Subscription(),
    setEditorLineLength: new Subscription(),
    toggleLineLengthHighlighting: new Subscription(),
    setLibraryItemDragState: new Subscription(),
    placeLibraryItemOnCanvas: new Subscription(),
  };
}
resetEditorEvents();
export const renderersEvents: ToolEventHandlerName[] = [
  'mouseOverPolymerBond',
  'mouseLeavePolymerBond',
  'mouseOnMovePolymerBond',
  'mouseOverMonomer',
  'mouseOnMoveMonomer',
  'mouseOverAttachmentPoint',
  'mouseLeaveAttachmentPoint',
  'mouseUpAttachmentPoint',
  'mouseDownAttachmentPoint',
  'mouseLeaveMonomer',
  'mouseOverDrawingEntity',
  'mouseLeaveDrawingEntity',
  'mouseUpMonomer',
  'rightClickSequence',
  'rightClickCanvas',
  'rightClickPolymerBond',
  'rightClickSelectedMonomers',
  'editSequence',
  'startNewSequence',
  'turnOnSequenceEditInRNABuilderMode',
  'turnOffSequenceEditInRNABuilderMode',
  'modifySequenceInRnaBuilder',
  'mouseOverSequenceItem',
  'mouseOnMoveSequenceItem',
  'mouseLeaveSequenceItem',
  'changeSequenceTypeEnterMode',
  'toggleSequenceEditMode',
  'toggleSequenceEditInRNABuilderMode',
  'clickOnSequenceItem',
  'mousedownBetweenSequenceItems',
  'mouseDownOnSequenceItem',
  'doubleClickOnSequenceItem',
  'mouseUpAtom',
  'selectEntities',
];

export const hotkeysConfiguration = {
  RNASequenceType: {
    shortcut: ['Control+Alt+r'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.RNA);
    },
  },
  DNASequenceType: {
    shortcut: ['Control+Alt+d'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.DNA);
    },
  },
  PEPTIDESequenceTYpe: {
    shortcut: ['Control+Alt+p'],
    handler: (editor: CoreEditor) => {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.PEPTIDE);
    },
  },
  exit: {
    shortcut: ['Shift+Tab', 'Escape'],
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch([ToolName.selectRectangle]);
      editor.cancelLibraryItemDrag();
    },
  },
  undo: {
    shortcut: 'Mod+z',
    handler: (editor: CoreEditor) => {
      editor.onSelectHistory('undo');
    },
  },
  redo: {
    shortcut: ['Mod+Shift+z', 'Mod+y'],
    handler: (editor: CoreEditor) => {
      editor.onSelectHistory('redo');
    },
  },
  erase: {
    shortcut: ['Delete', 'Backspace'],
    handler: (editor: CoreEditor) => {
      // TODO create an ability to stop event propagation from mode event handlers to keyboard shortcuts handlers
      if (editor.isSequenceEditMode) return;
      editor.events.selectTool.dispatch([ToolName.erase]);
      editor.events.selectTool.dispatch([ToolName.selectRectangle]);
    },
  },
  clear: {
    shortcut: ['Mod+Delete', 'Mod+Backspace'],
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch([ToolName.clear]);
      editor.events.selectTool.dispatch([ToolName.selectRectangle]);
    },
  },
  'zoom-plus': {
    shortcut: 'Mod+=',
    handler: () => {
      ZoomTool.instance.zoomIn();
    },
  },
  'zoom-minus': {
    shortcut: 'Mod+-',
    handler: () => {
      ZoomTool.instance.zoomOut();
    },
  },
  'zoom-reset': {
    shortcut: 'Mod+0',
    handler: () => {
      ZoomTool.instance.resetZoom();
    },
  },
  'select-all': {
    shortcut: 'Mod+a',
    handler: (editor: CoreEditor) => {
      const modelChanges =
        editor.drawingEntitiesManager.selectAllDrawingEntities();
      editor.renderersContainer.update(modelChanges);
    },
  },
  hand: {
    shortcut: 'Mod+Alt+h',
    handler: (editor: CoreEditor) => {
      editor.events.selectTool.dispatch([ToolName.hand]);
    },
  },
  'hide-scrollbars': {
    shortcut: 'Mod+b',
    handler: () => {
      ZoomTool.instance.drawScrollBars(true);
    },
  },
  createRnaAntisenseStrand: {
    shortcut: ['Shift+Alt+r'],
    handler: (editor: CoreEditor) => {
      editor.events.createAntisenseChain.dispatch(false);
    },
  },
  createDnaAntisenseStrand: {
    shortcut: ['Shift+Alt+d'],
    handler: (editor: CoreEditor) => {
      editor.events.createAntisenseChain.dispatch(true);
    },
  },
  toggleMacromoleculesPropertiesVisibility: {
    shortcut: 'Alt+c',
    handler: (editor: CoreEditor) => {
      editor.events.toggleMacromoleculesPropertiesVisibility.dispatch();
    },
  },
};
