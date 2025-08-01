/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  applyAutoMapMode,
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  moveOnAtom,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
  pasteFromClipboardByKeyboard,
  pressButton,
  resetZoomLevelToDefault,
  screenshotBetweenUndoRedo,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  readFileContent,
  copyContentToClipboard,
  deleteByKeyboard,
} from '@utils';
import { saveToTemplates, selectWithLasso } from '@utils/canvas/tools/helpers';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  clearLocalStorage,
  closeErrorAndInfoModals,
  pageReloadMicro,
} from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  BottomToolbar,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { TemplateLibraryTab } from '@tests/pages/constants/structureLibraryDialog/Constants';

test.describe('Image files', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
  });

  test.afterEach(async ({ context: _ }) => {
    await closeErrorAndInfoModals(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Verify that single image of SVG format can be saved to KET file and load', async () => {
    /**
     * Test case: #4911
     * Description: Single image of SVG format can be saved to KET file and load
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg-demo.svg');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-demo-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-demo-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that single image of PNG format can be saved to KET file and load', async () => {
    /**
     * Test case: #4911
     * Description: Single image of PNG format can be saved to KET file and load
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await takeEditorScreenshot(page);
    await verifyFileExport(page, 'KET/image-png-expected.ket', FileType.KET);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-png-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and load', async () => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and load
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg-demo.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-and-png-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-and-png-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and added to canvas with correct positions and layer levels (last added image is on top)', async () => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and added to canvas
     * with correct positions and layer levels (last added image is on top)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/four-images-svg-and-png.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/four-images-svg-and-png-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/four-images-svg-and-png-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and added to canvas with structures', async () => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and added to canvas with structures
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-with-benzene-ring-and-arrow.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-with-benzene-ring-and-arrow-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-with-benzene-ring-and-arrow-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format with Structure library elements can be saved to KET file and added to canvas', async () => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format with Structure library elements can be saved to KET file and added to canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-elements-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-elements-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format with 30 structure elements can be saved to KET file and added to canvas', async () => {
    test.slow();
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format with 30 structure elements can be saved to KET file and added to canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-80-with-50-structures.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-80-with-50-structures-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-80-with-50-structures-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format can be added from two different KET files saved and opened', async () => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be added from two different KET files saved and opened
     */
    await openFileAndAddToCanvas(page, 'KET/images-png-svg-with-elements.ket');
    await openFileAndAddToCanvas(
      page,
      'KET/images-with-benzene-ring-and-arrow.ket',
      200,
      200,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/two-images-with-many-elements-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/two-images-with-many-elements-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"', async () => {
    /**
     * Test case: #4911
     * Description: Images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"
     */
    const fileContent = await readFileContent('KET/images-png-svg.ket');
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"', async () => {
    /**
     * Test case: #4911
     * Description: Images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"
     */
    const fileContent = await readFileContent('KET/images-png-svg.ket');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are copied from .ket format and added from clipboard directly to selected place on Canvas with correct positions', async () => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are copied from .ket format and added from clipboard directly to selected place on Canvas with correct positions
     */
    const fileContent = await readFileContent('KET/images-png-svg.ket');
    await copyContentToClipboard(page, fileContent);
    await pasteFromClipboardByKeyboard(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) are copied from .cdxml format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) are copied from .cdxml format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"
     * (SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDXML/image-png-svg-together.cdxml',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) are copied from .cdxml format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) are copied from .cdxml format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"
     * (SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDXML/image-png-svg-together.cdxml',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are copied from .cdxml format and added from clipboard directly to selected place on Canvas with correct positions', async () => {
    /**
     * Test case: #2209
     * Description: Images together (PNG, SVG) are copied from .cdxml format and added from clipboard directly to selected place on Canvas with correct positions
     * (SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDXML/image-png-svg-together.cdxml',
    );
    await copyContentToClipboard(page, fileContent);
    await pasteFromClipboardByKeyboard(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are correctly displayed in .ket format in Open Structure Preview', async () => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are correctly displayed in .ket format in Open Structure Preview
     */
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are correctly displayed in .ket format in Save Structure Preview', async () => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are correctly displayed in .ket format in Save Structure Preview
     */
    await openFileAndAddToCanvas(page, 'KET/images-png-svg.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.KetFormat,
    );
    await takeEditorScreenshot(page);
  });

  const fileNames = [
    'image-bmp',
    'image-gif',
    'image-ico',
    'image-jpeg',
    'image-jpg',
    'image-tiff',
    'image-webp',
  ];

  for (const fileName of fileNames) {
    test(`Verify that image of not supported format ${fileName} cannot be added from .ket file to Canvas`, async () => {
      /**
       * Test case: #4911
       * Description: Error message is displayed - "Cannot deserialize input JSON."
       */
      await CommonTopLeftToolbar(page).openFile();
      await openFile(page, `KET/${fileName}.ket`);
      await PasteFromClipboardDialog(page).addToCanvasButton.click();
      await takeEditorScreenshot(page);
    });
  }

  const corruptedFiles = [
    'image-png-corrupted-data-field.ket',
    'image-png-corrupted-height-field.ket',
    'image-png-corrupted-height-negative.ket',
    'image-png-corrupted-height-zero.ket',
    'image-png-corrupted-type-value.ket',
    'image-png-corrupted-width-field.ket',
    'image-png-corrupted-width-negative.ket',
    'image-png-corrupted-width-zero.ket',
    'image-svg-corrupted.ket',
    'image-svg-corrupted-boundingbox.ket',
    'image-svg-corrupted-format-field.ket',
    'image-svg-corrupted-format-value.ket',
  ];

  for (const file of corruptedFiles) {
    test(`Verify that image with corrupted data from ${file} cannot be added from .ket file to Canvas`, async () => {
      /**
       * Test case: #4911
       * Description: Error message is displayed - "Cannot deserialize input JSON."
       */
      const addToCanvasButton =
        PasteFromClipboardDialog(page).addToCanvasButton;
      await CommonTopLeftToolbar(page).openFile();
      await openFile(page, `KET/${file}`);
      await addToCanvasButton.click();
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that image cannot be loaded from .ket file if the length of bitmap is less than 160 symbols', async () => {
    /**
     * Test case: #4911
     * Description: Error message is displayed - "Cannot deserialize input JSON."
     */
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, `KET/image-png-159-symbols.ket`);
    await addToCanvasButton.click();
    await takeEditorScreenshot(page);
  });

  test('Verify adding SVG and PNG images with the canvas zoomed to 400%. After placing the images, zoom out to 20% and then press the 100% zoom button', async () => {
    /**
     * Test case: #4911
     * Description: Zoom In and Zoom Out work for Images
     */
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await openFileAndAddToCanvas(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG, SVG) together from .ket file can be Undo/Redo', async () => {
    /**
     * Test case: #4911
     * Description: Action of adding to Canvas images of allowed formats (PNG, SVG) together from .ket file can be Undo/Redo
     */
    await openFileAndAddToCanvas(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG, SVG) using "Add Image" button can be Undo/Redo', async () => {
    /**
     * Test case: #4911
     * Description: Action of adding to Canvas images of allowed formats (PNG, SVG) using "Add Image" button can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that "Add Image" button is on left panel, icon can be selected and it displays with filling', async () => {
    /**
     * Test case: #4897
     * Description: "Add Image" button is on left panel, icon can be selected and it displays with filling, after
     * clicking on another tool or Esc, the icon selection with filling is removed
     */
    await LeftToolbar(page).image();
    await takeLeftToolbarScreenshot(page);
    await LeftToolbar(page).text();
    await takeLeftToolbarScreenshot(page);
  });

  test('Verify that images can be added to different selected places on Canvas one by one using "Add Image" button and can be selected and moved to another place', async () => {
    /**
     * Test case: #4897
     * Description: Images can be added to different selected places on Canvas one by one using "Add Image" button
     * and can be selected and moved to another place on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images can be added to different selected places on Canvas one by one using "Add Image" button and can be selected and moved to another image', async () => {
    /**
     * Test case: #4897
     * Description: Images can be added to different selected places on Canvas one by one using "Add Image" button
     * and can be selected and moved to another place on Canvas with appropriate layer level (including partial overlap of elements)
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(600, 400, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to Canvas images with elements can be selected and moved together and separately to other places on Canvas', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images with elements can be selected and
     * moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 100, page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(800, 100, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to Canvas images with elements can be selected and moved together to other places on Canvas', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to Canvas images with elements can be selected and moved together to other places on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(600, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats (PNG, SVG) can be zoomed in/out (20, 400, 100) after adding to Canvas using "Add Image" button', async () => {
    /**
     * Test case: #4911
     * Description: Zoom In and Zoom Out work for Images with mouse wheel
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that moving actions of images (PNG, SVG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Moving actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that scaling actions of image (PNG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Scaling actions of images (PNG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that scaling actions of image (SVG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Scaling actions of images (SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-rightMiddlePosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that deleting actions of images (PNG, SVG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Deleting actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that copying actions of images (PNG, SVG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Copying actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that cut actions of images (PNG, SVG) on Canvas can be Undo/Redo', async () => {
    /**
     * Test case: #4897
     * Description: Cut actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .cdx file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: #2209
     * Description: Loaded from .cdx file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDX/image-png-svg-together.cdx',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .cdxml file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: #2209
     * Description: Loaded from .cdxml file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-svg-together.cdxml',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: #4897
     * Description: Adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Erase" (or Delete, Backspace buttons)', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images of (PNG, SVG)
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/images-png-svg.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .cdx file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Erase" (or Delete, Backspace buttons)', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .cdx file and added to selected place on Canvas images of (PNG, SVG)
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDX/image-png-svg-together.cdx',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .cdxml file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Erase" (or Delete, Backspace buttons)', async () => {
    /**
     * Test case: #4897
     * Description: Loaded from .cdxml file and added to selected place on Canvas images of (PNG, SVG)
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-svg-together.cdxml',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Erase" (or Delete, Backspace buttons)', async () => {
    /**
     * Test case: #4897
     * Description: Adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);
  });

  const fileNames1 = [
    'image-bmp.bmp',
    'image-gif.gif',
    'image-ico.ico',
    'image-jpeg.jpeg',
    'image-jpg.jpg',
    'image-tif.tif',
    'image-webp.webp',
    'image-heic.heic',
  ];

  for (const fileName of fileNames1) {
    test(`Verify that image of not supported format ${fileName} cannot be added using "Add Image" button`, async () => {
      /**
       * Test case: #4897
       * Description: Error message is displayed - "Unsupported image type"
       */
      await openImageAndAddToCanvas(page, `Images/${fileName}`);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that image with size less than 16 pixels cannot be added to Canvas using "Add Image" button', async () => {
    /**
     * Test case: #4897
     * Description: Error message is displayed - "Image should be at least 16x16 pixels"
     */
    await openImageAndAddToCanvas(page, 'Images/image-png-15px.png');
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Rectangle Selection" in "Add Image" mode', async () => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Rectangle Selection" in "Add Image" mode
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(100, 100);
    await dragMouseTo(800, 800, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Lasso Selection" in "Add Image" mode', async () => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Lasso Selection" in "Add Image" mode
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.keyboard.press('Shift+Tab');
    await selectWithLasso(page, 100, 100, [
      { x: 800, y: 800 },
      { x: 100, y: 800 },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Fragment Selection" in "Add Image" mode', async () => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Fragment Selection" in "Add Image" mode
     */
    // await pageReloadMicro(page);
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Shift+Tab');
    }
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that if image is selected then green selection frame is displayed and image can be scaled vertically, horizontally and diagonally', async () => {
    /**
     * Test case: #4897
     * Description: Image is selected then green selection frame is displayed and
     * image can be scaled vertically, horizontally and diagonally.
     */
    await clearLocalStorage(page);
    await pageReloadMicro(page);

    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    const resizeHandles = [
      { id: 'imageResize-rightMiddlePosition', moveX: 300, moveY: 0 },
      { id: 'imageResize-topMiddlePosition', moveX: 0, moveY: -200 },
      { id: 'imageResize-bottomLeftPosition', moveX: -200, moveY: 200 },
    ];

    for (const handle of resizeHandles) {
      const resizeHandle = page.getByTestId(handle.id);
      await resizeHandle.scrollIntoViewIfNeeded();
      await resizeHandle.hover({ force: true });

      const box = await resizeHandle.boundingBox();
      if (!box) {
        throw new Error(`${handle.id} bounding box not found`);
      }

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + handle.moveX, startY + handle.moveY, {
        steps: 10,
      });
      await page.mouse.up();

      await takeEditorScreenshot(page);
    }
  });

  test('Verify that images of (PNG, SVG) cannot be saved to template - "Save to Template" button is disabled', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) cannot be saved to template - "Save to Template" button is disabled
     */
    const saveToTemplatesButton =
      SaveStructureDialog(page).saveToTemplatesButton;
    const saveStructureTextarea =
      SaveStructureDialog(page).saveStructureTextarea;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonTopLeftToolbar(page).saveFile();
    await expect(saveToTemplatesButton).toBeDisabled();
    await takeEditorScreenshot(page, {
      mask: [saveStructureTextarea],
    });
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to template and added to Canvas with correct position and layer level', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to template and added to Canvas with correct position and layer level
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 400);
    await saveToTemplates(page, 'My Custom Template');
    await CommonTopLeftToolbar(page).clearCanvas();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await StructureLibraryDialog(page).setSearchValue('My Custom Template');
    await takeEditorScreenshot(page);
    await page.getByText('My Custom Template').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after moving of them and then opened', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * moving of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-png-after-moving-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-after-moving-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after moving of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after
     * moving of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-png-after-moving-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-png-after-moving-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after moving of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after
     * moving of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-png-after-moving-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-after-moving-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after scaling of them and then opened', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * scaling of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-png-after-scaling-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-after-scaling-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after scaling of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after
     * scaling of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });
    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-png-after-scaling-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-png-after-scaling-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after scaling of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after
     * scaling of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });
    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-png-after-scaling-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-after-scaling-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after deleting of them and then opened', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * deleting of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-png-after-deleting-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-after-deleting-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after deleting of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after
     * deleting of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-png-after-deleting-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-png-after-deleting-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after deleting of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after
     * deleting of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-png-after-deleting-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-after-deleting-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after copying of them and then opened', async () => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * copying of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/image-svg-png-after-copying-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-after-copying-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after copying of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdx file with correct coordinates of images after
     * copying of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-png-after-copying-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-png-after-copying-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after copying of them and then opened', async () => {
    /**
     * Test case: #2209
     * Description: Images of (PNG, SVG) with elements can be saved to .cdxml file with correct coordinates of images after
     * copying of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 500);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-png-after-copying-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-after-copying-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) and Benzene Rings are on the same positions after Aromatize (Ctrl+A)/Dearomatize (Ctrl+Alt+A) actions', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) and Benzene Rings are on the same positions after Aromatize (Ctrl+A)/Dearomatize (Ctrl+Alt+A) actions and can be
     * saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer level.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Layout (Ctrl+L) action, only Benzene Rings are moved and aligned', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Layout (Ctrl+L) action, only Benzene Rings are moved
     * and aligned, they can be saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-distorting-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Clean Up (Ctrl+Shift+L) action, only Benzene Rings are moved and aligned', async () => {
    test.slow();
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Clean Up (Ctrl+Shift+L) action, only Benzene Rings are moved
     * and aligned, they can be saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    const x = 400;
    const y = 300;
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Calculate CIP (Ctrl+P) action, CIP is calculated for elements', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Calculate CIP (Ctrl+P) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-calculateCIP.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-calculateCIP-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-calculateCIP-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Check structure (Alt+S) action, it is calculated for elements', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Check structure (Alt+S) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).checkStructure();
    await takeEditorScreenshot(page, {
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
    await StructureCheckDialog(page).cancel();
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-check-structure-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-check-structure-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Calculate Values (Alt+C) action, it is calculated for elements', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Calculate Values (Alt+C) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
    await CalculatedValuesDialog(page).closeByX();
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Add/Remove explicit hydrogens actions, it is calculated for elements', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Add/Remove explicit hydrogens actions, it is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-explicit-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-explicit-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of 3D mode, only elements are displayed in 3D mode', async () => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of 3D mode, only elements are displayed in 3D mode.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-distorting.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).ThreeDViewer();
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await verifyFileExport(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  const autoMapModes = ['Discard', 'Keep', 'Alter', 'Clear'];
  const expectedFiles = [
    'KET/images-png-svg-with-benzene-discard-expected.ket',
    'KET/images-png-svg-with-benzene-keep-expected.ket',
    'KET/images-png-svg-with-benzene-alter-expected.ket',
    'KET/images-png-svg-with-benzene-clear-expected.ket',
  ];
  const testDescription =
    'Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool';

  autoMapModes.forEach((mode, index) => {
    test(`${testDescription} (${mode}), only elements are affected - ${index}`, async () => {
      /**
       * Test case: #2144
       * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tools, only elements are affected,
       * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/images-png-svg-with-benzene-for-distorting.ket',
      );
      await takeEditorScreenshot(page);

      if (mode === 'Clear') {
        await applyAutoMapMode(page, 'Alter');
      }

      await applyAutoMapMode(page, mode);

      await verifyFileExport(page, expectedFiles[index], FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, expectedFiles[index]);
      await takeEditorScreenshot(page);
    });
  });

  test('Verify that images of allowed format (PNG) can be saved to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed format (PNG) saved to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await takeEditorScreenshot(page);
    await verifyFileExport(page, 'CDX/image-png-expected.cdx', FileType.CDX);
    const fileContent = await readFileContent('CDX/image-png-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (PNG) can be saved to CDXML file with correct coordinates of images, formats and sizes of files, after that loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed format (PNG) saved to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-png-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed format (SVG) can be saved to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG) saved to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg-colored.svg');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-colored-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-colored-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (SVG) can be saved to CDXML file with correct coordinates of images, formats and sizes of files, after that loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG) saved to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg-colored.svg');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-colored-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-colored-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed format (PNG, SVG) can be saved together to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (PNG, SVG) can be saved together to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-svg-colored-above-png.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/images-svg-colored-above-png-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/images-svg-colored-above-png-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (PNG, SVG) can be saved together to CDXML file with correct coordinates of images, formats and sizes of files, after that loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (PNG, SVG) can be saved together to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-svg-colored-above-png.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/images-svg-colored-above-png-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/images-svg-colored-above-png-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed format (PNG) with elements can be saved to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed format (PNG) with elements saved to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-png-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-png-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (PNG) with elements can be saved to CDXML file with correct coordinates of images, formats and sizes of files, and loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed format (PNG) with elements saved to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-png-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed format (SVG) with elements can be saved to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG) with elements saved to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (SVG) with elements can be saved to CDXML file with correct coordinates of images, formats and sizes of files, and loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG) with elements saved to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed format (SVG, PNG) with elements can be saved to CDX file with correct coordinates of images, formats and sizes of files, after that loaded from CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG, PNG) with elements saved to CDX files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDX file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/image-svg-png-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/image-svg-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Image of allowed format (SVG, PNG) with elements can be saved to CDXML file with correct coordinates of images, formats and sizes of files, and loaded from CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed format (SVG, PNG) with elements saved to CDXML files with correct coordinates of images, formats and sizes of files,
     * after that loaded from CDXML file and added to selected place on Canvas.(SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-png-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/image-svg-png-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (PNG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDX file with
     * correct coordinates of images and file size.
     */
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/two-images-png-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent2 = await readFileContent(
      'CDX/two-images-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent2);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (PNG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDXML file with
     * correct coordinates of images and file size.
     */
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/two-images-png-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/two-images-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats (SVG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDX file with
     * correct coordinates of images and file size.(SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-svg-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/two-images-svg-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent2 = await readFileContent(
      'CDX/two-images-svg-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent2);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats (SVG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDXML file with
     * correct coordinates of images and file size.(SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-svg-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/two-images-svg-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/two-images-svg-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG, PNG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDX', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats (SVG, PNG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDX file with
     * correct coordinates of images and file size.(SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-svg-png-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/two-image-svg-png-with-elements-expected.cdx',
      FileType.CDX,
    );
    const fileContent2 = await readFileContent(
      'CDX/two-image-svg-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent2);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG, PNG) with different elements together can be added to selected place on Canvas from 2 different CDX/CDXML and save to CDXML', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats (SVG, PNG) with different elements together added to selected place on Canvas from 2 different CDX/CDXML
     * and they are on the correct positions and layer levels to each other and they saved together to CDXML file with
     * correct coordinates of images and file size.(SVG image replaced by placeholder)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickOnCanvas(page, 200, 200);

    await openFileAndAddToCanvas(
      page,
      'CDXML/image-svg-png-with-elements-expected.cdxml',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/two-image-svg-png-with-elements-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/two-image-svg-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  const testCases = [
    {
      description:
        'Verify that images of allowed formats (PNG) are correctly displayed in CDX format in Open Structure Preview',
      file: 'CDX/image-png-expected.cdx',
      action: 'open',
    },
    {
      description:
        'Verify that images of allowed formats (PNG) are correctly displayed in CDXML format in Open Structure Preview',
      file: 'CDXML/image-png-expected.cdxml',
      action: 'open',
    },
    {
      description:
        'Verify that images of allowed formats (SVG) are correctly displayed in CDX format in Open Structure Preview',
      file: 'CDX/image-svg-expected.cdx',
      action: 'open',
    },
    {
      description:
        'Verify that images of allowed formats (SVG) are correctly displayed in CDXML format in Open Structure Preview',
      file: 'CDXML/image-svg-expected.cdxml',
      action: 'open',
    },
    {
      description:
        'Verify that images of allowed formats (PNG) are correctly displayed in CDXML format in Save Structure Preview',
      file: 'KET/image-png-with-elements.ket',
      action: 'save',
      dropdownOption: MoleculesFileFormatType.CDXML,
    },
    {
      description:
        'Verify that images of allowed formats (PNG) are correctly displayed in Base 64 CDX format in Save Structure Preview',
      file: 'KET/image-png-with-elements.ket',
      action: 'save',
      dropdownOption: MoleculesFileFormatType.Base64CDX,
    },
    {
      description:
        'Verify that images of allowed together (PNG, SVG) are correctly displayed in CDXML format in Save Structure Preview',
      file: 'KET/images-svg-colored-above-png.ket',
      action: 'save',
      dropdownOption: MoleculesFileFormatType.CDXML,
    },
    {
      description:
        'Verify that images of allowed together (PNG, SVG) are correctly displayed in Base 64 CDX format in Save Structure Preview',
      file: 'KET/images-svg-colored-above-png.ket',
      action: 'save',
      dropdownOption: MoleculesFileFormatType.Base64CDX,
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      if (testCase.action === 'open') {
        await CommonTopLeftToolbar(page).openFile();
        await openFile(page, testCase.file);
      } else if (testCase.action === 'save') {
        await openFileAndAddToCanvas(page, testCase.file);
        await CommonTopLeftToolbar(page).saveFile();
        await SaveStructureDialog(page).chooseFileFormat(
          testCase.dropdownOption || MoleculesFileFormatType.MDLMolfileV2000,
        );
      }
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that 50 PNG images and 50 elements can be saved together to CDX files with the correct size of file, after that loaded from CDX file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: 50 PNG images and 50 elements saved together to CDX files with the correct size of file, after that loaded from CDX file
     * and added to selected place on Canvas with correct position and layer level.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-50-with-50-structures.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/images-png-50-with-50-structures-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/images-png-50-with-50-structures-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent, true);
    await takeEditorScreenshot(page);
  });

  test('Verify that 50 PNG images and 50 elements can be saved together to CDXML files with the correct size of file, after that loaded from CDXML file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: 50 PNG images and 50 elements saved together to CDXML files with the correct size of file, after that loaded from CDXML file
     * and added to selected place on Canvas with correct position and layer level.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/images-png-50-with-50-structures.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/images-png-50-with-50-structures-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/images-png-50-with-50-structures-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  const fileNames2 = [
    'image-bmp.cdx',
    'image-gif.cdx',
    'image-jpeg.cdx',
    'image-jpg.cdx',
  ];

  for (const fileName of fileNames2) {
    test(`Verify that image of not allowed format ${fileName} cannot be added from CDX file`, async () => {
      /**
       * Test case: https://github.com/epam/Indigo/issues/2028
       * Description: Images of not allowed formats (e.g.: BMP, GIF, JPEG, JPG ) can't be added from CDX file to Canvas
       * and instead of image appears placeholder.
       * Test working not a proper way. Do not appear a placeholder. After fix we need update screenshots.
       * We have a bug https://github.com/epam/Indigo/issues/2325
       */
      await openFileAndAddToCanvas(page, `CDX/${fileName}`);
      await takeEditorScreenshot(page);
    });
  }

  const fileNames3 = [
    'image-bmp.cdxml',
    'image-gif.cdxml',
    'image-jpeg.cdxml',
    'image-jpg.cdxml',
  ];

  for (const fileName of fileNames3) {
    test(`Verify that image of not allowed format ${fileName} cannot be added from CDXML file`, async () => {
      /**
       * Test case: https://github.com/epam/Indigo/issues/2028
       * Description: Images of not allowed formats (e.g.: BMP, GIF, JPEG, JPG ) can't be added from CDXML file to Canvas
       * and instead of image appears placeholder.
       * Test working not a proper way. Do not appear a placeholder. After fix we need update screenshots.
       * We have a bug https://github.com/epam/Indigo/issues/2325
       */
      await openFileAndAddToCanvas(page, `CDXML/${fileName}`);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that image can not be loaded from CDXML file if the length of bitmap is less than 160 symbols and error message is displayed', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Image can't be loaded from CDX/CDXML/Base 64 CDX file if the length of bitmap is less than 160 symbols and error message
     *  is displayed - "Cannot deserialize input JSON.".
     */
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, `CDXML/image-png-169-symbols.cdxml`);
    await PasteFromClipboardDialog(page).addToCanvasButton.click();
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats (PNG) can be zoomed in/out (20, 400, 100) before/after adding to Canvas from CDX file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) zoomed in/out (20, 400, 100) before/after adding to Canvas from CDX file
     */
    const fileContent = await readFileContent('CDX/image-png-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats (SVG) can be zoomed in/out (20, 400, 100) before/after adding to Canvas from CDX file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats (SVG) zoomed in/out (20, 400, 100) before/after adding to Canvas from CDX file
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDX/image-svg-expected.cdx',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats (PNG) can be zoomed in/out (20, 400, 100) before/after adding to Canvas from CDXML file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) zoomed in/out (20, 400, 100) before/after adding to Canvas from CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/image-png-expected.cdxml');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats together (PNG, SVG) can be zoomed in/out (20, 400, 100) before/after adding to Canvas from CDXML file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Images of allowed formats together (PNG, SVG) zoomed in/out (20, 400, 100) before/after adding to Canvas from CDXML file
     */
    await openFileAndAddToCanvas(page, 'CDXML/image-png-svg-together.cdxml');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG) together from CDX file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Action of adding to Canvas images of allowed formats (PNG) together from CDX file can be Undo/Redo
     */
    const fileContent = await readFileContent('CDX/image-png-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG) together from CDXML file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Action of adding to Canvas images of allowed formats (PNG) together from CDXML file can be Undo/Redo
     */
    await openFileAndAddToCanvas(page, 'CDXML/image-png-expected.cdxml');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (SVG) together from CDX file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Action of adding to Canvas images of allowed formats (SVG) together from CDX file can be Undo/Redo
     * (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDX/image-svg-expected.cdx');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (SVG) together from CDXML file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Action of adding to Canvas images of allowed formats (SVG) together from CDXML file can be Undo/Redo
     * (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDXML/image-svg-expected.cdxml');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (SVG, PNG) together from CDX file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Action of adding to Canvas images of allowed formats (SVG, PNG) together from CDX file can be Undo/Redo
     * (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDX/image-png-svg-together.cdx');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (SVG, PNG) together from CDXML file can be Undo/Redo', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Action of adding to Canvas images of allowed formats (SVG, PNG) together from CDXML file can be Undo/Redo
     * (SVG image replaced by placeholder)
     */
    await openFileAndAddToCanvas(page, 'CDXML/image-png-svg-together.cdxml');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (PNG) can be added to different selected places on Canvas one by one using "Add Image" button and can be saved together to CDX file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) added to different selected places on Canvas one by one using "Add Image" button
     *  and saved together to CDX file with the correct coordinates of images and sizes of files.
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/two-image-png-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent('CDX/two-image-png-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (PNG) can be added to different selected places on Canvas one by one using "Add Image" button and can be saved together to CDXML file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (PNG) added to different selected places on Canvas one by one using "Add Image" button
     *  and saved together to CDXML file with the correct coordinates of images and sizes of files.
     */
    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png.png', 200, 200);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/two-image-png-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/two-image-png-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG) can be added to different selected places on Canvas one by one using "Add Image" button and can be saved together to CDX file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (SVG) added to different selected places on Canvas one by one using "Add Image" button
     *  and saved together to CDX file with the correct coordinates of images and sizes of files.
     * (SVG image replaced by placeholder)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/two-image-svg-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent('CDX/two-image-svg-expected.cdx');
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Images of allowed formats (SVG) can be added to different selected places on Canvas one by one using "Add Image" button and can be saved together to CDXML file', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Images of allowed formats (SVG) added to different selected places on Canvas one by one using "Add Image" button
     *  and saved together to CDXML file with the correct coordinates of images and sizes of files.
     * (SVG image replaced by placeholder)
     */
    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/two-image-svg-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/two-image-svg-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDX file and added to selected place on Canvas images (PNG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDX file and added to selected place on Canvas images of allowed formats (PNG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDXML file and added to selected place on Canvas images (PNG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDXML file and added to selected place on Canvas images of allowed formats (PNG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDX file and added to selected place on Canvas images (SVG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Loaded from CDX file and added to selected place on Canvas images of allowed formats (SVG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDXML file and added to selected place on Canvas images (SVG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Loaded from CDXML file and added to selected place on Canvas images of allowed formats (SVG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDX file and added to selected place on Canvas images (SVG, PNG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Loaded from CDX file and added to selected place on Canvas images of allowed formats (SVG, PNG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    const fileContent = await readFileContent(
      'CDX/image-svg-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from CDXML file and added to selected place on Canvas images (SVG, PNG) with elements can be selected and moved together and separately to other places', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2209
     * Description: Loaded from CDXML file and added to selected place on Canvas images of allowed formats (SVG, PNG) with
     * elements selected and moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-svg-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 300, page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(700, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from CDX file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDX file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from CDXML file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDXML file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from CDX file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Erase"', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDX file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Erase"
     */
    const fileContent = await readFileContent(
      'CDX/image-png-with-elements-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from CDXML file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Erase"', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2028
     * Description: Loaded from CDXML file and added to selected place on Canvas images of allowed formats (PNG) can be deleted using "Erase"
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/image-png-with-elements-expected.cdxml',
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET SVG images are displayed on preview and can be saved to SVG files with correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added from KET SVG images are displayed on preview and saved to SVG files with correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvas(page, 'KET/svg-images-black-and-colored.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET color SVG images with elements saved to SVG can be added to Canvas by Tool as SVG images with the correct positions and layers of elements', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added from KET color SVG images with elements saved to SVG can be added to Canvas by Tool as SVG images with the correct positions and layers of elements
     */
    await openImageAndAddToCanvas(
      page,
      'Images/svg-colored-images-with-elements.svg',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET color SVG images with elements saved to SVG can be viewed on preview and Save button is enabled', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added from KET color SVG images with elements saved to SVG can be viewed on preview and Save button is enabled
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/svg-colored-images-with-elements.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images are displayed on preview and can be saved to SVG files with correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images are displayed on preview and saved to SVG files with correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added from KET SVG images with elements are displayed on preview and saved together to SVG file with the correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvas(page, 'KET/images-svg-with-elements.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers after selection, moving actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after selection, moving actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers after scaling actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file
     * with the correct positions and layers after scaling actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(300, 300, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers after deleting actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after deleting actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers after copying actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after copying actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 500);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers after undo/redo actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2161
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after undo/redo actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 500);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET color SVG images with elements saved to PNG can be viewed on preview and Save button is enabled', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added from KET color SVG images with elements saved to PNG can be viewed on preview and Save button is enabled
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/svg-colored-images-with-elements.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers after selection, moving actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after selection, moving actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers after scaling actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file
     * with the correct positions and layers after scaling actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(300, 300, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers after deleting actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after deleting actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers after copying actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after copying actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 500);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers after undo/redo actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added by Tool SVG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after undo/redo actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-svg.svg');
    await openImageAndAddToCanvas(
      page,
      'Images/image-svg-colored.svg',
      200,
      200,
    );
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 500);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET color SVG images with elements saved to PNG can be added to Canvas by Tool as PNG images with the correct positions and layers of elements', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added from KET color SVG images with elements saved to PNG can be added to Canvas by Tool as
     * PNG images with the correct positions and layers of elements.
     */
    await openImageAndAddToCanvas(page, 'Images/saved-svg-images-as-png.png');
    await CommonTopRightToolbar(page).setZoomInputValue('30');
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET color SVG images with elements saved to SVG can be added to Canvas by Tool as PNG images with the correct positions and layers of elements', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2162
     * Description: Added from KET color SVG images with elements saved to SVG can be added to Canvas by Tool as PNG images with the correct positions and layers of elements
     */
    await openImageAndAddToCanvas(
      page,
      'Images/svg-colored-images-with-elements.png',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images are displayed on preview and can be saved to PNG file with correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images are displayed on preview and can be saved to PNG file with correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png', 400, 400);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images are displayed on preview and can be saved to SVG file with correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images are displayed on preview and can be saved to SVG file with correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png', 400, 400);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET PNG images with elements are displayed on preview and can be saved together to PNG file with the correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added from KET PNG images with elements are displayed on preview and saved together to PNG file with the correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvas(page, 'KET/images-png-with-elements.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added from KET PNG images with elements are displayed on preview and can be saved together to SVG file with the correct positions and layers', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added from KET PNG images with elements are displayed on preview and saved together to SVG file with the correct positions and layers
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openFileAndAddToCanvas(page, 'KET/images-png-with-elements.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to PNG file with the correct positions and layers after selection, moving actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with Benzene Ring are displayed on preview and saved together to PNG file
     * with the correct positions and layers after selection, moving actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
    await page.mouse.move(300, 300);
    await dragMouseTo(600, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to SVG file with the correct positions and layers after selection, moving actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with Benzene Ring are displayed on preview and saved together to SVG file
     * with the correct positions and layers after selection, moving actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
    await page.mouse.move(300, 300);
    await dragMouseTo(600, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to PNG file with the correct positions and layers after scaling actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool SVG images with elements are displayed on preview and can be saved together to PNG file
     * with the correct positions and layers after scaling actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 300, 300);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(600, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to SVG file with the correct positions and layers after scaling actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool SVG images with elements are displayed on preview and can be saved together to SVG file
     * with the correct positions and layers after scaling actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 300, 300);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 300, 300);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(600, 500, page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to PNG file with the correct positions and layers after deleting actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after deleting actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png', 600, 500);
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to SVG file with the correct positions and layers after deleting actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after deleting actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png');
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png', 600, 500);
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to PNG file with the correct positions and layers after copying actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with elements are displayed on preview and saved together to PNG file
     * with the correct positions and layers after copying actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 600, 500);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images with Benzene Ring are displayed on preview and can be saved together to SVG file with the correct positions and layers after copying actions of images', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool PNG images with elements are displayed on preview and saved together to SVG file
     * with the correct positions and layers after copying actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 600, 500);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images can be saved to PNG file after undo/redo actions', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool SVG images with Benzene Ring are displayed on preview and saved together to PNG file
     * with the correct positions and layers after undo/redo actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 600, 500);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool PNG images can be saved to SVG file after undo/redo actions', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added by Tool SVG images with Benzene Ring are displayed on preview and saved together to SVG file
     * with the correct positions and layers after undo/redo actions of images.
     */
    const saveButton = SaveStructureDialog(page).saveButton;

    await openImageAndAddToCanvas(page, 'Images/image-png.png', 600, 500);
    await openImageAndAddToCanvas(page, 'Images/image-png-demo.png');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await expect(saveButton).toBeEnabled();
    await takeEditorScreenshot(page);
  });

  test('Verify that PNG images with elements from KET saved to PNG can be added by Tool as PNG image', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Verify that added from KET color PNG images with elements saved to PNG can be added to Canvas by Tool as PNG images with the correct positions and layers of elements
     */
    await openImageAndAddToCanvas(
      page,
      'Images/saved-images-png-with-elements.png',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that PNG images with elements from KET saved to SVG can be added by Tool as SVG image', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2029
     * Description: Added from KET color SVG images with elements saved to SVG can be added to Canvas by Tool as SVG images with the correct positions and layers of elements
     */
    await openImageAndAddToCanvas(
      page,
      'Images/saved-images-png-with-elements.svg',
    );
    await takeEditorScreenshot(page);
  });
});
