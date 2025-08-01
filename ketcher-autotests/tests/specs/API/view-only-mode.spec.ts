/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  waitForPageInit,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProject,
  takeTopToolbarScreenshot,
  clickInTheMiddleOfTheScreen,
  takeLeftToolbarScreenshot,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  openFile,
  moveOnAtom,
  pressButton,
  dragMouseTo,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  deleteByKeyboard,
  keyboardPressOnCanvas,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import { waitForOpenButtonEnabled } from '@utils/common/loaders/waitForElementState';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  disableViewOnlyMode,
  disableViewOnlyModeBySetOptions,
  enableViewOnlyMode,
  enableViewOnlyModeBySetOptions,
  MolFileFormat,
} from '@utils/formats';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { MoleculesTopToolbar } from '@tests/pages/molecules/MoleculesTopToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.options', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API ketcher.editor.options({ viewOnlyMode: true }) and ketcher.editor.options({ viewOnlyMode: false })
    */
    await enableViewOnlyMode(page);
    await takePageScreenshot(page);
    await disableViewOnlyMode(page);
    await takePageScreenshot(page);
  });

  test('Check that application administrator can switch into and out of view-only mode at runtime using Ketcher API ketcher.editor.setOptions', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The application administrator can switch Ketcher into and out of view-only mode at runtime using 
    the Ketcher API window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true })) and window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false }))
    */
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
    await disableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Verify that view-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: View-only mode is still turned on after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true}))
    */
    await enableViewOnlyModeBySetOptions(page);
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Verify that view-only mode is still turned off after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: View-only mode is still turned off after two requests in a row window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false}))
    */
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
    await disableViewOnlyModeBySetOptions(page);
    await disableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page);
  });

  test('Get an error in console after sending request with the wrong parameters window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode123: false123}))', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Error in console after sending request with the wrong parameters window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode123: false}))
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await page.evaluate(() => {
      window.ketcher.editor.setOptions(
        JSON.stringify({ viewOnlyMode123: `false123` }),
      );
    });
  });

  test('Add to canvas different elements, turn on view only mode, verify that all editing tools are disabled in toolbars for elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: All editing tools are disabled in toolbars for elements
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-50-with-50-structures.ket',
    );
    await enableViewOnlyModeBySetOptions(page);
    await takePageScreenshot(page, { timeout: 10000 });
  });

  test('Turn on view-only mode, add to canvas different elements from file, verify that all editing tools are disabled in toolbars for elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Turn on view-only mode, add to canvas different elements from file, verify that all editing tools are disabled in toolbars for elements
    */
    await enableViewOnlyModeBySetOptions(page);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-50-with-50-structures.ket',
    );
    await takePageScreenshot(page);
  });

  test('Verify that the following tools and functions are enabled in view-only mode(Open, Save, Copy) ', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Tools and functions are enabled in view-only mode(Open, Save, Copy) 
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await selectAllStructuresOnCanvas(page);
    await expect(CommonTopLeftToolbar(page).openButton).toBeEnabled();
    await expect(CommonTopLeftToolbar(page).saveButton).toBeEnabled();
    await expect(MoleculesTopToolbar(page).copyButton).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the hand and selection tools are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Hand and selection tools are enabled in view-only mode
    */
    await enableViewOnlyModeBySetOptions(page);
    await expect(CommonLeftToolbar(page).handToolButton).toBeEnabled();
    await expect(
      CommonLeftToolbar(page).areaSelectionDropdownButton,
    ).toBeEnabled();
    await takeLeftToolbarScreenshot(page);
  });

  test('10. Verify that elements on Canvas can be copied (as MOL) in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Elements on Canvas copied (as MOL) in view-only mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await selectAllStructuresOnCanvas(page);

    await MoleculesTopToolbar(page).copyAsMOL();
    await disableViewOnlyModeBySetOptions(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, 200, 200);
    await takePageScreenshot(page);
  });

  test('Verify that elements on Canvas can be copied (as KET) in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Elements on Canvas copied (as KET) in view-only mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).copyAsKET();
    await disableViewOnlyModeBySetOptions(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
  });

  test('Verify that the help, about and fullscreen mode are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The help, about and fullscreen mode are enabled in view-only mode 
    */
    const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
    const aboutButton = CommonTopRightToolbar(page).aboutButton;
    const helpButton = CommonTopRightToolbar(page).helpButton;

    await enableViewOnlyModeBySetOptions(page);
    await expect(helpButton).toBeEnabled();
    await expect(aboutButton).toBeEnabled();
    await expect(fullScreenButton).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the "Check Structure", "Calculated Values", and "3D Viewer" tools are enabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Check Structure", "Calculated Values", and "3D Viewer" tools are enabled in view-only mode
    */
    await enableViewOnlyModeBySetOptions(page);
    await expect(page.getByTitle('Check Structure (Alt+S)')).toBeEnabled();
    await expect(page.getByTitle('Calculated Values (Alt+C)')).toBeEnabled();
    await expect(page.getByTitle('3D Viewer')).toBeEnabled();
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that the "Check Structure", "Calculated Values", and "3D Viewer" tools are operational in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Check Structure", "Calculated Values", and "3D Viewer" tools are operational in view-only mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await IndigoFunctionsToolbar(page).checkStructure();
    await takeEditorScreenshot(page, {
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
    await closeErrorAndInfoModals(page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await IndigoFunctionsToolbar(page).ThreeDViewer();
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Add to Canvas" button is disabled in the "Open structure" dialog window', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The "Add to Canvas" button is disabled in the "Open structure" dialog window
    */
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;
    const openAsNewButton = PasteFromClipboardDialog(page).openAsNewButton;
    await enableViewOnlyModeBySetOptions(page);
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, `KET/images-png-50-with-50-structures.ket`);
    await expect(addToCanvasButton).toBeDisabled();
    await expect(openAsNewButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  const hotkeys = [
    { keys: 'Control+c', action: 'Copy' },
    { keys: 'Control+Shift+f', action: 'Copy Image' },
    { keys: 'Control+Shift+k', action: 'Copy as KET' },
    { keys: 'Control+m', action: 'Copy as MOL' },
    { keys: 'Control+o', action: 'Open' },
    { keys: 'Control+s', action: 'Save As' },
    { keys: 'Control+a', action: 'Select All' },
    { keys: 'Control+Shift+a', action: 'Deselect All' },
    { keys: 'Alt+s', action: 'Check structure' },
    { keys: 'Alt+c', action: 'Calculate values' },
    { keys: 'Control+Alt+h', action: 'Hand tool' },
    { keys: 'Escape', action: 'Switch to Selection' },
    { keys: 'Control+-', action: 'Zoom Out' },
    { keys: 'Control+=', action: 'Zoom In' },
    { keys: 'Control+Shift+0', action: 'Zoom 100%' },
    { keys: '?', action: 'Help' },
  ];

  test.describe('Hotkeys test', () => {
    for (const hotkey of hotkeys) {
      test(`Verify that hotkey ${hotkey.keys} triggers ${hotkey.action}`, async ({
        page,
      }) => {
        const saveStructureTextarea =
          SaveStructureDialog(page).saveStructureTextarea;

        await selectRingButton(page, RingButton.Benzene);
        await clickInTheMiddleOfTheScreen(page);
        await enableViewOnlyModeBySetOptions(page);
        await selectAllStructuresOnCanvas(page);
        // Waiting for all selected elements to lose `display: none` is insufficient
        // because the "Copy" button becomes enabled last as an indicator of completion.
        await waitForOpenButtonEnabled(page);
        await waitForSpinnerFinishedWork(
          page,
          async () => await page.keyboard.press(hotkey.keys),
        );
        await takePageScreenshot(page, {
          mask: [
            StructureCheckDialog(page).lastCheckInfo,
            saveStructureTextarea,
          ],
        });
        await closeErrorAndInfoModals(page);
      });
    }
  });

  test('Verify that hotkeys for editing works after switching from View only mode to normal mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Hotkeys for editing works after switching from View only mode to normal mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await disableViewOnlyModeBySetOptions(page);
    await moveOnAtom(page, 'C', 1);
    await deleteByKeyboard(page);
    await moveOnAtom(page, 'C', 4);
    await keyboardPressOnCanvas(page, 'n');
    await takeEditorScreenshot(page);
  });

  test('Verify that editing-related hotkeys (e.g., adding or modifying elements) are disabled in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Eiting-related hotkeys (e.g., adding or modifying elements) are disabled in view-only mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await moveOnAtom(page, 'C', 1);
    await deleteByKeyboard(page);
    await moveOnAtom(page, 'C', 4);
    await keyboardPressOnCanvas(page, 'n');
    await takeEditorScreenshot(page);
  });

  test('Verify zoom functionality in view-only mode', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: ZoomIn and ZoomOut works as expected.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('350');
    await takeEditorScreenshot(page);
  });

  test('Verify that the right-click context menu is fully blocked in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: The right-click context menu is fully blocked in view-only mode
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
    await enableViewOnlyModeBySetOptions(page);
    const point1 = await getAtomByIndex(page, { label: 'C' }, 1);
    await ContextMenu(page, point1).open();
    await takeEditorScreenshot(page);
  });

  test('Verify that the rotation tool is fully blocked in view-only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: When we select structure there is no rotation tool above.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
    await enableViewOnlyModeBySetOptions(page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that in view-only mode, when user clicks and holds on an atom for several seconds, atoms edit window does not appear', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: In view-only mode, when user clicks and holds on an atom for several seconds, atom's edit window does not appear.
    */
    const timeout = 2000;
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveOnAtom(page, 'C', 1);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await enableViewOnlyModeBySetOptions(page);
    await moveOnAtom(page, 'C', 1);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await takeEditorScreenshot(page);
  });

  test('Check that when view mode is triggered tool should reset to selection', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: When view mode is triggered tool reset to selection (from Fragment to Rectangle).
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await takeLeftToolbarScreenshot(page);
    await enableViewOnlyModeBySetOptions(page);
    await takeLeftToolbarScreenshot(page);
  });

  test('Check that after disabling View Only mode, it’s possible to select all structures and move them together to a new place on the canvas', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: After disabling View Only mode, it’s possible to select all structures and move them together to a new place on the canvas.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await disableViewOnlyModeBySetOptions(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await moveOnAtom(page, 'C', 1);
    await dragMouseTo(300, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Check saving in KET format in View only mode', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Structure saved and opened from KET.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await verifyFileExport(
      page,
      'KET/benzene-ring-saved-in-view-only-mode-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-ring-saved-in-view-only-mode-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Check saving in MOL V2000 format in View only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Structure saved and opened from MOL V2000.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await verifyFileExport(
      page,
      'Molfiles-V2000/benzene-ring-saved-in-view-only-mode-molv2000-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/benzene-ring-saved-in-view-only-mode-molv2000-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Check saving in MOL V3000 format in View only mode', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4965
    Description: Structure saved and opened from MOL V3000.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/benzene-ring-saved-in-view-only-mode-molv3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/benzene-ring-saved-in-view-only-mode-molv3000-expected.mol',
    );
    await takeEditorScreenshot(page);
  });
});
