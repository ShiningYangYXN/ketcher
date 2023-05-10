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
/* eslint-disable no-restricted-globals */

import {
  AromatizeCommandData,
  AutomapCommandData,
  CalculateCipCommandData,
  CalculateCommandData,
  CheckCommandData,
  CleanCommandData,
  Command,
  CommandData,
  CommandOptions,
  ConvertCommandData,
  DearomatizeCommandData,
  GenerateImageCommandData,
  GenerateInchIKeyCommandData,
  InputMessage,
  LayoutCommandData,
  OutputMessage
} from './indigoWorker.types'
// import { indigoModule } from './standaloneStructService';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import init, { main, layout } from 'indigo-ketcher/indigo-ketcher'
// import wasm from 'indigo-ketcher/indigo-ketcher.wasm'
// import { expose } from 'comlink'
// importScripts('./standaloneSturctService')
// @ts-ignore
// console.log(indigoModule)

// console.log('indigoModuleFn', indigoModuleFn)
// console.log(wasm)
// @ts-ignore
// wasm()
// //   // @ts-ignore
//   .then((mod) => console.log(mod))

// async function loadWasm() {
//   const importObject = {
//     env: {
//       __memory_base: 0,
//       __table_base: 0,
//       memory: new WebAssembly.Memory({initial: 1})
//     }
//   }
//   const wasm = fetch('http://localhost:3000/indigo-ketcher.wasm');
//   WebAssembly.instantiateStreaming(wasm, importObject)
//   .then(res => console.log(res))
// }
// loadWasm()

// import('indigo-ketcher/indigo-ketcher.wasm')
//   // @ts-ignore
//   .then((mod) => console.log(mod.default()))
import indigoModuleFn from 'indigo-ketcher'
// console.log('indigoModuleFn', indigoModuleFn)
// indigoModuleFn().then((result) => {
//   console.log(result)
//   indigo = result
// })

const originalFetch = self.fetch

self.fetch = async (url, options) => {
  // @ts-ignore
  const isHttp = url.startsWith('http::') || url.startsWith('https::')
  const fixedUrl = !isHttp ? self.location.origin + '/' + url : url
  return originalFetch(fixedUrl, options)
}

const indigoPromise = indigoModuleFn()

interface IndigoOptions {
  set: (key: string, value: string) => void
}

type handlerType = (indigo: any, indigoOptions: IndigoOptions) => string

async function handle(
  handler: handlerType,
  options?: CommandOptions,
  messageType?: Command
) {
  // @ts-ignore
  console.log('Indigo is', indigo)
  const indigo = await indigoPromise
  // @ts-ignore
  const indigoOptions = new indigo.MapStringString()
  setOptions(indigoOptions, options || {})
  let msg: OutputMessage<string>
  try {
    const payload = handler(indigo, indigoOptions)
    msg = {
      type: messageType,
      payload,
      hasError: false
    }
  } catch (error: any) {
    msg = {
      type: messageType,
      hasError: true,
      error: error
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.postMessage(msg)
}

function setOptions(indigoOptions: IndigoOptions, options: CommandOptions) {
  for (const [key, value] of Object.entries(options)) {
    if (value == null) continue
    indigoOptions.set(key, (value as any).toString())
  }
}

// const workerUrl = self.location + '';
// const basePath = workerUrl.replace(/\/[^/]+$/, '/');
// const [,removedBlobPath] = basePath.split('blob:');

// console.log('called', removedBlobPath)
// // @ts-ignore
// self.importScripts(removedBlobPath + 'static/js/indigo-ketcher.js')

// const module = import('indigo-ketcher/indigo-ketcher.wasm')
//   .then(async (indigoModule) => {
//     // @ts-ignore
//     console.log(await indigoModule)
//     // @ts-ignore
//     return indigoModule.default()
//   })

// const wasmUrl = new URL('indigo-ketcher.wasm', import.meta.url);
// const module = import(wasmUrl.href)
//   .then(async (indigoModule) => {
//     // @ts-ignore
//     console.log(await indigoModule)
//     // @ts-ignore
//     return indigoModule.default()
//   })

// const module = import('indigo-ketcher').then(async (indigoModule) => {
//   const res = await indigoModule.default()
//   console.log(res)
//   return res
// })

self.onmessage = (e: MessageEvent<InputMessage<CommandData>>) => {
  const message = e.data

  switch (message.type) {
    // case Command.Init: {
    //   const data: InitCommandData = message.data as InitCommandData
    //   import(data.data)
    //   .then((mod) => mod.default)
    //   break;
    // }

    case Command.GenerateImageAsBase64: {
      const data: GenerateImageCommandData =
        message.data as GenerateImageCommandData
      handle(
        (indigo, indigoOptions) => indigo.render(data.struct, indigoOptions),
        {
          ...data.options,
          'render-output-format': data.outputFormat,
          'render-background-color': data.backgroundColor,
          'render-coloring': true
        },
        Command.GenerateImageAsBase64
      )
      break
    }

    case Command.Layout: {
      const data: LayoutCommandData = message.data as LayoutCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.layout(data.struct, data.format, indigoOptions),
        data.options,
        Command.Layout
      )
      break
    }

    case Command.Dearomatize: {
      const data: DearomatizeCommandData =
        message.data as DearomatizeCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.dearomatize(data.struct, data.format, indigoOptions),
        data.options,
        Command.Dearomatize
      )
      break
    }

    case Command.Check: {
      const data: CheckCommandData = message.data as CheckCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.check(
            data.struct,
            data.types?.length ? data.types.join(';') : '',
            indigoOptions
          ),
        data.options,
        Command.Check
      )
      break
    }

    case Command.CalculateCip: {
      const data: CalculateCipCommandData =
        message.data as CalculateCipCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.calculateCip(data.struct, data.format, indigoOptions),
        data.options,
        Command.CalculateCip
      )
      break
    }

    case Command.Calculate: {
      const data: CalculateCommandData = message.data as CalculateCommandData
      handle(
        (indigo, indigoOptions) => {
          const selectedAtoms = new indigo.VectorInt()
          data.selectedAtoms.forEach((atomId) =>
            selectedAtoms.push_back(atomId)
          )
          return indigo.calculate(data.struct, indigoOptions, selectedAtoms)
        },
        data.options,
        Command.Calculate
      )
      break
    }

    case Command.Automap: {
      const data: AutomapCommandData = message.data as AutomapCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.automap(data.struct, data.mode, data.format, indigoOptions),
        data.options,
        Command.Automap
      )
      break
    }

    case Command.Aromatize: {
      const data: AromatizeCommandData = message.data as AromatizeCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.aromatize(data.struct, data.format, indigoOptions),
        data.options,
        Command.Aromatize
      )
      break
    }

    case Command.Clean: {
      const data: CleanCommandData = message.data as CleanCommandData
      handle(
        (indigo, indigoOptions) => {
          const selectedAtoms = new indigo.VectorInt()
          data.selectedAtoms.forEach((atomId) =>
            selectedAtoms.push_back(atomId)
          )
          return indigo.clean2d(
            data.struct,
            data.format,
            indigoOptions,
            selectedAtoms
          )
        },
        data.options,
        Command.Clean
      )
      break
    }

    case Command.Convert: {
      const data: ConvertCommandData = message.data as ConvertCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.convert(data.struct, data.format, indigoOptions),
        data.options,
        Command.Convert
      )
      break
    }

    case Command.Info: {
      handle((indigo) => indigo.version(), undefined, Command.Info)
      break
    }

    case Command.GenerateInchIKey: {
      const data: GenerateInchIKeyCommandData =
        message.data as GenerateInchIKeyCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.convert(data.struct, 'inchi-key', indigoOptions),
        undefined,
        Command.GenerateInchIKey
      )
      break
    }

    default:
      throw Error('Unsupported enum type')
  }
}

// expose(handle)
