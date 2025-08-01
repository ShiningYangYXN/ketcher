/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  pressButton,
  doubleClickOnAtom,
  moveOnAtom,
  clickOnAtom,
  waitForPageInit,
  waitForRender,
  waitForAtomPropsModal,
  clickOnCanvas,
  MolFileFormat,
  RxnFileFormat,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import {
  copyAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';

import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { selectElementFromExtendedTable } from './utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { selectElementsFromPeriodicTable } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import {
  PeriodicTableElement,
  TypeChoice,
} from '@tests/pages/constants/periodicTableDialog/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  AromaticityOption,
  ConnectivityOption,
  HCountOption,
  ImplicitHCountOption,
  MicroAtomOption,
  QueryAtomOption,
  RingBondCountOption,
  RingMembershipOption,
  RingSizeOption,
  SubstitutionCountOption,
  UnsaturatedOption,
} from '@tests/pages/constants/contextMenu/Constants';
import {
  AtomType,
  HCount,
  Inversion,
  Radical,
  RingBondCount,
  SubstitutionCount,
  Valence,
} from '@tests/pages/constants/atomProperties/Constants';

const CANVAS_CLICK_X = 200;
const CANVAS_CLICK_Y = 200;

test.describe('Atom Properties', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check Atom Properties modal window by double click on atom', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1592
      Description: The 'Atom Properties' dialog is opened, it contains the menu:
      'General' tab (opened by default) with:
      Label type-in field, filled with the data for the clicked atom;
      information 'Number' field with a number of atoms in the Periodic table, filled with the data for the clicked atom;
      Alias type-in field;
      Charge type-in field;
      Isotope type-in field;
      Valence drop-down list (with the following values: blank, I, II, III, IV, V, VI, VII, VIII);
      Radical drop-down list (with the following values: blank, Monoradical, Diradical (singlet), Diradical (triplet)).
      'Query specific' tab with:
      'Ring bond count' drop-down list (with the following values: blank, 0, 2, 3, 4);
      'H count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4);
      'Substitution count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4, 5, 6).
      checkbox 'Unsaturated';
      'Cancel', 'Apply' and 'X' buttons;
      The 'Atom Properties' header.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'N', 0);
    await waitForAtomPropsModal(page);
    await takeEditorScreenshot(page);
  });

  test('Check Atom Properties modal window by hovering and press hotkey /', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1592
      Description: The 'Atom Properties' dialog is opened, it contains the menu:
      'General' tab (opened by default) with:
      Label type-in field, filled with the data for the clicked atom;
      information 'Number' field with a number of atoms in the Periodic table, filled with the data for the clicked atom;
      Alias type-in field;
      Charge type-in field;
      Isotope type-in field;
      Valence drop-down list (with the following values: blank, I, II, III, IV, V, VI, VII, VIII);
      Radical drop-down list (with the following values: blank, Monoradical, Diradical (singlet), Diradical (triplet)).
      'Query specific' tab with:
      'Ring bond count' drop-down list (with the following values: blank, 0, 2, 3, 4);
      'H count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4);
      'Substitution count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4, 5, 6).
      checkbox 'Unsaturated';
      'Cancel', 'Apply' and 'X' buttons;
      The 'Atom Properties' header.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await moveOnAtom(page, 'O', 0);
    await waitForRender(page, async () => {
      await page.keyboard.press('/');
    });
    await takeEditorScreenshot(page);
  });

  test('Change Atom Label on structure and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: The 'Label' field contains the correct typed atom symbol.
      The selected carbon atom isn`t changed with 'Na' atom symbol.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).fillLabel('Na');
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Change Atom Label on structure and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: The 'Label' field contains the correct typed atom symbol.
      The selected carbon atom is changed with 'Sb' atom symbol.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Sb' },
    });
    await takeEditorScreenshot(page);
  });

  test('Change Atom Label on structure to incorrect', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: In the opened dialog the 'Label' field contains 'N'.
      The 'Label' field has a red frame. The 'Error: Wrong label' tooltip appears
      when the cursor is over the field. The Apply button becomes disabled.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'N', 0);

    await page.getByLabel('Label').fill('J%');
    await takeEditorScreenshot(page);
  });

  test('Change Atom Label on structure to incorrect and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: In the opened dialog the 'Label' field contains 'N'.
      The 'Label' field has a red frame. The 'Error: Wrong label' tooltip appears
      when the cursor is over the field. The Apply button becomes disabled.
      The 'N' atom symbol isn`t changed with an incorrect symbol.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'N', 0);

    await AtomPropertiesDialog(page).fillLabel('J%');
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Typing atom symbols - single selected atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The appeared symbol is colored with the same color as in the Periodic Table.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await doubleClickOnAtom(page, 'C', 1);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'N' },
    });

    await doubleClickOnAtom(page, 'C', anyAtom);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'O' },
    });

    await doubleClickOnAtom(page, 'C', secondAnyAtom);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Cl' },
    });
    await takeEditorScreenshot(page);
  });

  test('Open saved structure and edit atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The saved *.mol file is opened and can be edited.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-three-atoms.mol',
    );

    await doubleClickOnAtom(page, 'N', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Br' },
    });

    await doubleClickOnAtom(page, 'O', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'F' },
    });

    await doubleClickOnAtom(page, 'Cl', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Zn' },
    });
    await takeEditorScreenshot(page);
  });

  test('Save the structure as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-three-atoms.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/benzene-with-three-atoms-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Typing atom symbols - several selected atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1595
      Description: The appeared symbol is colored with the same color as in the Periodic Table.
    */
    const atomToolbar = RightToolbar(page);

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await selectAllStructuresOnCanvas(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await takeEditorScreenshot(page);
  });

  test('Typing atom symbols - atoms of different structures', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1596
      Description: The appeared symbol is colored with the same color as in Periodic Table and added to two different rings.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
    );
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'O', 0);

    await clickOnAtom(page, 'C', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Zn' },
    });
    await takeEditorScreenshot(page);
  });

  test('Save two structures the structure as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1596
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/benzene-and-cyclopentadiene-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Change Atom Alias on structure and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: The 'Alias' field in 'Atom Properties' dialog is empty by default.
      The 'Alias' field contains the correct typed characters.
      The selected carbon atom does not changed.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).fillAlias('abc123TesREasd!@');
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Change Atom Alias on structure and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: In the opened dialog the 'Label' field contains 'C'. The 'Alias' field is empty.
      The 'Alias' field contains the correct typed characters. (for example 'abc123TesREasd!@').
      The selected carbon atom is changed with typed text.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Alias: 'abc123TesREasd!@' },
    });
    await takeEditorScreenshot(page);
  });

  test('Edit Atom Label and Alias on structure and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: In the opened dialog the 'Alias' field contains the correct text (for our example - 'abc123TesREasd!@').
      The 'Label' field is filled with 'C' atom symbol.
      The 'Alias' field contains the correct edited text.
      The correct edited alias 'TesREasd!@' and Label ('Sb' for our example) appears for the edited atom.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-ring-with-alias.mol',
    );

    await doubleClickOnAtom(page, 'C', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Alias: 'TesREasd!@' },
    });
    await takeEditorScreenshot(page);
  });

  test('Dialog - Number of Atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1605
      Description: In the opened dialog the 'Number' field contains the correct text (for our example - Carbon = 6).
      Nitrogen = 7, Oxygen = 8
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await takeEditorScreenshot(page);
    await AtomPropertiesDialog(page).pressCancelButton();

    await doubleClickOnAtom(page, 'N', 0);
    await takeEditorScreenshot(page);
    await AtomPropertiesDialog(page).pressCancelButton();

    await doubleClickOnAtom(page, 'O', 0);
    await takeEditorScreenshot(page);
  });

  test('Dialog - Atom type - List', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3340
      Description: if 'Atom type' is set to 'List' then dialog should change:
      - Label and Number should be hided
      - new items "List" (input field) and "edit" icon should be added
      - "Not list (checkbox)" should be added
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).selectAtomType(AtomType.List);
    await takeEditorScreenshot(page);
  });

  test('Dialog - Atom type - Special', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3340
      Description: if 'Atom type' is set to 'Special' then dialog should change:
      - Label and Number should be hidden
      - new item "Special" (input field) and "edit" icon should be added
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).selectAtomType(AtomType.Special);
    await takeEditorScreenshot(page);
  });

  test('Charge of the Atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The 'Charge' field is filled with "0" by default.
      The '+' symbol appears near the selected atom on top-right side.
      The '1' is present in the 'Charge' field.
      The '2+' symbol appears near the selected atom on top-right side.
      The '2' is present in the 'Charge' field.
      The '2-' symbol appears near the selected atom on top-right side.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '1' },
    });
    await takeEditorScreenshot(page);

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '2' },
    });
    await takeEditorScreenshot(page);

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '-2' },
    });
    await takeEditorScreenshot(page);
  });

  test('Type in the Charge field any incorrect data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The 'Charge' field is framed with the red frame.
      The 'Error: Invalid charge value' tooltip appears when the cursor over the field.
      The 'Apply' button becomes disabled.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).fillCharge('A');
    await takeEditorScreenshot(page);
  });

  test('Type in the Charge field number bigger than maximum', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3339
      Description: The range for charge is from -999 to 999
      The 'Charge' field is framed with the red frame.
      The 'Error: Invalid charge value' tooltip appears when the cursor over the field.
      The 'Apply' button becomes disabled.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).fillCharge('9999');
    await AtomPropertiesDialog(page).hoverCharge();
    await takeEditorScreenshot(page);
  });

  test('Save structure with two Charge as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-charge.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/benzene-with-charge-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Change charge on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1607
      Description: The Charge are changed for three atoms (S, F, I).
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'I', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'S', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '3' },
    });
    await takeEditorScreenshot(page);
  });

  test('Typing in Charge for sigle atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1608
      Description: The Charge are changed for three atoms (S, F, I).
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await doubleClickOnAtom(page, 'S', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '1' },
    });

    await doubleClickOnAtom(page, 'F', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '-3' },
    });

    await doubleClickOnAtom(page, 'I', 0);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '5' },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Isotope in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      The 'Isotope' field contains the correct typed value.
      The isotope value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).fillIsotope('18');
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Isotope in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      The 'Isotope' field contains the correct typed value.
      '13' appears near the carbon atom in top-left side.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Isotope: '13' },
    });
    await takeEditorScreenshot(page);
  });

  test('Add incorrect Isotope in modal', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      Field highlight with red and tooltip appears: There must be integer!
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).fillIsotope('b');
    await takeEditorScreenshot(page);
  });

  test('Add incorrect negative Isotope in modal', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3339
      Description: The range for 'Isotope' field is from 0 to 999
      Field highlight with red and tooltip appears: Invalid isotope value!
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).fillIsotope('-88');
    await AtomPropertiesDialog(page).hoverIsotope();
    await takeEditorScreenshot(page);
  });

  test('Save structure with Isotope information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chain-with-isotope.mol');
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-isotope-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Change Isotope value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1616
      Description: The typed isotope value appears near the selected atoms only.Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Isotope: '18' },
    });
    await takeEditorScreenshot(page);
  });

  test('Typing Isotopes in Label Edit modal', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1617
      Description: The 'Isotope' 18O added. Number colored in red as Oxygen atom.
    */
    const timeout = 2000;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await moveOnAtom(page, 'C', 1);
    await page.mouse.down();
    await page.waitForTimeout(timeout);

    await page.getByLabel('Atom').fill('18O');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Typing in isotope - several atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1618
      Description: Only last selected atom is replaced with the typed atom symbol and isotope.
    */
    const timeout = 2000;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');

    await moveOnAtom(page, 'S', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);

    await page.getByLabel('Atom').fill('18S');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Add Valence in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The 'Valence' field is empty by default.
      The 'Valence' drop-down list contains values: blank, 0, I, II, III, IV, V, VI, VII, VIII.
      The 'Valence' field contains the selected value.
      The valence value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).selectValence(Valence.Three);
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Valence in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The 'Valence' field is filled with '0' by default.
      The 'Valence' field contains the correct typed value.
      'III' appears near the carbon atom in right side.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Valence: Valence.Three },
    });
    await takeEditorScreenshot(page);
  });

  test('Save structure with Valence information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chain-with-valence.mol');
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-valence-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Change Valence value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1620
      Description: The typed Valence value appears near the selected atoms only.
      Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Valence: Valence.Five },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Radicals in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The 'Radical' field is empty by default.
      The 'Radical' drop-down list contains parameters: blank, Monoradical, Diradical (singlet), Diradical (triplet).
      The 'Radical' field contains the selected parameter.
      The radical symbol does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).selectRadical(Radical.Monoradical);
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Radical in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The 'Radical' field is empty.
      The 'Radical' field contains the selected parameter.
      The symbol for the selected radical appears above. The selected parameter appears above the selected atom:
      Monoradical - one dot;
      Diradical (singlet) - two dots;
      Diradical (triplet) - two caret signs (^^).
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Radical: Radical.Monoradical },
    });
    await takeEditorScreenshot(page);
  });

  test('Save structure with Radical information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-radicals.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-radicals-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Open the saved *.mol file and edit it', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The saved *.mol file is opened correctly with applied atom properties and can be edited.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-radicals.mol',
    );
    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Radical: Radical.Diradical_Triplet },
    });
    await takeEditorScreenshot(page);
  });

  test('Typing in Radicals - three atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1634
      Description: All selected atoms is replaced with the typed atom symbols and Radicals.
    */
    const timeout = 2000;
    const anyAtom = 2;
    const secondAnyAtom = 4;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await moveOnAtom(page, 'C', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('O.');
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('N:');
    await pressButton(page, 'Apply');

    await moveOnAtom(page, 'C', secondAnyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('F^^');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Add Radicals value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1635
      Description: The typed Valence value appears near the selected atoms only.
      Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Radical: Radical.Diradical_Triplet },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Ring bond count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The 'Ring bond count' drop-down list is present under 'Query specific'.
      The field is empty by default.
      The 'Ring bond count' drop-down list contains values: blank, As drawn, 0, 2, 3, 4 items.
      Blank, As drawn (solely those ring bond attachments that you see),
      0 (no ring bond attachments at the specified position),
      2 (two ring bond attachments - simple ring),
      3 (three ring bond attachments - fused rings),
      4 (at least four ring bond attachments - spiro or higher).
      The 'Ring bond count' field contains the selected value.
      The Ring bond count value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).expandQuerySpecific();
    await AtomPropertiesDialog(page).selectRingBondCount(
      RingBondCount.As_Drawn,
    );
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Ring bond count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: In the opened dialog verify that 'Ring bond count' field is empty.
      The 'Ring bond count' field contains the selected value.
      The selected Ring bond count - rb* - appears below the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.As_Drawn },
    });
    await takeEditorScreenshot(page);
  });

  test('Save structure with Query specific - Ring bond count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-ring-bond-count.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-ring-bond-count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Open the saved *.mol file with Ring bond count and edit it', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The saved *.mol file is opened correctly with applied atom properties and can be edited.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-ring-bond-count.mol',
    );
    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Three },
    });
    await takeEditorScreenshot(page);
  });

  test('Typing the atom symbol with the different atom properties - three atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1637
      Description: Several atoms are selected.
      All selected atoms are replaced with the correct atom symbol with the correct atom properties.
    */
    const timeout = 2000;
    const anyAtom = 2;
    const secondAnyAtom = 4;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await moveOnAtom(page, 'C', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('15s^^2-');
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('209Pb:2+');
    await pressButton(page, 'Apply');

    await moveOnAtom(page, 'C', secondAnyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('22F.3+');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Ring bonds count - Representation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1638
      Description: Ring bond count atom property is displayed as specified from the menu item.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    const thirdAnyAtom = 4;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.As_Drawn },
    });

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Zero },
    });

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Two },
    });

    await doubleClickOnAtom(page, 'C', secondAnyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Three },
    });

    await doubleClickOnAtom(page, 'C', thirdAnyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Four },
    });
    await takeEditorScreenshot(page);
  });

  test('Ring bonds count - Editing and Undo/Redo', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1639
      Description: Ring bond count atom property is displayed as specified from the menu item.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    const thirdAnyAtom = 4;
    const numberOfPress = 2;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.As_Drawn },
    });

    await doubleClickOnAtom(page, 'C', 1);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Zero },
    });

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Two },
    });

    await doubleClickOnAtom(page, 'C', secondAnyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Three },
    });

    await doubleClickOnAtom(page, 'C', thirdAnyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Four },
    });

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Three },
    });

    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Hydrogen count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: 'Atom Properties' dialog is opened. The 'H count' drop-down list is present under
      'Query specific'. The field is empty by default.
      The 'H count' drop-down list contains values: 0, 1, 2, 3, 4.
      The value is selected. The 'H count' field contains the selected value.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).expandQuerySpecific();
    await AtomPropertiesDialog(page).selectHCount(HCount.Zero);
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Hydrogen count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: In the opened dialog the 'H count' field is empty.
      The 'H count' field contains the selected value.
      The selected hydrogen count value (H2) appears below/above the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { HCount: HCount.Two },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Hydrogen count in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The newly selected hydrogen count is assigned to the carbon atom
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { HCount: HCount.Two },
    });

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { HCount: HCount.Four },
    });
    await takeEditorScreenshot(page);
  });

  test('Save structure with Query specific - H count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chain-with-h-count.mol');
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-h-count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Hydrogen count - Representation of blank selection', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1641
      Description: 'Atom Property' dialog is opened.
      Hydrogen count atom property is displayed as specified from the menu item.
      Nothing happens.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { HCount: HCount.Empty },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Substitution count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The Atom Properties dialog is opened.
      The 'Substitution count' drop-down list is present under 'Query specific'. The field is empty by default.
      The 'Substitution count' drop-down list contains values: blank, As drawn, 0, 1,  2, 3, 4, 5, 6.
      The 'Substitution count' field contains the selected value.
      The substitution count does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).expandQuerySpecific();
    await AtomPropertiesDialog(page).selectSubstitutionCount(
      SubstitutionCount.Zero,
    );
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Substitution count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The 'Substitution count' field is empty.
      The 'Substitution count' field contains the selected value.
      The selected substitution count s* appears near the carbon
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Two },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Substitution count in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The newly selected Substitution count is assigned to the carbon atom
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Two },
    });

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Four },
    });
    await takeEditorScreenshot(page);
  });

  test('Save structure with Query specific - Substitution count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-substitution-count.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-substitution-count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Substitution count - Representation of blank selection', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1643
      Description: The atom is selected.
      Number of nonhydrogen substituents is displayed as AtomSymbol(sN) where N depends on the number selected.
      Nothing is changed.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Empty },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Unsaturated in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: The Atom Properties dialog is opened.
      The 'Unsaturated' checkbox is present in the 'Query specific' field. The checkbox is not set by default.
      The unsaturated mark does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).expandQuerySpecific();
    await AtomPropertiesDialog(page).setUnsaturatedCheckbox(true);
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Unsaturated in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: In the opened dialog the 'Unsaturated' checkbox is not set.
      The 'Unsaturated' checkbox is set.
      The 'u' mark appears below the carbon atom.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { UnsaturatedCheckbox: true },
    });
    await takeEditorScreenshot(page);
  });

  test('Add Query specific - Unsaturated in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: The 'Unsaturated' dissapear from structure.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-unsaturated.mol',
    );

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { UnsaturatedCheckbox: false },
    });
    await takeEditorScreenshot(page);
  });

  test('Double click on the selected atom do not create error', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8931
      Description: Modal window opens without errors. All sections are displayed correctly.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Click Single Bond on Atom of Phosphorus', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4730
      Description: Bond attached to atom of Phosphorus.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Phosphorus);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Typing atom symbols - Single selected atom (symbol has two letters)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4222
      Description: "Label Edit" modal is opened, "F" symbol appeared in the "Atom" field.
      "E" symbol appeared in "Atom" field next to "F".
      Selected atom now has "Fe" label.
    */
    const timeout = 2000;
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await moveOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('FE');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Colored atoms set - Mapping reaction', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1661
      Description: Mapping labels are colored with the same color as the colored atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-with-three-colored-atoms.rxn',
    );

    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await takeEditorScreenshot(page);
  });

  test('Colored atoms - Applying of atom properties to colored atoms', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1657
      Description: All possible atom properties are applied to colored atoms. Displayed atom properties have the same color as the atom symbol.
      The selected atoms are copied and pasted to the canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/all-possible-atoms-properties.mol',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });

  test('All atom properties information saved as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1657
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/all-possible-atoms-properties.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/all-possible-atoms-properties-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('All atom properties information saved as *.rxn file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1656
      Description: The structure is saved as *.rxn file.
    */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V3000/all-possible-atoms-properties.rxn',
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/all-possible-atoms-properties-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Add Reaction flags - Inversion (Inverts) in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The 'Inversion' drop-down list contains stereoconfiguration parameters: blank, Inverts, Retains.
      The 'Inversion' field contains the selected value.
      The stereo mark does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', 0);
    await AtomPropertiesDialog(page).expandReactionFlags();
    await AtomPropertiesDialog(page).selectInversion(Inversion.Inverts);
    await AtomPropertiesDialog(page).pressCancelButton();
    await takeEditorScreenshot(page);
  });

  test('Add Reaction flags - Inversion (Inverts) and Exact change in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The selected stereo mark appears near the carbon atom for
      Inverts - .Inv, ext.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).expandReactionFlags();
    await AtomPropertiesDialog(page).selectInversion(Inversion.Inverts);
    await AtomPropertiesDialog(page).setExactChangeCheckbox(true);
    await AtomPropertiesDialog(page).pressApplyButton();
    await takeEditorScreenshot(page);
  });

  test('Add Reaction flags - Inversion (Retains) and Exact change in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The selected stereo mark appears near the carbon atom for
      Retains - .Ret, ext.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        Inversion: Inversion.Retains,
        ExactChangeCheckbox: true,
      },
    });
    await takeEditorScreenshot(page);
  });

  test('Reaction flags information saved as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-rection-flags.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-rection-flags-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Add to canvas - List atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1658
      Description: The different List symbols are present on the canvas.
    */
    await selectElementsFromPeriodicTable(page, TypeChoice.List, [
      PeriodicTableElement.Ru,
      PeriodicTableElement.Mo,
      PeriodicTableElement.W,
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add to canvas - Not List atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1658
      Description: The different Not List symbols are present on the canvas.
    */
    await selectElementsFromPeriodicTable(page, TypeChoice.NotList, [
      PeriodicTableElement.Ru,
      PeriodicTableElement.Mo,
      PeriodicTableElement.W,
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add to canvas - Generic Groups', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1659
      Description: The Generic Group symbol is present on the canvas.
    */
    await selectElementFromExtendedTable(page, 'G', 'Add');
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add to canvas - Generic Groups and click on it', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1659
      Description: The Generic Group symbol is present in Atom Properties modal.
    */
    await selectElementFromExtendedTable(page, 'GH*', 'Add');
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('GH*').first().dblclick();
    await takeEditorScreenshot(page);
  });

  test('"Query properties" section with the contents of the "Query specific" drop-down list inside the "Edit" section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18033
      Description: All options match with the options from the ""Query specific"" drop-down list inside the ""Edit"" section.
    */
    const optionsToClick = [
      QueryAtomOption.RingBondCount,
      QueryAtomOption.HCount,
      QueryAtomOption.SubstitutionCount,
      QueryAtomOption.Unsaturated,
      QueryAtomOption.ImplicitHCount,
      QueryAtomOption.Aromaticity,
      QueryAtomOption.RingMembership,
      QueryAtomOption.RingSize,
      QueryAtomOption.Connectivity,
    ];

    const anyAtom = 2;
    await drawBenzeneRing(page);
    const point = await getAtomByIndex(page, { label: 'C' }, anyAtom);
    await ContextMenu(page, point).hover(MicroAtomOption.QueryProperties);

    for (const option of optionsToClick) {
      await page.getByTestId(option).first().click();
      await takeEditorScreenshot(page);
    }
    await takeEditorScreenshot(page);
  });

  test('The selection of an option inside the "Ring bond count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18034
      Description: All Ring bond count options added to Benzene structure.
    */
    const atomIndices = [2, 4, 5];
    const optionIndices = [
      RingBondCountOption.AsDrawn,
      RingBondCountOption.Three,
      RingBondCountOption.Nine,
    ];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, atomIndices[i]);
      await ContextMenu(page, point).click([
        MicroAtomOption.QueryProperties,
        QueryAtomOption.RingBondCount,
        optionIndices[i],
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test('The selection of an option inside the "H count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18035
      Description: All H count options added to Benzene structure.
    */
    const atomIndices = [2, 4, 5];
    const optionIndices = [
      HCountOption.Zero,
      HCountOption.Three,
      HCountOption.Nine,
    ];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, atomIndices[i]);
      await ContextMenu(page, point).click([
        MicroAtomOption.QueryProperties,
        QueryAtomOption.HCount,
        optionIndices[i],
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test('The selection of an option inside the "Substitution count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18036
      Description: All Substitution count options added to Benzene structure.
    */
    const atomIndices = [2, 4, 5];
    const optionIndices = [
      SubstitutionCountOption.AsDrawn,
      SubstitutionCountOption.Two,
      SubstitutionCountOption.Eight,
    ];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, atomIndices[i]);
      await ContextMenu(page, point).click([
        MicroAtomOption.QueryProperties,
        QueryAtomOption.SubstitutionCount,
        optionIndices[i],
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test('The selection of an option inside the "Unsaturated" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18070
      Description: All Unsaturated options added to Benzene structure.
    */
    const atomIndices = [2, 4];
    const selectedOption = [
      UnsaturatedOption.Unsaturated,
      UnsaturatedOption.Saturated,
    ];

    await openFileAndAddToCanvas(page, 'KET/benzene-unsaturated.ket');

    for (let i = 0; i < atomIndices.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, atomIndices[i]);
      await ContextMenu(page, point).click([
        MicroAtomOption.QueryProperties,
        QueryAtomOption.Unsaturated,
        selectedOption[i],
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test(
    'The selection of an option inside the "Implicit H count" sub-section',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-18067
      Description: All Implicit H count options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
      const atomIndices = [2, 4, 5];
      const optionIndices = [
        ImplicitHCountOption.Zero,
        ImplicitHCountOption.Three,
        ImplicitHCountOption.Nine,
      ];

      await drawBenzeneRing(page);

      for (let i = 0; i < atomIndices.length; i++) {
        const point = await getAtomByIndex(
          page,
          { label: 'C' },
          atomIndices[i],
        );
        await ContextMenu(page, point).click([
          MicroAtomOption.QueryProperties,
          QueryAtomOption.ImplicitHCount,
          optionIndices[i],
        ]);
      }
      await takeEditorScreenshot(page);
    },
  );

  test('The selection of an option inside the "Aromaticity" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18068
      Description: All Aromaticity options added to Benzene structure.
    */
    const atomIndices = [2, 4];
    const selectedOption = [
      AromaticityOption.Aromatic,
      AromaticityOption.Aliphatic,
    ];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, atomIndices[i]);
      await ContextMenu(page, point).click([
        MicroAtomOption.QueryProperties,
        QueryAtomOption.Aromaticity,
        selectedOption[i],
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test(
    'The selection of an option inside the "Ring membership" sub-section',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-18069
      Description: All Ring membership options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
      const atomIndices = [2, 4, 5];
      const optionIndices = [
        RingMembershipOption.Zero,
        RingMembershipOption.Three,
        RingMembershipOption.Nine,
      ];

      await drawBenzeneRing(page);

      for (let i = 0; i < atomIndices.length; i++) {
        const point = await getAtomByIndex(
          page,
          { label: 'C' },
          atomIndices[i],
        );
        await ContextMenu(page, point).click([
          MicroAtomOption.QueryProperties,
          QueryAtomOption.RingMembership,
          optionIndices[i],
        ]);
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    'The selection of an option inside the "Ring size" sub-section',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-18071
      Description: All Ring size options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
      const atomIndices = [2, 4, 5];
      const optionIndices = [
        RingSizeOption.Zero,
        RingSizeOption.Three,
        RingSizeOption.Nine,
      ];

      await drawBenzeneRing(page);

      for (let i = 0; i < atomIndices.length; i++) {
        const point = await getAtomByIndex(
          page,
          { label: 'C' },
          atomIndices[i],
        );
        await ContextMenu(page, point).click([
          MicroAtomOption.QueryProperties,
          QueryAtomOption.RingSize,
          optionIndices[i],
        ]);
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    'The selection of an option inside the "Connectivity" sub-section',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-18075
      Description: All Connectivity options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
      // eslint-disable-next-line no-magic-numbers
      const atomIndices = [2, 4, 5];
      // eslint-disable-next-line no-magic-numbers
      const optionIndices = [
        ConnectivityOption.Zero,
        ConnectivityOption.Three,
        ConnectivityOption.Nine,
      ];

      await drawBenzeneRing(page);

      for (let i = 0; i < atomIndices.length; i++) {
        const point = await getAtomByIndex(
          page,
          { label: 'C' },
          atomIndices[i],
        );
        await ContextMenu(page, point).click([
          MicroAtomOption.QueryProperties,
          QueryAtomOption.Connectivity,
          optionIndices[i],
        ]);
      }
      await takeEditorScreenshot(page);
    },
  );

  test('Combination of different options from different sub-sections inside the "Query properties"', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18038
      Description: All combinations options added to Benzene structure.
    */
    const optionIndex = [
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.RingBondCount,
        RingBondCountOption.Zero,
      ],
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.HCount,
        HCountOption.Two,
      ],
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.SubstitutionCount,
        SubstitutionCountOption.Three,
      ],
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.Unsaturated,
        UnsaturatedOption.Unsaturated,
      ],
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.ImplicitHCount,
        ImplicitHCountOption.Seven,
      ],
      [
        MicroAtomOption.QueryProperties,
        QueryAtomOption.Aromaticity,
        AromaticityOption.Aliphatic,
      ],
    ];

    await drawBenzeneRing(page);

    for (let i = 0; i < optionIndex.length; i++) {
      const point = await getAtomByIndex(page, { label: 'C' }, i);
      await ContextMenu(page, point).click(optionIndex[i]);
    }
    await takeEditorScreenshot(page);
  });
});
