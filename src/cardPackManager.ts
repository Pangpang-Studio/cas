// Manages the card packs and their contents

import { ref } from 'vue'
import type {
  CompactCardPackCollection,
  PackSelection,
  RawPackSelection,
} from './cah'

export interface CardPackSource {
  name: string
  url: string
}

/**
 * List of existing card packs and their sources, in JSON Against Humanity's compact format.
 */
export const preexistingCardPacks: CardPackSource[] = [
  {
    name: 'JSON Against Humanity',
    url: '/cah-all-compact.json',
  },
]

function localStorageCardPackName(name: string) {
  return `cardPacks/${name}`
}

/**
 * Manages cached card packs and their sources.
 */
export class CardPackManager {
  loadedPacks = ref(new Map<string, CompactCardPackCollection>())

  constructor() {
    this.refreshPacksFromStorage()
  }

  private refreshPacksFromStorage() {
    this.loadedPacks.value.clear()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('cardPacks/')) {
        const name = key.slice(10)
        const data = localStorage.getItem(key)
        this.loadedPacks.value.set(name, JSON.parse(data!))
      }
    }
  }

  getPack(name: string): CompactCardPackCollection | undefined {
    return this.loadedPacks.value.get(name)
  }

  /**
   * Downloads a card pack and caches it in local storage. If the pack is already
   * cached, it will be overwritten.
   * @param source  The source of the card pack to download.
   */
  async downloadPack(source: CardPackSource) {
    const { name, url } = source
    const response = await fetch(url)
    const data = await response.json()
    this.loadedPacks.value.set(name, data)
    localStorage.setItem(localStorageCardPackName(name), JSON.stringify(data))
  }

  async deletePack(name: string) {
    this.loadedPacks.value.delete(name)
    localStorage.removeItem(localStorageCardPackName(name))
  }

  selectionFromRaw(sel: RawPackSelection[]): PackSelection[] {
    return sel.map(({ packCollection, pack }) => {
      const collection = this.loadedPacks.value.get(packCollection)
      if (!collection) {
        throw new Error(`Pack collection '${packCollection}' not found`)
      }
      return { packName: pack, collection }
    })
  }
}

/**
 * The global instance everybody should use.
 */
export const globalCardPacks = new CardPackManager()
