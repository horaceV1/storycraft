import { contextBridge, ipcRenderer } from 'electron'

export interface SaveResult {
  ok: boolean
  filePath?: string
  canceled?: boolean
  error?: string
}

export interface LoadResult {
  ok: boolean
  data?: string
  filePath?: string
  canceled?: boolean
  error?: string
}

// A minimal, explicitly-typed API surface exposed to the renderer.
// Nothing else from Node/Electron is reachable from the web context.
const api = {
  saveProject: (payload: string): Promise<SaveResult> =>
    ipcRenderer.invoke('project:save', payload),
  loadProject: (): Promise<LoadResult> => ipcRenderer.invoke('project:load')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('storycraft', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback (should not happen: contextIsolation is always on).
  // @ts-ignore expose on window for non-isolated contexts
  window.storycraft = api
}

export type StoryCraftApi = typeof api
