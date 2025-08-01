/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  takeTopToolbarScreenshot,
  waitForRender,
  dragMouseAndMoveTo,
} from '@utils';
import { miewApplyButtonIsEnabled } from '@utils/common/loaders/waitForMiewApplyButtonIsEnabled';
import { getKet } from '@utils/formats';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { MiewDialog } from '@tests/pages/molecules/canvas/MiewDialog';

async function open3DViewer(page: Page, waitForButtonIsEnabled = true) {
  await IndigoFunctionsToolbar(page).ThreeDViewer();
  if (waitForButtonIsEnabled) {
    await miewApplyButtonIsEnabled(page);
  }
}

test.describe('3D Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('3D Rotation of the simple structure without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1934
    Description: 3D window is opened. Benzene is drawn in it.
    The structure is spinned.
    Position of structure on the canvas is not changed. 
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, 20);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressCancelButton();
    });
    await takeEditorScreenshot(page);
  });

  test('Structure with Heteroatoms without Save Position', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1936
    Description: 3D window is opened.
    3D window is opened. Benzene with heteroatom is drawn in it. 
    Position of the structure on the canvas isn't changed. 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-br.mol');
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, -20);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressCancelButton();
    });
    await takeEditorScreenshot(page);
  });

  test('Structure with a Stereobonds without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1942
    Description: 3D window is opened. Benzene with all stereo bonds is drawn in it.
    The structure isn't changed.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-stereo.mol');
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, -20);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressCancelButton();
    });
    await takeEditorScreenshot(page);
  });

  test('Structure with Aromatic Bonds without Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1943
    Description: 3D window is opened. The structure with a circle inside the cycle is displayed in the window. 
    The structure isn't changed.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-aromatic-bonds.mol',
    );
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, -20);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressCancelButton();
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('3D Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1931
    Description: '3D Viewer' button is present on the main toolbar.
    */
    await takeTopToolbarScreenshot(page);
  });

  test('Empty canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1932
    Description: 3D Viewer window is opened. There is no structure in the opened  window.
    */
    await open3DViewer(page, false);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test('One simple structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1933
    Description: A structure (e.g. Benzene) is created on the canvas.
    3D window is opened. Benzene is drawn in it. 
    */
    // we need remove or block the variable number of frames per second in the lower right corner
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await open3DViewer(page);
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    });
  });

  test('3D Rotation of the simple structure with Save Position', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1935
    Description: 3D window is opened.
    Benzene is drawn in it. The structure is spinned.
    Position of the structure on the canvas is changed. 
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    const initialStructureData = await getKet(page);
    await open3DViewer(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x, y + 75, page);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressApplyButton();
    });

    // Get the structure data after making changes
    const changedStructureData = await getKet(page);

    // Compare the initial and changed structure data
    expect(initialStructureData).not.toEqual(changedStructureData);
  });

  test('Structure with Heteroatoms with Save Position', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15539
    Description: 3D window is opened.
    3D window is opened. Benzene with heteroatom is drawn in it. 
    Position of the structure on the canvas is changed. 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-br.mol');
    const initialStructureData = await getKet(page);
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, 80);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressApplyButton();
    });

    // Get the structure data after making changes
    const changedStructureData = await getKet(page);

    // Compare the initial and changed structure data
    expect(initialStructureData).not.toEqual(changedStructureData);
  });

  test('Structure with a Stereobonds with Save Position', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1942
    Description: 3D window is opened. Benzene with all stereo bonds is drawn in it.
    The structure isn't changed.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-stereo.mol');
    const initialStructureData = await getKet(page);
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, 75);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressApplyButton();
    });

    // Get the structure data after making changes
    const changedStructureData = await getKet(page);

    // Compare the initial and changed structure data
    expect(initialStructureData).not.toEqual(changedStructureData);
  });

  test('Structure with Aromatic Bonds with Save Position', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15541
    Description: 3D window is opened. The structure with a circle inside the cycle is displayed in the window. 
    The structure is changed.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-aromatic-bonds.mol',
    );
    const initialStructureData = await getKet(page);
    await open3DViewer(page);
    await dragMouseAndMoveTo(page, -90);
    await waitForRender(page, async () => {
      await MiewDialog(page).pressApplyButton();
    });

    // Get the structure data after making changes
    const changedStructureData = await getKet(page);

    // Compare the initial and changed structure data
    expect(initialStructureData).not.toEqual(changedStructureData);
  });
});
