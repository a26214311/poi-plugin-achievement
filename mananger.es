import { debug } from './debug'

let configInitId = null

const pluginDidLoad = () => {
  if (configInitId !== null) {
    debug.error('configInitId should be null')
  }
  configInitId = setTimeout(() => {
    configInitId = null
  })
}

const pluginWillUnload = () => {
  if (configInitId !== null) {
    clearTimeout(configInitId)
    configInitId = null
  }
}

export {
  pluginDidLoad,
  pluginWillUnload,
}
