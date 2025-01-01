<script setup lang="ts">
import { ref } from 'vue'
import { Deck, Game, loadPack } from '../cah'

const props = defineProps<{
  seed: string
  nPeople: number
  idxPerson: number
  cardPerPerson: number
}>()

let deck: Deck | null = null
let game: Game | null = null
const loaded = ref(false)

loadPack().then((pack) => {
  console.log(pack)

  deck = new Deck(
    pack.black,
    pack.white,
    props.seed,
    props.nPeople,
    props.idxPerson
  )

  game = new Game(deck, props.cardPerPerson)

  loaded.value = true
})

const selectedIndices = ref<number[]>([])

function selectCard(i: number) {
  let pickCount = game!.blackCard.value.pick
  if (selectedIndices.value.includes(i)) {
    selectedIndices.value = selectedIndices.value.filter((j) => j !== i)
  } else {
    selectedIndices.value.push(i)
    while (selectedIndices.value.length > pickCount) {
      selectedIndices.value.shift()
    }
  }
}

function cardSelectIdx(i: number) {
  return selectedIndices.value.indexOf(i)
}

const submitMode = ref(false)

function submit() {
  if (selectedIndices.value.length !== game!.blackCard.value.pick) {
    alert('Please select ' + game!.blackCard.value.pick + ' cards.')
    return
  }
  submitMode.value = true
}

function goToNextRound() {
  submitMode.value = false
  game!.submitCards(selectedIndices.value)
  selectedIndices.value = []
  game!.drawBlack()
}

function formatCard(card: string) {
  return card.replace(/_/g, '______')
}
</script>

<template>
  <template v-if="loaded && game">
    <div class="container flex flex-col h-full" v-if="submitMode === false">
      <!-- Black card -->
      <div class="px-4 py-8 flex flex-col">
        <div class="text-xl md:text-2xl">
          {{ formatCard(game.blackCard.value.text) }}
        </div>
        <!-- Pick N -->
        <div class="font-bold mt-2" v-if="game.blackCard.value.pick > 1">
          Pick {{ game.blackCard.value.pick }}
        </div>
      </div>
      <div
        class="flex-1 overflow-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mx-2 md:mx-4 md:gap-4"
      >
        <template v-for="(card, i) in game.whiteCards.value" :key="i">
          <div
            class="p-4 pb-6 rounded-lg text-black flex flex-row md:text-xl transition-colors cursor-pointer"
            :class="{
              'bg-gray-300': selectedIndices.includes(i),
              'bg-white': !selectedIndices.includes(i),
            }"
            @click="selectCard(i)"
          >
            <div class="grow-[5] basis-0 min-h-10 md:min-h-15">
              {{ card }}
            </div>
            <div class="grow-[1] basis-0 flex justify-end items-start">
              <template v-if="cardSelectIdx(i) !== -1">
                <div
                  class="bg-black text-white rounded-full flex justify-center items-center font-bold text-sm w-6 h-6 md:text-base md:w-6 md:h-6"
                >
                  {{ cardSelectIdx(i) + 1 }}
                </div></template
              >
            </div>
          </div>
        </template>
      </div>
      <div class="btn-row">
        <button
          @click="submit"
          class="basis-0 flex-1 bg-blue-700 hover:bg-blue-800"
        >
          Submit
        </button>
        <button
          @click="goToNextRound"
          class="basis-0 flex-1 bg-gray-700 hover:bg-gray-500"
        >
          Next round
        </button>
      </div>
    </div>
    <div class="container flex flex-col h-full" v-else>
      <!-- Show submitted cards -->
      <div class="bg-black px-4 py-8 text-xl md:text-3xl bold">
        {{ formatCard(game.blackCard.value.text) }}
      </div>
      <div
        class="flex-1 overflow-scroll flex flex-col gap-2 mx-2 md:mx-4 md:gap-4"
      >
        <template v-for="(idx, i) in selectedIndices" :key="idx">
          <div
            class="bg-white p-4 md:p-8 rounded-lg text-black text-3xl md:text-4xl font-bold min-h-40 grow flex-shrink-0 flex flex-col"
          >
            <div class="flex-1">
              {{ game.whiteCards.value[idx] }}
            </div>

            <!-- Author info -->
            <div
              class="text-xs text-gray-500 font-normal"
              v-if="i === selectedIndices.length - 1"
            >
              cas.rynco.me
            </div>
          </div>
        </template>
      </div>
      <div class="btn-row">
        <button
          @click="goToNextRound"
          class="basis-0 flex-1 bg-gray-700 hover:bg-gray-500 rounded-md"
        >
          Next round
        </button>
      </div>
    </div>
  </template>

  <template v-else>
    <div>Loading...</div>
  </template>
</template>

<style scoped>
.btn-row {
  @apply flex flex-row p-2 mt-2 gap-2 md:p-4 md:gap-4;
}
</style>
