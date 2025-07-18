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

import { mapOf } from './schema-helper';
import { range } from 'lodash/fp';
import { sdataCustomSchema } from './sdata-schema';

export const atom = {
  title: 'Atom',
  type: 'object',
  required: ['label'],
  properties: {
    atomType: {
      title: 'Atom Type',
      enum: ['single', 'list', 'pseudo'],
      enumNames: ['Single', 'List', 'Special'],
      default: 'single',
    },
    label: {
      title: 'Label',
      type: 'string', // TODO:should really be enum of elements
      maxLength: 3,
      invalidMessage: 'Wrong label',
    },
    atomList: {
      title: 'List',
      type: 'string',
      invalidMessage: 'Invalid atom list',
    },
    notList: {
      title: 'Not list',
      type: 'boolean',
      default: false,
    },
    pseudo: {
      title: 'Special',
      type: 'string',
      invalidMessage: 'Invalid special atom',
    },
    alias: {
      title: 'Alias',
      type: 'string',
      invalidMessage: 'Leading and trailing spaces are not allowed',
    },
    charge: {
      title: 'Charge',
      type: 'string',
      pattern: '^([+-]?)(1[0-5]|0|[0-9])([+-]?)$',
      maxLength: 4,
      default: '',
      invalidMessage: 'Invalid charge value',
    },
    explicitValence: {
      title: 'Valence',
      enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
      enumNames: ['', '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
      default: -1,
    },
    isotope: {
      title: 'Isotope (atomic mass)',
      type: 'string',
      pattern: '^[0-9]{1,3}$|(^$)',
      default: '',
      maxLength: 3,
      invalidMessage: 'Invalid isotope value',
    },
    radical: {
      title: 'Radical',
      enum: [0, 2, 1, 3],
      enumNames: [
        '',
        'Monoradical',
        'Diradical (singlet)',
        'Diradical (triplet)',
      ],
      default: 0,
    },
    cip: {
      title: 'CIP',
      type: 'string',
      enum: ['R', 'S', 'r', 's'],
    },
    ringBondCount: {
      title: 'Ring bond count',
      enum: [0, -2, -1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', 'As drawn', '0', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    hCount: {
      title: 'H count',
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    substitutionCount: {
      title: 'Substitution count',
      enum: [0, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: [
        '',
        'As drawn',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
      ],
      default: 0,
    },
    unsaturatedAtom: {
      title: 'Unsaturated',
      type: 'boolean',
      default: false,
    },
    aromaticity: {
      title: 'Aromaticity',
      enum: [null, 'aromatic', 'aliphatic'],
      enumNames: ['', 'aromatic', 'aliphatic'],
      default: 0,
    },
    implicitHCount: {
      title: 'Implicit H count',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    ringMembership: {
      title: 'Ring membership',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    ringSize: {
      title: 'Ring size',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    connectivity: {
      title: 'Connectivity',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    chirality: {
      title: 'Chirality',
      enum: [null, 'anticlockwise', 'clockwise'],
      enumNames: ['', 'anticlockwise', 'clockwise'],
      default: 0,
    },
    customQuery: {
      title: 'Custom Query',
      pattern: '[^ ]',
      type: 'string',
      invalidMessage: 'Invalid custom query',
    },
    invRet: {
      title: 'Inversion',
      enum: [0, 1, 2],
      enumNames: ['', 'Inverts', 'Retains'],
      default: 0,
    },
    exactChangeFlag: {
      title: 'Exact change',
      type: 'boolean',
      default: false,
    },
  },
};

export const rgroupSchema = {
  title: 'R-group',
  type: 'object',
  properties: {
    values: {
      type: 'array',
      items: {
        type: 'string',
        enum: range(1, 33),
        enumNames: range(1, 33).map((item) => 'R' + item),
      },
    },
  },
};

export const labelEdit = {
  title: 'Label Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      title: 'Atom',
      default: '',
      invalidMessage: 'Wrong atom symbol',
      type: 'string',
    },
  },
};

export const attachmentPoints = {
  title: 'Attachment Points',
  type: 'object',
  properties: {
    primary: {
      title: 'Primary attachment point',
      type: 'boolean',
    },
    secondary: {
      title: 'Secondary attachment point',
      type: 'boolean',
    },
  },
};

export const bond = {
  title: 'Bond',
  type: 'object',
  required: ['type'],
  properties: {
    type: {
      title: 'Type',
      enum: [
        '',
        'single',
        'up',
        'down',
        'updown',
        'double',
        'crossed',
        'triple',
        'aromatic',
        'any',
        'hydrogen',
        'singledouble',
        'singlearomatic',
        'doublearomatic',
        'dative',
      ],
      enumNames: [
        '',
        'Single',
        'Single Up',
        'Single Down',
        'Single Up/Down',
        'Double',
        'Double Cis/Trans',
        'Triple',
        'Aromatic',
        'Any',
        'Hydrogen',
        'Single/Double',
        'Single/Aromatic',
        'Double/Aromatic',
        'Dative',
      ],
      default: 'single',
    },
    topology: {
      title: 'Topology',
      enum: [null, 0, 1, 2],
      enumNames: ['', 'Either', 'Ring', 'Chain'],
      default: 0,
    },
    customQuery: {
      title: 'Custom Query',
      pattern: '[^ ]',
      type: 'string',
      invalidMessage: 'Invalid custom query',
    },
    center: {
      title: 'Reacting Center',
      enum: [null, 0, -1, 1, 2, 4, 8, 12], // 5, 9, 13
      enumNames: [
        '',
        'Unmarked',
        'Not center',
        'Center',
        'No change',
        'Made/broken',
        'Order changes',
        'Made/broken and changes',
      ], // "Order changes" x 3
      default: 0,
    },
    cip: {
      title: 'CIP',
      type: 'string',
      enum: ['E', 'Z', 'M', 'P'],
    },
  },
};

const sgroup = {
  title: 'SGroup',
  type: 'object',
  required: ['type'],
  oneOf: [
    {
      ...sdataCustomSchema,
    },
    {
      key: 'MUL',
      title: 'Multiple group',
      type: 'object',
      properties: {
        type: { enum: ['MUL'] },
        mul: {
          title: 'Repeat count',
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 200,
        },
      },
      required: ['mul'],
    },
    {
      key: 'SRU',
      title: 'SRU polymer',
      type: 'object',
      properties: {
        type: { enum: ['SRU'] },
        subscript: {
          title: 'Polymer label',
          type: 'string',
          default: 'n',
          // any string, except empty and including double quotes
          pattern: '^(?!\\s*$)[^"]+$',
          invalidMessage:
            'SRU subscript should not be empty and contain double quotes',
        },
        connectivity: {
          title: 'Repeat Pattern',
          enum: ['ht', 'hh', 'eu'],
          enumNames: ['Head-to-tail', 'Head-to-head', 'Either unknown'],
          default: 'ht',
        },
      },
      required: ['subscript', 'connectivity'],
    },
    {
      key: 'SUP',
      title: 'Superatom',
      type: 'object',
      properties: {
        type: { enum: ['SUP'] },
        name: {
          title: 'Name',
          type: 'string',
          default: '',
          minLength: 1,
          invalidMessage: 'Please, provide a name for the superatom',
        },
      },
      required: ['name'],
    },
    {
      key: 'queryComponent',
      title: 'Query component',
      type: 'object',
      properties: {
        type: { enum: ['queryComponent'] },
      },
    },
    {
      key: 'nucleotideComponent',
      title: 'Nucleotide Component',
      type: 'object',
      properties: {
        type: { enum: ['nucleotideComponent'] },
        class: {
          title: 'Component',
          enum: ['SUGAR', 'BASE', 'PHOSPHATE'],
          enumNames: ['Sugar', 'Base', 'Phosphate'],
          default: 'Sugar',
        },
      },
      required: ['class'],
    },
  ],
};
export const sgroupMap = mapOf(sgroup, 'type');

export const rgroupLogic = {
  title: 'R-Group',
  type: 'object',
  properties: {
    range: {
      title: 'Occurrence',
      type: 'string',
      maxLength: 50,
      invalidMessage: 'Wrong value',
    },
    resth: {
      title: 'RestH',
      type: 'boolean',
    },
    ifthen: {
      title: 'Condition',
      type: 'integer',
      minium: 0,
    },
  },
};

export const textSchema = {
  title: 'Text Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      default: '',
      type: 'string',
    },
  },
};

export const attachSchema = {
  title: 'Template edit',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      title: 'Molecule name',
      type: 'string',
      minLength: 1,
      maxLength: 128,
      invalidMessage:
        'Template must have a unique name and no more than 128 symbols in length',
    },
  },
};
