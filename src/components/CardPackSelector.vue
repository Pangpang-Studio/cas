<script setup lang="ts">
import type { CardPack, CompactCardPackCollection } from '../cah'
import {
  globalCardPacks,
  preexistingCardPacks,
  type CardPackSource,
} from '../cardPackManager'

function downloadPack(pack: CardPackSource) {
  globalCardPacks.downloadPack(pack)
}

function packIsLocal(pack: CardPackSource) {
  return globalCardPacks.loadedPacks.value.has(pack.name)
}

function deletePack(pack: CardPackSource) {
  globalCardPacks.deletePack(pack.name)
}

const selectedPacks = defineModel<Map<string, Set<string>>>()

function togglePack(pack: string, card: string) {
  if (!selectedPacks.value) {
    selectedPacks.value = new Map()
  }
  if (!selectedPacks.value.has(pack)) {
    selectedPacks.value.set(pack, new Set())
  }
  const packSet = selectedPacks.value.get(pack)!
  if (packSet.has(card)) {
    packSet.delete(card)
  } else {
    packSet.add(card)
  }
}

function sortedPackContents(
  pack: CompactCardPackCollection
): [string, CardPack][] {
  return Object.entries(pack.packs).sort(([k1, p1], [k2, p2]) => {
    if (p1.official && !p2.official) {
      return -1
    } else if (!p1.official && p2.official) {
      return 1
    } else {
      return k1.localeCompare(k2)
    }
  })
}
</script>

<template>
  <div>
    <div v-for="pack in preexistingCardPacks" :key="pack.name">
      <div>
        {{ pack.name }}

        <button @click="downloadPack(pack)">
          {{ packIsLocal(pack) ? 'Redownload' : 'Download' }}
        </button>
        <button @click="deletePack(pack)" v-if="packIsLocal(pack)">
          Delete
        </button>
      </div>
    </div>
  </div>
  <div v-for="[key, pack] in globalCardPacks.loadedPacks.value" :key="key">
    <h1>{{ key }}</h1>
    <div v-for="[abbrev, p] in sortedPackContents(pack)" :key="abbrev">
      <div>
        <input
          type="checkbox"
          :checked="
            selectedPacks &&
            selectedPacks.has(key) &&
            selectedPacks.get(key)!.has(abbrev)
          "
          @change="togglePack(key, abbrev)"
        />
        {{ p.name }}
        <span class="text-gray-500 text-xs" v-if="p.official">(Official)</span>
      </div>
    </div>
  </div>
</template>
