import { Page, expect, test } from '@playwright/test';
import {
  BondType,
  BondTypeName,
  clickOnAtom,
  doubleClickOnAtom,
  doubleClickOnBond,
  pressButton,
  setAromaticity,
  setBondType,
  setCustomQueryForAtom,
  setCustomQueryForBond,
  setSubstitutionCount,
  setUnsaturated,
  waitForAtomPropsModal,
  waitForBondPropsModal,
  waitForPageInit,
} from '@utils';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { selectAllStructuresOnCanvas } from '@tests/utils/canvas';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';

async function isQueryStructureSelected(page: Page): Promise<boolean> {
  return await page.evaluate(() => window.ketcher.isQueryStructureSelected());
}

async function checkIsQueryStructureSelected(
  page: Page,
  isQueryStructureSelectedValue: boolean,
) {
  await pressButton(page, 'Apply');
  await selectAllStructuresOnCanvas(page);
  expect(await isQueryStructureSelected(page)).toBe(
    isQueryStructureSelectedValue,
  );
}

test.describe('API isQueryStructureSelected for atoms', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    const anyAtom = 0;
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', anyAtom);
    await waitForAtomPropsModal(page);
    await page.getByTestId('Query specific-section').click();
  });

  test('returns true, when atom has custom query', async ({ page }) => {
    const customQuery = '#6;x9';
    await setCustomQueryForAtom(page, customQuery);
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom has substitution count', async ({ page }) => {
    await setSubstitutionCount(page, '4');
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is unsaturated', async ({ page }) => {
    await setUnsaturated(page);
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is aromatic', async ({ page }) => {
    await setAromaticity(page, 'aromatic');
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when structure has "Any" atom', async ({ page }) => {
    const anyAtomButton = RightToolbar(page).anyAtomButton;

    await pressButton(page, 'Cancel');
    await anyAtomButton.click();
    await clickOnAtom(page, 'C', 0);
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(true);
  });
});

test.describe('API isQueryStructureSelected for bonds', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    const anyBond = 0;
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnBond(page, BondType.SINGLE, anyBond);
    await waitForBondPropsModal(page);
  });

  const queryBonds = [
    BondTypeName.Any,
    BondTypeName.SingleDouble,
    BondTypeName.SingleAromatic,
    BondTypeName.DoubleAromatic,
    BondTypeName.Aromatic,
    BondTypeName.SingleUpDown,
  ];

  for (const queryBond of queryBonds) {
    test(`returns true for ${queryBond} bond`, async ({ page }) => {
      await setBondType(page, queryBond);
      await checkIsQueryStructureSelected(page, true);
    });
  }

  test(`returns true for customQuery bond`, async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setCustomQueryForBond(page, customQuery);
    await checkIsQueryStructureSelected(page, true);
  });
});

test.describe('Tests for API isQueryStructureSelected for Custom Component', () => {
  test('returns true for custom component', async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.QueryComponent,
    });
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(true);
  });
});

test.describe('Tests for API isQueryStructureSelected without query features', () => {
  test("Benzene ring doesn't have query structures", async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(false);
  });
});
