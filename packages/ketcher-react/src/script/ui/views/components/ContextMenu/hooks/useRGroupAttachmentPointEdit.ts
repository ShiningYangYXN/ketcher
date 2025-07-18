import { useCallback } from 'react';
import assert from 'assert';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import {
  ItemEventParams,
  RGroupAttachmentPointContextMenuProps,
} from '../contextMenu.types';
import { editRGroupAttachmentPoint } from 'src/script/editor/tool/apoint.utils';
import { Ketcher, ketcherProvider } from 'ketcher-core';

type Params = ItemEventParams<RGroupAttachmentPointContextMenuProps>;

const getAtomIdByProps = (
  props: RGroupAttachmentPointContextMenuProps | undefined,
  ketcher: Ketcher,
): number => {
  const editor = ketcher.editor as Editor;
  const restruct = editor.render.ctab;
  const atomId = props?.atomIds?.[0];
  if (atomId != null) {
    return atomId;
  }

  const attachmentPointId = props?.rgroupAttachmentPoints?.[0];
  assert(attachmentPointId != null);
  const attachmentPoint =
    restruct.molecule.rgroupAttachmentPoints.get(attachmentPointId);
  assert(attachmentPoint != null);
  return attachmentPoint.atomId;
};

const useRGroupAttachmentPointEdit = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    ({ props }: Params) => {
      const ketcher = ketcherProvider.getKetcher(ketcherId);
      const restruct = ketcher.editor.render.ctab;
      const atomId = getAtomIdByProps(props, ketcher);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      editRGroupAttachmentPoint(ketcher.editor, atom, atomId);
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Params) => {
      const ketcher = ketcherProvider.getKetcher(ketcherId);
      const restruct = ketcher.editor.render.ctab;
      const atomId = getAtomIdByProps(props, ketcher);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      return atom.isRGroupAttachmentPointEditDisabled;
    },
    [ketcherId],
  );

  const hidden = useCallback(({ props }: Params) => {
    const atomLength = props?.atomIds?.length || 0;
    return atomLength > 1;
  }, []);

  return [handler, disabled, hidden] as const;
};

export default useRGroupAttachmentPointEdit;
