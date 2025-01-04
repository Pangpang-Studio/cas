<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  CardPack,
  CompactCardPackCollection,
  PackSelection,
  RawPackSelection,
} from '../cah'
import {
  globalCardPacks,
  preexistingCardPacks,
  type CardPackSource,
} from '../cardPackManager'
import { Dialog, DialogPanel } from '@headlessui/vue'
import Input from './Input.vue'

function downloadPack(pack: CardPackSource) {
  globalCardPacks.downloadPack(pack)
}

function packIsLocal(pack: CardPackSource) {
  return globalCardPacks.loadedPacks.value.has(pack.name)
}

function deletePack(pack: CardPackSource) {
  globalCardPacks.deletePack(pack.name)
}

const customCardPackName = ref('')
const customCardPackUrl = ref('')

const submittedSelectedPacks = defineModel<RawPackSelection[]>()
const selectedPacks = reactive<Map<string, Set<string>>>(new Map())

const dialogOpen = ref(false)

const selectedCardPackCount = computed(() => {
  let count = 0
  for (const pack of selectedPacks.values()) {
    count += pack.size
  }
  return count
})

watch(submittedSelectedPacks, (newSelections) => {
  selectedPacks.clear()
  if (newSelections === null || newSelections === undefined) {
    return
  }

  for (const { packCollection, pack } of newSelections) {
    if (!selectedPacks.has(packCollection)) {
      selectedPacks.set(packCollection, new Set())
    }
    selectedPacks.get(packCollection)!.add(pack)
  }
})

function submit() {
  const selection: RawPackSelection[] = []
  for (const [packCollection, packSet] of selectedPacks) {
    for (const pack of packSet) {
      selection.push({ packCollection, pack })
    }
  }
  submittedSelectedPacks.value = selection
  dialogOpen.value = false
}

function togglePack(pack: string, card: string) {
  if (!selectedPacks.has(pack)) {
    selectedPacks.set(pack, new Set())
  }
  const packSet = selectedPacks.get(pack)!
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

const totalSelectedBlackCardCount = computed(() => {
  let count = 0
  for (const [collName, packs] of selectedPacks.entries()) {
    let c = globalCardPacks.loadedPacks.value.get(collName)
    if (c) {
      for (const pack of packs) {
        if (pack in c.packs) count += c.packs[pack].black.length
      }
    }
  }
  return count
})

const totalSelectedWhiteCardCount = computed(() => {
  let count = 0
  for (const [collName, packs] of selectedPacks.entries()) {
    let c = globalCardPacks.loadedPacks.value.get(collName)
    if (c) {
      for (const pack of packs) {
        if (pack in c.packs) count += c.packs[pack].white.length
      }
    }
  }
  return count
})
</script>

<template>
  <div>
    <template v-if="selectedCardPackCount > 0">
      <p>{{ selectedCardPackCount }} pack(s) selected.</p>
      <p>
        That's {{ totalSelectedWhiteCardCount }} white cards and
        {{ totalSelectedBlackCardCount }} black cards.
      </p>
    </template>
    <p v-else>No pack selected</p>

    <button @click="dialogOpen = true">Select packs</button>
  </div>
  <Dialog :open="dialogOpen" @close="() => (dialogOpen = false)">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-gray-500/30" aria-hidden="true" />

    <div class="fixed inset-0 w-screen overflow-y-auto">
      <DialogPanel
        class="container space-y-4 p-4 my-2 md:my-6 bg-black rounded-md border-2 border-white grid grid-cols-4 gap-4"
      >
        <div class="col-span-4 md:col-span-3">
          <!-- Card pack downloader -->
          <div>
            <h2 class="text-xl font-bold">Downloadable Card Packs</h2>
            <div
              v-for="pack in preexistingCardPacks"
              :key="pack.name"
              class="flex flex-row items-baseline gap-2"
            >
              <div class="grow">
                {{ pack.name }}
              </div>

              <button @click="downloadPack(pack)">
                {{ packIsLocal(pack) ? 'Redownload' : 'Download' }}
              </button>
              <button @click="deletePack(pack)" v-if="packIsLocal(pack)">
                Delete
              </button>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-bold">Download Custom Card Pack</h3>
              <div class="flex flex-row gap-2">
                <Input v-model="customCardPackName" label="Name" class="grow" />
                <Input v-model="customCardPackUrl" label="URL" class="grow" />
                <button
                  @click="
                    globalCardPacks.downloadPack({
                      name: customCardPackName,
                      url: customCardPackUrl,
                    })
                  "
                >
                  Download
                </button>
              </div>
            </div>
          </div>
          <div
            v-for="[key, pack] in globalCardPacks.loadedPacks.value"
            :key="key"
          >
            <h2 class="text-xl font-bold pt-2">{{ key }}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
              <div
                v-for="[abbrev, p] in sortedPackContents(pack)"
                :key="abbrev"
                class="flex flex-row items-baseline gap-1"
              >
                <input
                  type="checkbox"
                  :checked="
                    selectedPacks &&
                    selectedPacks.has(key) &&
                    selectedPacks.get(key)!.has(abbrev)
                  "
                  @change="togglePack(key, abbrev)"
                />
                <span class="text-ellipsis text-nowrap overflow-hidden">
                  {{ p.name }}
                </span>
                <span class="text-gray-500 text-xs" v-if="p.official"
                  >(Official)</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-4 md:col-span-1 h-full">
          <div class="md:sticky md:top-6 flex flex-col gap-2">
            <template v-if="selectedCardPackCount > 0">
              {{ selectedCardPackCount }} pack(s) selected. <br />
              That's {{ totalSelectedWhiteCardCount }} white cards and
              {{ totalSelectedBlackCardCount }} black cards.
            </template>
            <template v-else> No pack selected </template>
            <button @click="submit">Finish</button>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
