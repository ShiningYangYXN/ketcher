import { test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  takeTopToolbarScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  takeRightToolbarScreenshot,
  clickOnAtom,
  waitForIndigoToLoad,
  keyboardPressOnCanvas,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { FunctionalGroupsTabItems } from '@tests/pages/constants/structureLibraryDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Toolbar palette: full screen verification', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1331
     * Description:  Toolbar - Toolbar palette: full screen verification
     */
    await takeLeftToolbarScreenshot(page);
  });

  test('Help: UI Verification', async ({ page }) => {
    /*
     * Test case: Test case: EPMLSOPKET-1328
     * Description: Help button tooltip verification
     */
    await CommonTopRightToolbar(page).helpButton.hover();
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Menu bar: UI Verification', async ({ page }) => {
    /*
     * Test case: Test case: EPMLSOPKET-1330
     * Description: Menu bar buttons verification
     */
    await takeTopToolbarScreenshot(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Bn,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeTopToolbarScreenshot(page);
    await resetCurrentTool(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeTopToolbarScreenshot(page);
  });

  test('Toolbar palette: minimized screen verification', async ({ page }) => {
    /*
     * Test case: Test case: EPMLSOPKET-1332
     * Description: Toolbar palette in minimized screen verification
     */

    await page.setViewportSize({ width: 600, height: 800 });
    await takeLeftToolbarScreenshot(page);
  });

  test(
    'Toolbar: hiding items',
    {
      tag: ['@FlakyTest'],
    },
    async ({ page }) => {
      /*
       * Test case: Test case: EPMLSOPKET-3946
       * Description: Hiding item from the toolbar
       */

      await page.goto('/?hiddenControls=clear');

      // Wait for the page to load
      await waitForIndigoToLoad(page);

      await takeTopToolbarScreenshot(page);
    },
  );

  test('Toolbars on the right and bottom: visible when zoomed in', async ({
    page,
    browser,
  }) => {
    /*
     * Test case: for issue #3094
     * Description: Toolbars (right one and bottom) were not visible if browser zoomed in
     */
    await browser.newContext({ deviceScaleFactor: 1.25 });
    await waitForPageInit(page);
    await page.setViewportSize({ width: 560, height: 380 });
    await expect(page).toHaveScreenshot();
  });

  test('The scroll row button of the right toolbar works correctly when Resolution is set to less than 600x600', async ({
    page,
    browser,
  }) => {
    /*
     * Test case: EPMLSOPKET - 4732
     * Description: After clicking on the down row button on the right toolbar to scroll -> the tools should be scrolled to down
     */
    await browser.newContext({ deviceScaleFactor: 1.25 });
    await waitForPageInit(page);
    await page.setViewportSize({ width: 500, height: 500 });
    await page
      .getByTestId('right-toolbar')
      .getByRole('button', { name: '▼' })
      .click();
    await takeRightToolbarScreenshot(page);
  });

  test('Keyboard shortcut not change current tool if cursor is over an atom', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET - 5257
     * Description:
     * Iodine tool is applied
     * Single bond tool kept selected and applied on further mouse clicks
     */
    const anyAtom = 2;
    const secondAtom = 4;
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', anyAtom);
    await keyboardPressOnCanvas(page, 'n');
    await clickOnAtom(page, 'C', secondAtom);
  });

  test('Highlight currently selected tool with mouse cursor and toolbox icons', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET - 5258
     * Description:
     * Atom tool icon 'F' is highlighted in the right-hand panel
     */
    const atomToolbar = RightToolbar(page);
    await atomToolbar.clickAtom(Atom.Fluorine);
    await takeRightToolbarScreenshot(page);
  });

  test('Check top toolbar icons', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET - 15545, EPMLSOPKET - 4229
     * Description:
     * Top toolbar according to mockup design.
     */
    await takeTopToolbarScreenshot(page);
  });

  test('[Shift+Tab] Switches Selection Mode', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET - 18057
     * Description:
     * Shortcut should switch modes of the selection tool (lasso, rectangle, structure selection)
     */

    const repeats = 2;

    for (let i = 0; i < repeats; i++) {
      await page.keyboard.press('Shift+Tab');
      await takeLeftToolbarScreenshot(page);
    }
  });

  test('Verify Aromatize and Dearomatize icons', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET - 16942, EPMLSOPKET - 16943
     * Description:
     * Aromatize and Dearomatize icons are on top toolbar and can make Aromatize and Dearomatize actions
     */
    await takeTopToolbarScreenshot(page);
    await drawBenzeneRing(page);
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
  });

  test('Verify Add/Remove explicit hidrogens icon', async ({ page }) => {
    /*
     * Description:
     * show/hide explicit hidrogens icon are on top toolbar and can make actions
     */
    await takeTopToolbarScreenshot(page);
    await drawBenzeneRing(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
  });
});
