/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  pressButton,
  doubleClickOnAtom,
  doubleClickOnBond,
  BondType,
  moveOnAtom,
  dragMouseTo,
  screenshotBetweenUndoRedo,
  openFileAndAddToCanvas,
  getCoordinatesTopAtomOfBenzeneRing,
  waitForPageInit,
  waitForRender,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  selectUndoByKeyboard,
  selectRedoByKeyboard,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  GeneralSetting,
  ResetToSelectToolOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import { setAttachmentPoints } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import {
  ContextOption,
  PropertyLabelType,
  RepeatPatternOption,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { RGroupDialog } from '@tests/pages/molecules/canvas/R-GroupDialog';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function selectBondProperties(
  page: Page,
  bondType: string,
  bondTopology: string,
  bondReactingCenter: string,
  finalizationButton: string,
) {
  await page.getByTestId('type-input-span').click();
  await page.getByRole('option', { name: bondType, exact: true }).click();
  await page.getByTestId('topology-input-span').click();
  await page.getByRole('option', { name: bondTopology }).click();
  await page.getByTestId('reacting-center-input-span').click();
  await page
    .getByRole('option', { name: bondReactingCenter, exact: true })
    .click();
  await pressButton(page, finalizationButton);
}

test.describe('Undo/Redo Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Undo/Redo Erase template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1732
    Description: Undo/Redo actions work correctly:
    for the Undo action the deleted object is restored.
    after Redo it is deleted again.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();

    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Atom template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1740
    Description: Undo/Redo actions work correctly:
    Undo: heteroatom is removed;
    Redo: heteroatom is restored.
    */
    const atomToolbar = RightToolbar(page);

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Chlorine);

    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Atom Properties template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1741
    Description: Undo/Redo actions work correctly:
    Undo: the property mark is removed.
    Redo: the property mark is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: {
        Alias: '!@#$%123AbCd',
      },
    });

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Bond Properties template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1742
    Description: Undo/Redo actions work correctly:
    Undo: the property mark is removed.
    Redo: the property mark is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    await doubleClickOnBond(page, BondType.SINGLE, 0);
    await selectBondProperties(page, 'Double', 'Ring', 'Center', 'Apply');

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1743
    Description: Undo/Redo action should work correctly:
    Undo: the Single bond is removed;
    Redo: the Single bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1744
    Description: Undo/Redo action should work correctly:
    Undo: the Double bond is removed;
    Redo: the Double bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Triple Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1750
    Description: Undo/Redo action should work correctly:
    Undo: the Triple bond is removed;
    Redo: the Triple bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Triple);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Chain template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1751
    Description: Undo/Redo action should work correctly:
    Undo: the Chain is removed;
    Redo: the Chain is restored.
    */
    const x = 300;
    const y = 300;
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).chain();
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Up stereobond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Up stereobond is removed;
    Redo: the Single Up stereobond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Down stereobond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Down stereobond is removed;
    Redo: the Single Down stereobond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleDown);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Up/Down stereobond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Up/Down stereobond is removed;
    Redo: the Single Up/Down stereobond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUpDown);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double Cis/Trans stereobond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Double Cis/Trans stereobond is removed;
    Redo: the Double Cis/Trans stereobond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.DoubleCisTrans);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Any Query Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Any Query Bond is removed;
    Redo: the Any Query Bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Any);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Aromatic Query Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Aromatic Query Bond is removed;
    Redo: the Aromatic Query Bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Aromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single/Double Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Single/Double Query Bond is removed;
    Redo: the Single/Double Query Bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleDouble);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single/Aromatic Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Single/Aromatic Query Bond is removed;
    Redo: the Single/Aromatic Query Bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleAromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double/Aromatic Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Double/Aromatic Query Bond is removed;
    Redo: the Double/Aromatic Query Bond is restored.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.DoubleAromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Mapping tool template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1754
    Description: Undo/Redo action should work correctly:
    Undo: the Mapping tool is removed;
    Redo: the Mapping tool is restored.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-chain.ket');
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionAutoMapping,
    );
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Data S-Group tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Data S-group is removed;
    Redo: the Data S-group is restored;
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Fragment,
      FieldName: 'Test',
      FieldValue: '33',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Multiple Group tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Multiple Group is removed;
    Redo: the Multiple Group is restored;
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.MultipleGroup,
      RepeatCount: '88',
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo SRU Polymer tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the SRU Polymer is removed;
    Redo: the SRU Polymer is restored;
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Superatom tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Superatom is removed;
    Redo: the Superatom is restored;
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Superatom,
      Name: 'Test@!#$%12345',
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo R-Group Label tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the R-Group Label tool is removed;
    Redo: the R-Group Label tool is restored;
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    // need fix getCoordinatesTopAtomOfBenzeneRing after change canvas design
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupLabels(RGroup.R5);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo R-Group Fragment tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the R-Group Fragment tool is removed;
    Redo: the R-Group Fragment tool is restored;
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    // need fix getCoordinatesTopAtomOfBenzeneRing after change canvas design
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R8);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Attachment Point tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the Attachment Point tool is removed;
    Redo: the Attachment Point tool is restored;
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Multiple Undo/Redo', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1757
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: true },
    );
    await setAttachmentPoints(
      page,
      { label: 'C', index: 4 },
      { primary: true, secondary: true },
    );

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Copy/Paste', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1758
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Cut/Paste', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1758
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Hotkeys', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1759
    Description: Undo/Redo hotkeys action should work correctly
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    for (let i = 0; i < 2; i++) {
      await selectUndoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectRedoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Zoom In/Zoom Out', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1760
    Description: Undo/Redo hotkeys action should work correctly
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    await ZoomOutByKeyboard(page, { repeat: 5 });
    for (let i = 0; i < 2; i++) {
      await selectUndoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectRedoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    await ZoomInByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo S-Group , Structure, Chain', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2960
    Description: Undo/Redo action should work correctly
    */
    const yDelta = 300;
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Fragment,
      FieldName: 'Test',
      FieldValue: '33',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await LeftToolbar(page).chain();
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y);
    const coordinatesWithShift = point.y + yDelta;
    await dragMouseTo(point.x, coordinatesWithShift, page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });
});

test.describe('Undo/Redo Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Undo/Redo paste template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1731
    Description: Undo/Redo actions work correctly:
    for Undo action the template is removed from the canvas,
    for Redo action the template is appeared on the canvas again.
    After one action is performed on the canvas and then the Undo button is pressed, the Redo button 
    becomes enabled and the Undo button becomes disabled.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).undo();
    await expect(page).toHaveScreenshot();
    await CommonTopLeftToolbar(page).redo();
    await expect(page).toHaveScreenshot();
  });

  test('When mouse hovering - hotkey CTRL+Z is working', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-11847
    Description:
    Draw 'Benzene'
    Draw any bonds on Benzene atoms
    Hover mouse cursor over of 'Benzene' and press CTRL+Z (Undo)
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', 2);
    await page.getByTestId('canvas').hover();
    await takeEditorScreenshot(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Undo deletes previously placed template', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16939
    Description:
    Open Ketcher settings.In the dropdown list for "reset to Select tool" choose "Off"
    Place a Benzene ring on the canvas.
    Use select tool to choose and CTRL+C placed ring.
    Press CTRL+V and place the ring. Press CTRL+Z.
    */
    await setSettingsOption(
      page,
      GeneralSetting.ResetToSelectTool,
      ResetToSelectToolOption.Off,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await selectUndoByKeyboard(page);
    await selectUndoByKeyboard(page);
  });
});
