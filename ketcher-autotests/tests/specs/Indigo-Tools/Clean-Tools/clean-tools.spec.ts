import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  takeTopToolbarScreenshot,
  moveOnBond,
  BondType,
  dragMouseTo,
  clickOnAtom,
  selectPartOfChain,
  selectPartOfMolecules,
  MolFileFormat,
} from '@utils';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clean Up button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1776
    Description: 'Clean Up' button is always active and presents in top toolbar panel.
    */
    await takeTopToolbarScreenshot(page);
  });
});

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clean bonds lenght', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1778
    Description: The length of the bonds becomes the same
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/different-bond-length.mol',
    );

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean bonds angles', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1779
    Description: The angles should be 60, 90 or 120°
    (all angles in each structure are equal after the clean action)
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V3000/different-angle-fr.mol');
    await clickInTheMiddleOfTheScreen(page);

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Cleaned structure is placed horizontally', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1781
    Description: After the Layout action the structure moves to the upper left corner of the canvas.
    The structure is placed horizontally.
    During the Layout action structure is rotated 90° counterclockwise.
    After the Clean Up action the structure does not change.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/four-bonds.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean distorted molecule with Layout tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1782
    Description: After the Layout action the structures are aligned to the upper
    left corner of the canvas.
    The structure group of structures appears undistorted.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/layout-distorted.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean distorted molecule with Clean Up tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1785
    Description: After the 'Clean Up' action the structures don't change its position on the canvas.
    The group of structures is cleaned up and appear undistorted.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/layout-distorted.mol');

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Queries structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1786
    Description: After the Layout and Clean Up actions the structure features appear undistorted.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/clean-structure.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up action on a structures with Attachment point', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1787
    Description: Clean action is correct for the all selected structures.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/clean-appoints.mol');

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Multiple undo', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1788
    Description: Multiple Undo/Redo actions are correct after the Clean Up action.
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-structures.mol',
    );

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Structure with Stereochemistry', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1789
    Description: After the Clean Up and Layout actions the structure
    with stereochemistry is appear undistorted.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/clean-stereo.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Structure with R-Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1794
    Description: Structures with R-group are cleaned correctly.
    R-group labels are kept.
    R-group definition is correct.
    R-group member's properties aren't changed.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/clean-rgroups.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Structure with S-Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1795
    Description: S-group brackets aren't moved away from the structure after the
    Clean Up and Layout actions.
    S-group properties are correct after the Clean Up and Layout actions.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/clean-sgroups.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Structure with Stereolabels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1796
    Description: The cleaned structure has the correct abs/or1/&1 stereolabels.
    The Clean Up action is applied correctly and simultaneously
    to the whole structure with stereolabels.
   */
    await openFileAndAddToCanvas(page, 'KET/stereolabels.ket');

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Structure with Mapping', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1797
    Description: The reaction mapping is kept after the Layout and Clean Up action.
   */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/mapping-reaction.rxn');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Layout cyclic structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1803
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/cyclic-structures.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Layout several structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1805
    Description: The Layout action is implemented for the whole canvas.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/several-structures.mol');

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up part of chain structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1802
    Description: 'Clean Up' action works for the selected part.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/ditorted-chain-with-double-bond.mol',
    );
    await selectPartOfChain(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up cyclic structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1804
    Description: Clean action is correct for the selected part.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-cyclic-structure.mol',
    );
    await selectPartOfChain(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up action on part of structure of R-Group member', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1814
    Description: Clean action is correct for the selected part.
    Non-selected part is invariable.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-r-group-structure.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Sprout bonds to the structure after Clean Up', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1825
    Description: User is able to change the structure: sprout the bonds, change the atom symbols, 
    change the atoms/bonds properties after the Clean Up action.
    */
    const x = 300;
    const y = 300;
    const anyAtom = 0;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/toluene.mol');
    await IndigoFunctionsToolbar(page).cleanUp();
    await moveOnBond(page, BondType.SINGLE, 0);
    await dragMouseTo(x, y, page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up action on part of structure with Stereobonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1822
    Description: Clean action is correct for the selected part.
    Non-selected part is invariable.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-stereobonds.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Not layout rings as circles', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1824
    Description: 
    Layout:
    The action is implemented for the whole canvas.
    Clean Up:
    Clean action is correct for the whole part.
    Undo/Redo actions are correct. 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/big-rings.mol');
    await IndigoFunctionsToolbar(page).cleanUp();
    await CommonTopLeftToolbar(page).undo();
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up action on part of structure with R-Group label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2876
    Description: Clean action is correct for the selected R-Group label.
    Non-selected part is invariable.
    */
    const anyRGroupLabel = 'R18';
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-r-group-structure.mol',
    );
    await page.getByText(anyRGroupLabel).click();
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean reaction with Clean Up tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2877
    Description: After Clean Up action structures are undistorted. 
    Position of the reaction does not change.
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/distorted-reaction.rxn');
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean Up several structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2879
    Description: Clean action is correct for the selected part.
    Non-selected part is invariable.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/several-distorted-structures.mol',
    );
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Clean action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1738
    Description: The structure are cleaned correctly.
    Edit the structures in any way.
    Distort the created structures.
    Click the Clean Up button.
    Distort the structures.
    Click the Layout button.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-br.mol');

    await verifyFileExport(
      page,
      'Molfiles-V2000/ring-with-attachment.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Clean Up action on part of structure with S-Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2880
    Description: The Clean Up action is implemented for the part of selected structures.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/distorted-Sgroups.mol');
    await selectPartOfMolecules(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test(
    'Clean Up action on part of structure with different properties',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1826
    Description: Clean action is correct for the selected part.
    Non-selected part is invariable.
    Test working incorrect because we have a bug https://github.com/epam/Indigo/issues/388
    */
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/clean-different-properties.mol',
      );
      await selectPartOfMolecules(page);
      await IndigoFunctionsToolbar(page).cleanUp();
      await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
    },
  );
});
