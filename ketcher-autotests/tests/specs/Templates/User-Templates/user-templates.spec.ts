import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  waitForPageInit,
  clickOnAtom,
  getEditorScreenshot,
  clickOnCanvas,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { copyAndPaste, cutAndPaste } from '@utils/canvas/selectSelection';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import {
  TemplateLibraryTab,
  AromaticsTemplate,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function saveToTemplates(page: Page, shouldSave = true) {
  const saveToTemplatesButton = SaveStructureDialog(page).saveToTemplatesButton;

  await CommonTopLeftToolbar(page).saveFile();
  await saveToTemplatesButton.click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill('My Template');
  if (shouldSave) {
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }
}

test.describe('Click User Templates on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open template from the library', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-13158
      Description: open template
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Spaces at the beginning and end of the entered line are truncated', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10073(3)
      Description: spaces in Molecule name field validation
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await clickInTheMiddleOfTheScreen(page);
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill(' name ');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await StructureLibraryDialog(page).setSearchValue('name');
    await takeEditorScreenshot(page);
  });

  test('Delete user template', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-39948
      Description: delete user template validation
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonTopLeftToolbar(page).saveFile();
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('to_delete');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await StructureLibraryDialog(page).setSearchValue('to_delete');
    await StructureLibraryDialog(page).deleteMyTemplate();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).setSearchValue('to_delete');
    await takeEditorScreenshot(page);
  });

  test('Create Template with Simple Objects', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2941
    Description: Creating Template with Simple Objects validation
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/create-template-with-simple-objects.mol',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('simple_object_template');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await StructureLibraryDialog(page).setSearchValue('simple_object_template');
    await takeEditorScreenshot(page);
  });

  test('Create Template with with Reaction arrow', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12942
    Description: Creating Template with Reaction arrow validation.
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/create-template-with-reaction-arrow.rxn',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('reaction_arrow_template');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await CommonTopLeftToolbar(page).clearCanvas();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await StructureLibraryDialog(page).setSearchValue(
      'reaction_arrow_template',
    );
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste action with templates', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13158(3)
    Description: Template is copied and pasted as expected.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste action with expanded functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13158(4)
    Description: Template is cut and pasted as expected.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });
});

// These two tests affect other tests or by other tests, so they were moved to a separate describe group
test.describe('Create and Save Templates', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('User Templates - Create Template - UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-13158(2)
      Description: create and save complex template
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C12(C(C3CN4CN5C6(CCN78CCC(C9CCCN9)C7CNN68)CCC5C4N3)CC3N1NCC3)CCCN2',
    );
    await clickInTheMiddleOfTheScreen(page);
    await saveToTemplates(page);

    await CommonTopLeftToolbar(page).clearCanvas();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await page.getByText('0NNNNHNHNNHNNHNH').click();
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create Template - saving', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1722
      Description: saving user template validation
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await clickInTheMiddleOfTheScreen(page);
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await IndigoFunctionsToolbar(page).cleanUp();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await page.getByText('user_template_1').click();
    await takeEditorScreenshot(page);
  });

  test('Attach created template to atom of structure on canvas', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1729
      Description: Template attached to structure on canvas.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/long-structure.mol');
    await saveToTemplates(page);

    await CommonTopLeftToolbar(page).clearCanvas();
    await drawBenzeneRing(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await page.getByText('My Template').click();
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });
});

test.describe('Templates field lenght validations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check a warning message about localStorage to template window', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11852
      Description: warning message validation
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await page.getByRole('button', { name: 'Save to Templates' }).click();
    await getEditorScreenshot(page);
  });

  test('Molecule Name field length validation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10073(1)
      Description: no mote than 128 symbols error validation
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();

    const tooLongValueLength = 130;
    await page
      .getByPlaceholder('template')
      .fill('a'.repeat(tooLongValueLength));
    await getEditorScreenshot(page);
  });

  test('Empty Molecule name field validation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10073(2)
      Description: empty field validation
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('name');
    await page.getByPlaceholder('template').fill('');
    await getEditorScreenshot(page);
  });

  test('Check a warning message about unique name', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-39948
      Description: warning message validation
    */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await CommonTopLeftToolbar(page).saveFile();
    await saveToTemplatesButton.click();
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
    await getEditorScreenshot(page);
  });

  test('Check scrollbar in the structure field is present for long structures', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1721
      Description: The scrollbar in the structure field is present.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/long-structure.mol');
    await saveToTemplates(page, false);
    await getEditorScreenshot(page);
  });
});
