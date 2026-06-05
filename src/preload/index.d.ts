import type { StoryCraftApi } from './index'

declare global {
  interface Window {
    storycraft: StoryCraftApi
  }
}

export {}
