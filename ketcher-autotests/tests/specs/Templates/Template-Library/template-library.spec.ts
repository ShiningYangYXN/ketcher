import { Page, test, expect } from '@playwright/test';
import {
  BottomToolbar,
  openStructureLibrary,
} from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  deleteByKeyboard,
  FunctionalGroups,
  getCoordinatesOfTheMiddleOfTheScreen,
  getEditorScreenshot,
  selectFunctionalGroups,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { editStructureTemplate, openFunctionalGroup } from '@utils/templates';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  LabelDisplayAtStereogenicCentersOption,
  StereochemistrySetting,
} from '@tests/pages/constants/settingsDialog/Constants';

async function placePhenylalanineMustard(page: Page, x: number, y: number) {
  await BottomToolbar(page).StructureLibrary();
  const phenylalanineLocator = page.locator(
    `div[title*="Phenylalanine mustard"] > div`,
  );
  if ((await phenylalanineLocator.count()) === 0) {
    await page.getByText('Aromatics').click();
  }
  await waitForRender(page, async () => {
    await phenylalanineLocator.first().click();
    await clickOnCanvas(page, x, y);
  });
}

async function editAndClearTemplateName(
  page: Page,
  templateCategory: string,
  templateName: string,
) {
  await editStructureTemplate(page, templateCategory, templateName);
  await page.getByTestId('name-input').click();
  await selectAllStructuresOnCanvas(page);
  await deleteByKeyboard(page);
}

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    // Phenylalanine mustard was chosen, because it has chiral flag 0, which allows us
    // to test ignoreChiralFlag, which has an effect on the structure only in this case
    const offsetX = 300;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    // Using "On" label style, to always show the stereo labels, so we can see the difference
    await setSettingsOption(
      page,
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
      LabelDisplayAtStereogenicCentersOption.On,
    );

    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await placePhenylalanineMustard(page, x - offsetX, y);

    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await placePhenylalanineMustard(page, x + offsetX, y);
    await takeEditorScreenshot(page);
  });

  test('Structure Library UI', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Overview Templates Library structure
    await openStructureLibrary(page);
    await takeEditorScreenshot(page);
  });

  test('Open Structure Library tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Verify Structure LIbrary tooltip
    const { structureLibraryButton } = BottomToolbar(page);
    await expect(structureLibraryButton).toHaveAttribute(
      'title',
      'Structure Library (Shift+T)',
    );
    await takeEditorScreenshot(page);
  });

  test('Template Library', async ({ page }) => {
    // Test case: EPMLSOPKET-4266
    // Verify correct display of Template Library
    const deltaX = 0;
    const deltaY = 220;
    const anyX = 638;
    const anyY = 524;
    await openStructureLibrary(page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.mouse.move(anyX, anyY);
      await page.mouse.wheel(deltaX, deltaY);
    });
    await takeEditorScreenshot(page);
  });

  test('Functional groups tab', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Verify Functional Group tab
    await openFunctionalGroup(page);
    await takeEditorScreenshot(page);
  });

  test('Functional groups - adding structure', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Add structure from Functional Group into canvas
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Edit templates - name with just spaces', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify if structure name won't change if field will contain just spaces
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await page.getByTestId('name-input').fill('   ');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByText('β-D-Sugars').click();
    await takeEditorScreenshot(page);
  });
});

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Edit templates', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify correct display of Template Edit window
    await editStructureTemplate(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await getEditorScreenshot(page);
  });

  test('Edit templates - name field with no character', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify validation if name field not contain any characters
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await getEditorScreenshot(page);
  });

  test('Text field 128 characters limit test ', async ({ page }) => {
    // Verify maximum character validation on the name field
    const textField = page.getByTestId('name-input');
    const number = 129;
    const inputText = 'A'.repeat(number);
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await waitForRender(page, async () => {
      await textField.type(inputText);
    });
    await getEditorScreenshot(page);
  });
});
