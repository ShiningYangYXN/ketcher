/* eslint-disable no-magic-numbers */
import { Page, test, expect, Locator } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  resetZoomLevelToDefault,
  MonomerType,
  waitForPageInit,
} from '@utils';
import {
  getMonomerLocator,
  MonomerAttachmentPoint,
} from '@utils/macromolecules/monomer';
import {
  bondMonomerPointToMoleculeAtom,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.afterEach(async () => {
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe('Connection rules for Phosphate monomers: ', () => {
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  interface IMonomer {
    monomerType: MonomerType;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: MonomerAttachmentPoint };
  }

  const phosphateMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    // '(R3,R4)': {
    //        monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R1,R2,R3)': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/08 - (R1,R2,R3).ket',
    //   alias: '(R1,R2,R3)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    // '(R1,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R2,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
  };

  async function loadTwoMonomers(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(page, leftMonomer.fileName);
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
      monomerType: leftMonomer.monomerType,
    }).first();

    await leftMonomerLocator.hover({ force: true });

    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(page, rightMonomer.fileName);
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
      monomerType: rightMonomer.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    await rightMonomerLocator.hover({ force: true });
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 375, page);
    await moveMouseAway(page);

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(phosphateMonomers).forEach((rightPhosphate) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 1
       *  Description: Phosphate could be connected with the phosphate through R2-R1 as well as R1-R1 or R2-R2.
       *               User should be asked which attachment points should be used to establish a bond.
       * For each %phosphateType% from the library (phosphateMonomers)
       *   For each %phosphateType2% from the library (phosphateMonomers)
       *  1. Clear canvas
       *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
       *  3. Establish connection between %phosphateType%(center) and %phosphateType%(center)
       *  4. Validate canvas (connection dialog should appear)
       */
      test(`Test case1: Center-to-center of ${leftPhosphate.alias} and ${rightPhosphate.alias}`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftPhosphate, rightPhosphate);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(phosphateMonomers).forEach((rightPhosphate) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightPhosphate.connectionPoints).forEach(
            (rightPhosphateConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 2
               *  Description: User can connect any phospshate to any phosphate using point-to-point way
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %phosphateType2% from the library (phosphateMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %phosphateType2%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
               *  3. Establish connection between %phosphateType%(%ConnectionPoint%) and %phosphateType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Test case2: Connect ${leftPhosphateConnectionPoint} to ${rightPhosphateConnectionPoint} of ${leftPhosphate.alias} and ${rightPhosphate.alias}`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPhosphate, rightPhosphate);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPhosphateConnectionPoint,
                  rightPhosphateConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    J: {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/16 - J - ambiguous alternatives from library (R1,R2).ket',
      alias: 'J',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '%': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Base-Templates/17 - J - ambiguous mixed (R1,R2).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //   },
    // },
  };

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 3 (Phosphate - Peptide)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Phosphate - Peptides )
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %peptideType% from the library (peptideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %peptideType%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %peptideType% and put them on the canvas
               *  3. Establish connection between %sphosphateType%(%ConnectionPoint%) and %peptideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case3: Cnnct ${leftPhosphateConnectionPoint} to ${rightPeptideConnectionPoint} of Ph(${leftPhosphate.alias}) and Peptide(${rightPeptide.alias})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPhosphate, rightPeptide);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPhosphateConnectionPoint,
                  rightPeptideConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //   },
    // },
    // '(R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/12 - (R1,R2,R3,R4).ket',
      alias: '(R1,R2,R3,R4)',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
        R4: MonomerAttachmentPoint.R4,
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
  };

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 4 (Phosphate - CHEM)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Phosphate - Peptides )
               * For each %phosphateType% from the library (phosphateMonomers)
               *   For each %CHEMType% from the library (CHEMMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
               *         For each %ConnectionPoint2% (avaliable connections of %CHEMType%) do:
               *  1. Clear canvas
               *  2. Load %phosphateType% and %CHEMType% and put them on the canvas
               *  3. Establish connection between %sphosphateType%(%ConnectionPoint%) and %CHEMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case4: Cnnct ${leftPhosphateConnectionPoint} to ${rightCHEMConnectionPoint} of Ph(${leftPhosphate.alias}) and CHEM(${rightCHEM.alias})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPhosphate, rightCHEM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPhosphateConnectionPoint,
                  rightCHEMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 3 (Phosphate - Peptide)
       *  Description: User can connect any Phosphate to any Peptide using center-to-center way.
       * For each %phosphateType% from the library (phosphateMonomers)
       *   For each %peptideType% from the library (peptideMonomers)
       *  1. Clear canvas
       *  2. Load %phosphateType% and %peptideType% and put them on the canvas
       *  3. Establish connection between %sphosphateType%(center) and %peptideType%(center)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case5: Cnnct Center to Center of Ph(${leftPhosphate.alias}) and Peptide(${rightPeptide.alias})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftPhosphate, rightPeptide);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 3 (Phosphate - CHEM)
       *  Description: User can connect any Phosphate to any CHEM using center-to-center way.
       * For each %phosphateType% from the library (phosphateMonomers)
       *   For each %CHEMType% from the library (CHEMMonomers)
       *  1. Clear canvas
       *  2. Load %phosphateType% and %CHEMType% and put them on the canvas
       *  3. Establish connection between %sphosphateType%(center) and %CHEMType%(center)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case6: Cnnct Center to Center of Ph(${leftPhosphate.alias}) and CHEM(${rightCHEM.alias})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftPhosphate, rightCHEM);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
      },
    },
    '(R3) - Side only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      connectionPoints: {
        R3: MonomerAttachmentPoint.R3,
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/07 - (R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/09 - (R1,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/10 - (R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/11 - (R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/12 - (R1,R2,R3,R4).ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
        R4: MonomerAttachmentPoint.R4,
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: MonomerAttachmentPoint.R1,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: MonomerAttachmentPoint.R2,
    //     R3: MonomerAttachmentPoint.R3,
    //     R4: MonomerAttachmentPoint.R4,
    //     R5: MonomerAttachmentPoint.R5,
    //   },
    // },
    '(R1,R2,R3,R4,R5)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/15 - (R1,R2,R3,R4,R5).ket',
      alias: 'F1',
      connectionPoints: {
        R1: MonomerAttachmentPoint.R1,
        R2: MonomerAttachmentPoint.R2,
        R3: MonomerAttachmentPoint.R3,
        R4: MonomerAttachmentPoint.R4,
        R5: MonomerAttachmentPoint.R5,
      },
    },
  };
  let ordnryMlcleName: string;

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftPhosphate.connectionPoints).forEach(
        (leftPhosphateConnectionPoint) => {
          Object.values(rightOM.connectionPoints).forEach(
            (rightOMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 2
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Phosphate - Ordinary Molecule )
               * For each %chemType% from the library (phosphateMonomers)
               *   For each %OMType% from the library (ordinaryMoleculeMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %OMType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %OMType% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %OMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              ordnryMlcleName = rightOM.fileName.substring(
                rightOM.fileName.indexOf(' - '),
                rightOM.fileName.lastIndexOf('.ket'),
              );
              test(`Test case9: Connect ${leftPhosphateConnectionPoint} to ${rightOMConnectionPoint} of Phosphate(${leftPhosphate.alias}) and OM(${ordnryMlcleName})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPhosphate, rightOM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPhosphateConnectionPoint,
                  rightOMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 10
       *  Description: User can connect any Phosphate to any OrdinaryMolecule using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      ordnryMlcleName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 10: Connect Center to Center of Phosphate(${leftPhosphate.alias}) and OrdinaryMolecule(${ordnryMlcleName})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftPhosphate, rightOrdinaryMolecule);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  interface IMolecule {
    moleculeType: string;
    fileName: string;
    alias: string;
    atomLocatorSelectors: string[];
    connectionPointShifts: { x: number; y: number }[];
  }

  const molecules: { [moleculeName: string]: IMolecule } = {
    'Benzene ring': {
      moleculeType: 'Molecule',
      fileName: 'KET/Molecule-Templates/1 - Benzene ring.ket',
      alias: 'Benzene ring',
      atomLocatorSelectors: [
        'g > circle',
        'g:nth-child(2) > circle',
        'g:nth-child(3) > circle',
        'g:nth-child(4) > circle',
        'g:nth-child(5) > circle',
        'g:nth-child(6) > circle',
      ],
      connectionPointShifts: [
        { x: 0, y: 2 },
        { x: -2, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: -2 },
        { x: 2, y: -2 },
        { x: -2, y: -2 },
      ],
    },
  };

  async function loadMonomer(page: Page, leftMonomer: IMonomer) {
    await openFileAndAddToCanvasMacro(page, leftMonomer.fileName);

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    }).first();

    await leftMonomerLocator.hover({ force: true });
    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(page, molecule.fileName);
    await moveMouseAway(page);
  }

  async function bondMonomerPointToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    attachmentPoint: string,
    atomIndex: number,
  ) {
    const leftPeptideLocator = getMonomerLocator(page, {
      monomerAlias: leftPeptide.alias,
    }).first();

    const rightMoleculeLocator = page
      .getByTestId(KETCHER_CANVAS)
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      attachmentPoint,
      rightMolecule.connectionPointShifts[atomIndex],
    );
  }

  Object.values(phosphateMonomers).forEach((leftMonomer) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Connect monomer all commection points to moleule atoms
       *  Step: 1. Load monomer (phosphate) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag every connection point of monomer to any free atom of molecule
       *        Expected result: Connection should be established
       */
      test(`16 Case: Connect evey connection point of Phosphate(${leftMonomer.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftMonomer);
        await loadMolecule(page, rightMolecule);

        const attachmentPointCount = Object.keys(
          leftMonomer.connectionPoints,
        ).length;
        const atomCount = Object.keys(
          rightMolecule.atomLocatorSelectors,
        ).length;

        for (
          let atomIndex = 0;
          atomIndex < Math.min(attachmentPointCount, atomCount);
          atomIndex++
        ) {
          await bondMonomerPointToAtom(
            page,
            leftMonomer,
            rightMolecule,
            Object.keys(leftMonomer.connectionPoints)[atomIndex],
            atomIndex,
          );
        }

        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
        });
      });
    });
  });
});
