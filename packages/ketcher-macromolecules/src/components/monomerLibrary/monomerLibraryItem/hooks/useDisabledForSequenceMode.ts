import { MonomerGroups, MonomerItemType } from 'ketcher-core';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectIsSequenceFirstsOnlyNucleotidesSelected } from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';

const useDisabledForSequenceMode = (
  item: MonomerItemType,
  groupName?: MonomerGroups,
) => {
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceFirstsOnlyNucleoelementsSelected = useSelector(
    selectIsSequenceFirstsOnlyNucleotidesSelected,
  );
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!isSequenceEditInRNABuilderMode) return setIsDisabled(false);

    if (groupName === MonomerGroups.BASES) {
      setIsDisabled(!item?.props?.MonomerCaps?.R1);
    } else if (groupName === MonomerGroups.PHOSPHATES) {
      setIsDisabled(
        !(item?.props?.MonomerCaps?.R1 && item?.props?.MonomerCaps?.R2),
      );
    } else if (groupName === MonomerGroups.SUGARS) {
      if (isSequenceFirstsOnlyNucleoelementsSelected) {
        setIsDisabled(
          !(item?.props?.MonomerCaps?.R3 && item?.props?.MonomerCaps?.R2),
        );
      } else {
        setIsDisabled(
          !(
            item?.props?.MonomerCaps?.R3 &&
            item?.props?.MonomerCaps?.R2 &&
            item?.props?.MonomerCaps?.R1
          ),
        );
      }
    }
  }, [
    groupName,
    isSequenceEditInRNABuilderMode,
    isSequenceFirstsOnlyNucleoelementsSelected,
    item?.props?.MonomerCaps?.R1,
    item?.props?.MonomerCaps?.R2,
    item?.props?.MonomerCaps?.R3,
    setIsDisabled,
  ]);

  return isDisabled;
};

export default useDisabledForSequenceMode;
