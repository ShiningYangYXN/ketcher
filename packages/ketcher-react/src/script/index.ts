/****************************************************************************
 * Copyright 2018 EPAM Systems
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
import api from './api'
import molfile from './chem/molfile'
import smiles from './chem/smiles'
import * as structFormat from './ui/data/convert/structformat'
import ui from './ui'
import Render from './render'
import graph from './format/chemGraph'
import { RemoteStructService } from '../infrastructure/services'
import validateGraphF from './format/graphValidator'
import { isEqual } from 'lodash/fp'
import Struct from './chem/struct'

class Ketcher {
  editor: any
  server: any
  ui: any
  apiPath: any
  readonly buildInfo = {
    version: process.env.VERSION,
    buildDate: process.env.BUILD_DATE,
    buildNumber: process.env.BUILD_NUMBER
  }
  private origin = null

  getSmiles(): string {
    return smiles.stringify(ketcher.editor.struct(), { ignoreErrors: true })
  }

  saveSmiles(): Promise<any> {
    const struct = ketcher.editor.struct()
    return structFormat
      .toString(struct, 'smiles-ext', ketcher.server)
      .catch(() => smiles.stringify(struct))
  }

  getMolfile(): string {
    return molfile.stringify(ketcher.editor.struct(), { ignoreErrors: true })
  }

  setMolecule(molString: string): void {
    if (typeof molString !== 'string') return
    ketcher.ui.load(molString, {
      rescale: true
    })
  }

  addFragment(molString: string): void {
    if (typeof molString !== 'string') return
    ketcher.ui.load(molString, {
      rescale: true,
      fragment: true
    })
  }

  showMolfile(clientArea: any, molString: string, options: any): Render {
    const render = new Render(
      clientArea,
      Object.assign(
        {
          scale: options.bondLength || 75
        },
        options
      )
    )
    if (molString) {
      const mol = molfile.parse(molString)
      render.setMolecule(mol)
    }
    render.update()
    // not sure we need to expose guts
    return render
  }

  isDirty(): boolean {
    const position = ketcher.editor.historyPtr
    const length = ketcher.editor.historyStack.length
    if (!length || !this.origin) {
      return false
    }
    return !isEqual(ketcher.editor.historyStack[position - 1], this.origin)
  }

  setOrigin(): void {
    const position = ketcher.editor.historyPtr
    this.origin = position ? ketcher.editor.historyStack[position - 1] : null
  }

  toGraph(): any {
    const j = graph.toGraph(ketcher.editor.render.ctab.molecule)
    validateGraphF(j)
    return j
  }

  fromGraph(): Struct {
    return graph.fromGraph(graph.toGraph(ketcher.editor.render.ctab.molecule))
  }

  generatePng(...args: any): Promise<any> {
    return this.server.generatePngAsBase64
      .apply(null, args)
      .then(base64 =>
        fetch(`data:image/png;base64,${base64}`).then(response =>
          response.blob()
        )
      )
  }
}

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
export default function init(el, staticResourcesUrl, apiPath, structServiceProvider) {
  ketcher.apiPath = apiPath
  const params = new URLSearchParams(document.location.search)

  if (params.has('api_path')) ketcher.apiPath = params.get('api_path')
  ketcher.server = api(ketcher.apiPath, structServiceProvider, {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true,
    'mass-skip-error-on-pseudoatoms': false,
    'gross-formula-add-rsites': true
  })
  ketcher.ui = ui(
    el,
    staticResourcesUrl,
    Object.assign({}, params, ketcher.buildInfo),
    ketcher.server
  )
  ketcher.server.then(
    () => {
      if (params.get('moll')) ketcher.ui.load(params.get('moll'))
    },
    () => {
      document.title += ' (standalone)'
    }
  )
}

const ketcher = new Ketcher()

;(global as any).ketcher = ketcher
