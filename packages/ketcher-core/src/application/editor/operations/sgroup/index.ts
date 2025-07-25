/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
/* eslint-disable @typescript-eslint/no-use-before-define */

import { FunctionalGroup, SGroup, Vec2 } from 'domain/entities';
import { ReSGroup, ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { OperationPriority, OperationType } from '../OperationType';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  sgid: any;
  type?: any;
  pp?: any;
  expanded?: boolean;
  name?: string;
  oldSgroup?: SGroup;
};

const SGROUP_TYPE_MAPPING = {
  nucleotideComponent: SGroup.TYPES.SUP,
};

class SGroupCreate extends BaseOperation {
  data: Data;

  constructor(
    sgroupId?: any,
    type?: any,
    pp?: any,
    expanded?: boolean,
    name?: string,
    oldSgroup?: SGroup,
  ) {
    super(OperationType.S_GROUP_CREATE);
    this.data = {
      sgid: sgroupId,
      type,
      pp,
      expanded,
      name,
      oldSgroup,
    };
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const { sgid, pp, expanded, name, oldSgroup } = this.data;
    const sgroup =
      oldSgroup instanceof MonomerMicromolecule
        ? new MonomerMicromolecule(SGroup.TYPES.SUP, oldSgroup.monomer)
        : new SGroup(SGROUP_TYPE_MAPPING[this.data.type] || this.data.type);

    sgroup.id = sgid;
    struct.sgroups.set(sgid, sgroup);

    if (pp) {
      sgroup!.pp = new Vec2(pp);
    }

    if (expanded) {
      sgroup.data.expanded = expanded;
      if (sgroup instanceof MonomerMicromolecule) {
        sgroup.monomer.monomerItem.expanded = expanded;
      }
    }

    if (name) {
      sgroup.data.name = name;
    }

    const existingSGroup = struct.sgroups.get(sgid);

    if (existingSGroup) {
      restruct.sgroups.set(sgid, new ReSGroup(existingSGroup));
      if (
        FunctionalGroup.isFunctionalGroup(sgroup) ||
        SGroup.isSuperAtom(sgroup)
      ) {
        restruct.molecule.functionalGroups.add(new FunctionalGroup(sgroup));
      }
    }
    this.data.sgid = sgid;
  }

  invert() {
    const inverted = new SGroupDelete();
    inverted.data = this.data;
    return inverted;
  }
}

class SGroupDelete extends BaseOperation {
  data: Data;

  constructor(sgroupId?: any) {
    super(OperationType.S_GROUP_DELETE, OperationPriority.S_GROUP_DELETE);
    this.data = { sgid: sgroupId };
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const { sgid } = this.data;
    const sgroup = restruct.sgroups.get(sgid);
    const sgroupData = restruct.sgroupData.get(sgid);
    if (!sgroup) return;
    this.data.type = sgroup?.item?.type;
    this.data.pp = sgroup?.item?.pp;
    this.data.oldSgroup = sgroup.item;

    if (sgroup?.item?.type === 'DAT' && sgroupData) {
      restruct.clearVisel(sgroupData.visel);
      restruct.sgroupData.delete(sgid);
    }

    restruct.clearVisel(sgroup.visel);
    if (sgroup?.item?.atoms?.length !== 0) {
      throw new Error('S-Group not empty!');
    }

    if (
      FunctionalGroup.isFunctionalGroup(sgroup.item) ||
      SGroup.isSuperAtom(sgroup.item)
    ) {
      let relatedFGroupId;
      this.data.name = sgroup.item.data.name;
      this.data.expanded = (sgroup.item as SGroup).isExpanded();
      restruct.molecule.functionalGroups.forEach((fg, fgid) => {
        if (fg.relatedSGroupId === sgid) {
          relatedFGroupId = fgid;
        }
      });
      restruct.molecule.functionalGroups.delete(relatedFGroupId);
    }

    restruct.sgroups.delete(sgid);
    struct.sgroups.delete(sgid);
  }

  invert() {
    const inverted = new SGroupCreate();
    inverted.data = this.data;
    return inverted;
  }
}

export { SGroupCreate, SGroupDelete };
export * from './sgroupAtom';
export * from './SGroupAttr';
export * from './SGroupDataMove';
export * from './sgroupHierarchy';
export * from './sgroupAttachmentPoints';
