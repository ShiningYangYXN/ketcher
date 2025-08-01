import { test } from '@playwright/test';
import {
  clickOnCanvas,
  deleteByKeyboard,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

test.describe('Select all', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Select all using hot-key - 1/4 move', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1337(1)
        Description: All objects on the canvas are selected
 */

    const offset = 100;
    const commonLeftToolbar = CommonLeftToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-structures.mol');
    await selectAllStructuresOnCanvas(page);
    await commonLeftToolbar.selectHandTool();
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x + offset, y + offset, page);
    await takeEditorScreenshot(page);
  });

  test('Select all using hot-key - 2/4 cut and paste', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1337(2)
        Description: All objects on the canvas are selected
    */
    const offset = 100;

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-structures.mol');
    await selectAllStructuresOnCanvas(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, offset, offset);
    await takeEditorScreenshot(page);
  });

  test('Select all using hot-key - 3/4 copy and paste', async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1337(3)
          Description: All objects on the canvas are selected
        */
    const offset = 100;

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-structures.mol');
    await selectAllStructuresOnCanvas(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, offset, offset);
    await takeEditorScreenshot(page);
  });

  test('Select all using hot-key - 4/4 delete', async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1337(4)
          Description: All objects on the canvas are selected
        */
    const commonLeftToolbar = CommonLeftToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-structures.mol');
    await selectAllStructuresOnCanvas(page);
    await commonLeftToolbar.selectHandTool();
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });
});
