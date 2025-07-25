import { Page, expect } from '@playwright/test';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

type queryNumberValues =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

type aromaticity = 'aromatic' | 'aliphatic' | '';
type chirality = 'clockwise' | 'anticlockwise' | '';
type inversionType = 'Inverts' | 'Retains' | '';

// Query specific attributes:

export async function setRingBondCount(page: Page, value: string) {
  await page.getByTestId('ringBondCount-input-span').click();
  await page.getByRole('option', { name: value }).click();
}

export async function setHCount(page: Page, hCount: queryNumberValues) {
  await page.getByTestId('hCount-input-span').click();
  await page.getByRole('option', { name: hCount }).click();
}

export async function setSubstitutionCount(
  page: Page,
  substitutionCount: queryNumberValues,
) {
  await page.getByTestId('substitutionCount-input-span').click();
  await page.getByRole('option', { name: substitutionCount }).click();
}

export async function setUnsaturated(page: Page) {
  await page.getByTestId('unsaturatedAtom-input').check();
}

export async function setImplicitHCount(
  page: Page,
  implicitHCount: queryNumberValues,
) {
  await page.getByTestId('implicitHCount-input-span').click();
  await page.getByRole('option', { name: implicitHCount }).click();
}

export async function setRingMembership(
  page: Page,
  ringMembership: queryNumberValues,
) {
  await page.getByTestId('ringMembership-input-span').click();
  await page.getByRole('option', { name: ringMembership }).click();
}

export async function setRingSize(page: Page, ringSize: queryNumberValues) {
  await page.getByTestId('ringSize-input-span').click();
  await page.getByRole('option', { name: ringSize }).click();
}

export async function setConnectivity(
  page: Page,
  connectivity: queryNumberValues,
) {
  await page.getByTestId('connectivity-input-span').click();
  await page.getByRole('option', { name: connectivity }).click();
}

export async function setAromaticity(page: Page, aromaticity: aromaticity) {
  await page.getByTestId('aromaticity-input-span').click();
  await page.getByRole('option', { name: aromaticity }).click();
}

export async function setChirality(page: Page, chirality: chirality) {
  await page.getByTestId('chirality-input-span').click();
  await page.getByRole('option', { name: chirality, exact: true }).click();
}

// Custom query - atom properties:

export async function setCustomQueryForAtom(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('atom-custom-query').fill(customQuery);
}

// Custom query - bond properties:

export async function setCustomQueryForBond(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('bond-custom-query').fill(customQuery);
}

// Bond attributes:

export async function setBondType(page: Page, bondTypeTestId: string) {
  await page.getByTestId('type-input-span').click();
  await page.getByTestId(bondTypeTestId).click();
}

export async function setBondTopology(page: Page, bondTopologyTestId: string) {
  await page.getByTestId('topology-input-span').click();
  await page.getByTestId(bondTopologyTestId).click();
}

export async function setReactingCenter(
  page: Page,
  reactingCenterOptionTestId: string,
) {
  await page.getByTestId('reacting-center-input-span').click();
  await page.getByTestId(reactingCenterOptionTestId).click();
}

// General atom properties attributes:

export async function setLabel(page: Page, value: string) {
  await page.getByTestId('label-input').fill(value);
}

export async function setCharge(page: Page, value: string) {
  await page.getByTestId('charge-input-span').fill(value);
}

export async function setAtomicMass(page: Page, value: string) {
  await page.getByTestId('isotope-input-span').fill(value);
}

export async function setValence(page: Page, valenceOption: string) {
  await page.getByTestId('explicitValence-input-span').click();
  await page.getByRole('option', { name: valenceOption }).click();
}

export async function setRadical(page: Page, radicalOption: string) {
  await page.getByTestId('radical-input-span').click();
  await page.getByRole('option', { name: radicalOption }).click();
}

// Reaction flags attributes:

export async function setReactionFlagInversion(
  page: Page,
  inversionType: inversionType,
) {
  await page
    .getByTestId('Reaction flags-section')
    .getByRole('combobox')
    .click();
  await page.getByTestId(`${inversionType}-option`).click();
}

export async function setReactionFlagExactChange(page: Page) {
  await page.getByText('Exact change').check();
}

// Other

export async function checkSmartsValue(page: Page, value: string) {
  const saveStructureTextarea = SaveStructureDialog(page).saveStructureTextarea;

  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await expect(saveStructureTextarea).toHaveValue(value);
}

export async function checkSmartsWarnings(page: Page) {
  const value =
    'Structure contains query properties of atoms and bonds that are not supported in the SMARTS. Query properties will not be reflected in the file saved.';
  const warningsTab = SaveStructureDialog(page).warningsTab;
  const warningTextarea = SaveStructureDialog(page).warningTextarea;

  await warningsTab.click();
  const warningSmartsTextArea = warningTextarea.filter({ hasText: 'SMARTS' });
  const warningText = await warningSmartsTextArea.evaluate(
    (node) => node.textContent,
  );
  expect(warningText).toEqual(value);
}
