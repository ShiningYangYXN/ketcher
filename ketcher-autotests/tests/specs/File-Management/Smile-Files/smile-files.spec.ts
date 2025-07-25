import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

async function getPreviewForSmiles(
  page: Page,
  smileType: MoleculesFileFormatType,
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(smileType);
  const previewInput = await SaveStructureDialog(page).getTextAreaValue();
  expect(previewInput).not.toBe('');
}

async function clearCanvasAndPasteSmiles(page: Page, smiles: string) {
  await pressButton(page, 'Cancel');
  await CommonTopLeftToolbar(page).clearCanvas();

  await pasteFromClipboardAndAddToCanvas(page, smiles);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('SMILES files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('SmileString for structure with Bond properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1906
    Description: SmileString is correctly generated from structure and vise
    versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas(page, 'KET/all-type-bonds.ket');
    await verifyFileExport(
      page,
      'SMILES/smiles-all-bonds-expected.smi',
      FileType.SMILES,
    );

    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCCC/CC/C:CC.C(C)CCCCCCCCCC');
    await takeEditorScreenshot(page);
  });

  test('SmileString for structure with Atom properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1907
    Description: SmileString is correctly generated from structure and
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas(page, 'KET/all-atoms-properties.ket');
    await verifyFileExport(
      page,
      'SMILES/smiles-all-atoms-properties-expected.smi',
      FileType.SMILES,
    );

    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCC[C+][1C]C[CH]CC |^1:3,^3:4,^4:5,rb:8:*|',
    );
    await takeEditorScreenshot(page);
  });

  test('SmileString from mol file that contains abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1908
    Description: <<In Daylight SMILES the structure will be saved without S-groups>>
    warning appears for all types of Sgroup except the multiple Sgroup type.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sec-butyl-abr.mol');
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await page.getByText('Warnings').click();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('SmileString  from mol file that contains Sgroup', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1914
    Description: In Daylight SMILES the structure will be saved without S-groups
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sgroups-diff-symyx.mol');
    await verifyFileExport(
      page,
      'SMILES/sgroups-diff-symyx-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCCCCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC |Sg:gen:16,17,15:,Sg:n:23,24,22:n:ht,SgD:38,37,36:fgfh:dsfsd::: :|',
    );
    await takeEditorScreenshot(page);
  });

  test('SmileString from mol file that contains Heteroatoms', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1915
    Description: SmileString is correctly generated from structure and
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );
    await verifyFileExport(
      page,
      'SMILES/smiles-heteroatoms-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'NOSPFClBrI[H]');
    await takeEditorScreenshot(page);
  });

  // flaky
  test('SmileString from mol file that contains attached data', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1916
    Description: Warning tab: Structure contains query properties of atoms
    and bonds that are not supported in the SMILES. Query properties will not be reflected in the saved file
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/attached-data.mol');
    await verifyFileExport(
      page,
      'SMILES/attached-data-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await page.getByText('Warnings').click();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCC[C@@H](C)[C@@H](C)CC |SgD:4,5:Purity:Purity = 96%::: :|',
    );
    await takeEditorScreenshot(page);
  });

  test('SmileString from V2000 mol file contains abs stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1917
    Description: SmileString is correctly generated from structure and vise versa
    structure is correctly generated from SmileString.
    All stereobonds are displayed as in a mol-file.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/V2000-abs.mol');
    await verifyFileExport(
      page,
      'SMILES/smiles-v2000-abs-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      '[C@]12(OC(C)=O)C[C@H](C)[C@H](OC(CC3C=CC=CC=3)=O)[C@]1([H])[C@H](OC(C)=O)[C@@]1(CC[C@]3([H])C(C)(C)[C@]3([H])C=C(C)C2=O)CO1 |c:39|',
    );
    await takeEditorScreenshot(page);
  });

  // flaky
  test('SmileString from mol file that contains combination of different features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1920
    Description: SmileString is correctly generated from structure and vise versa structure is
    correctly generated from SmileString.
    Structure appears without attached data and brackets, query features,
    Rgroup labels are rendered as R# symbols.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/different-features.mol');
    await verifyFileExport(
      page,
      'SMILES/smiles-different-features-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      'S=CC(F)CCCCC[C@@](CCO)/C=C/[C@@](N)CCC[C]C([13C]CC([C+2]CC(CC%91)CC(C)CCC)CCC)CC%92.[*:2]%92.[*:1]%91 |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2;_R1$,rb:32:*,u:3|',
    );
    await takeEditorScreenshot(page);
  });

  test('SmileString from file that contains Cis/Trans configuration', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1923
    Description: SmileString is correctly generated from structure and vise versa
    structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/cis-trans-cycle.mol');
    await verifyFileExport(
      page,
      'SMILES/smiles-cis-trans-cycle-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
    await takeEditorScreenshot(page);
  });

  test('SmileString from file that contains alias and pseudoatom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1924
    Description: The structure generated from SMILE string is correct,
    pseudoatoms are rendered, alias appears as common atom symbol for which this alias was assigned.
    */
    await openFileAndAddToCanvas(page, 'KET/alias-pseudoatom.ket');
    await verifyFileExport(
      page,
      'SMILES/smiles-alias-pseudoatom-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCC*CC |$;;alias123;;GH*;;$|');
    await takeEditorScreenshot(page);
  });

  test.fail(
    'SmileString from reaction consists of two or more reaction arrows and structures',
    async ({ page }) => {
      /*
       * IMPORTANT: Test fails because we have bug https://github.com/epam/ketcher/issues/5641
       * Test case: EPMLSOPKET-8905
       * Description: Structure is correctly opens from saved files. Keep only first reaction arrow
       * and keep all structures (all intermediate structures should be products and the arrow is replaced by a plus)
       */
      await openFileAndAddToCanvas(page, 'KET/two-arrows-and-plus.ket');
      await verifyFileExport(
        page,
        'SMILES/smiles-two-arrows-and-plus-expected.smi',
        FileType.SMILES,
      );
      await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await clearCanvasAndPasteSmiles(
        page,
        'C1C=CC=CC=1.O>>C1C=CC(C)=CC=1C.C1C=CC(C)=CC=1C',
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Open Daylight SMILES file with reagent above arrow', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12965
    Description: Structure is not distorted. Reagent NH3 located above reaction arrow.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/smiles-benzene-arrow-benzene-reagent-nh3-expected.smi',
      FileType.SMILES,
    );
    await getPreviewForSmiles(page, MoleculesFileFormatType.DaylightSMILES);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'C1C=CC=CC=1>N>C1C=CC=CC=1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open SMILE file with S-Group Properties', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1040
    Description: SMILE file opens and have S-Group Properties
    */
    await openFileAndAddToCanvas(
      page,
      'SMILES/structure-with-s-group-properties.smi',
    );
    await verifyFileExport(
      page,
      'SMILES/structure-with-s-group-properties.smi',
      FileType.SMILES,
    );
    await page.getByText('info2').dblclick();
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCC |SgD:1:atropisomer:info2::::|');
    await takeEditorScreenshot(page);
  });

  test('Stereobond is preserved after pasting a SMILES structure', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1300
    Description: The Single Down stereo bond is on the structure
    */
    await pasteFromClipboardAndAddToCanvas(page, 'C1=C(C)C(=O)C[S@]1=O');
    await takeEditorScreenshot(page);
  });

  test('Single Up, Single Down and Single Up/Down stereobonds is preserved after pasting a SMILES structure', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1300
    Description: The Single Up, Single Down and Single Up/Down  stereo bonds is on the structure
    The test result is not what it should be. The behavior requires further clarification.
    Single Down bond changes to Single Up and two other stereobonds dissapear.
    */
    await pasteFromClipboardAndAddToCanvas(page, 'C1[S@](=O)CC(=O)[C@@]=1C');
    await takeEditorScreenshot(page);
  });

  test('Enhanced stereo labels on atropisomers are not lost when opening saved Extended SMILES', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1257
    Description: Stereo information for bond and atom is kept
    */
    await openFileAndAddToCanvas(
      page,
      'Extended-SMILES/atropoisomer-enhanced-stereo.cxsmi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-chems.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-chems.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-nucleotides.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-nucleotides.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-bases.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-bases.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-sugars.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-sugars.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-peptides.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-peptides.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/unsplit-nucleotides-connected-with-phosphates.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/unsplit-nucleotides-connected-with-phosphates.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to extended SMILE and loaded back
    */
    test.fail();
    // function await getExtendedSmiles but get JSON instead cxsmi file
    // after fixing need to update the screenshot

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await verifyFileExport(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-chems.cxsmi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-chems.cxsmi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with other nucleotides could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with other nucleotides could be saved to extended SMILE and loaded back
    */
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-nucleotides.cxsmi',
      FileType.ExtendedSMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-nucleotides.cxsmi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to extended SMILE and loaded back
    */
    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await verifyFileExport(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-bases.cxsmi',
      FileType.ExtendedSMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Extended-SMILES/unsplit-nucleotides-connected-with-bases.cxsmi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/simple-schema-with-retrosynthetic-arrow.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/simple-schema-with-retrosynthetic-arrow.smi',
    );
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Validate that the schema with retrosynthetic, angel arrows and plus could be saved to SMILE file and loaded back',
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    We have a bug https://github.com/epam/Indigo/issues/2210
    */

      await openFileAndAddToCanvas(
        page,
        'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      );
      await verifyFileExport(
        page,
        'SMILES/schema-with-retrosynthetic-angel-arrows-and-plus.smi',
        FileType.SMILES,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'SMILES/schema-with-retrosynthetic-angel-arrows-and-plus.smi',
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/schema-with-vertical-retrosynthetic-arrow.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/schema-with-vertical-retrosynthetic-arrow.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/schema-with-two-retrosynthetic-arrows.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/schema-with-two-retrosynthetic-arrows.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/schema-with-diagonal-retrosynthetic-arrow.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/schema-with-diagonal-retrosynthetic-arrow.smi',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
    );
    await verifyFileExport(
      page,
      'SMILES/schema-with-reverse-retrosynthetic-arrow-and-pluses.smi',
      FileType.SMILES,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMILES/schema-with-reverse-retrosynthetic-arrow-and-pluses.smi',
    );
    await takeEditorScreenshot(page);
  });
});
