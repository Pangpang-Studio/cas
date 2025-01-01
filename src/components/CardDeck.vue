<script setup lang="ts">
import { ref } from "vue";
import { Deck, Game, loadPack } from "../cah";

const props = defineProps<{
  seed: string;
  nPeople: number;
  idxPerson: number;
  cardPerPerson: number;
}>();

let deck: Deck | null = null;
let game: Game | null = null;
const loaded = ref(false);

loadPack().then((pack) => {
  console.log(pack);

  deck = new Deck(
    pack.black,
    pack.white,
    props.seed,
    props.nPeople,
    props.idxPerson
  );

  game = new Game(deck, props.cardPerPerson);

  loaded.value = true;
});

const selectedIndices = ref<number[]>([]);

function selectCard(i: number) {
  let pickCount = game!.blackCard.value.pick;
  if (selectedIndices.value.includes(i)) {
    selectedIndices.value = selectedIndices.value.filter((j) => j !== i);
  } else {
    selectedIndices.value.push(i);
    while (selectedIndices.value.length > pickCount) {
      selectedIndices.value.shift();
    }
  }
}

function cardSelectIdx(i: number) {
  return selectedIndices.value.indexOf(i);
}

const submitMode = ref(false);

function submit() {
  submitMode.value = true;
}

function goToNextRound() {
  submitMode.value = false;
  game!.submitCards(selectedIndices.value);
  selectedIndices.value = [];
  game!.drawBlack();
}

function formatCard(card: string) {
  return card.replace(/_/g, "______");
}
</script>

<template>
  <template v-if="loaded && game">
    <div class="flex flex-col h-full" v-if="submitMode === false">
      <div class="bg-black p-4 rounded-lg text-xl font-bold">
        {{ formatCard(game.blackCard.value.text) }}
      </div>
      <div class="flex-1 overflow-scroll grid grid-cols-1 gap-2 mx-2">
        <template v-for="(card, i) in game.whiteCards.value" :key="i">
          <div
            class="bg-white p-4 rounded-lg text-black grid grid-cols-6 min-h-20"
            :class="{ 'bg-gray-300': selectedIndices.includes(i) }"
            @click="selectCard(i)"
          >
            <div class="col-span-5">
              {{ card }}
            </div>
            <div class="text-sm text-gray-500 col-span-1 text-right">
              <template v-if="cardSelectIdx(i) !== -1">
                ({{ cardSelectIdx(i) + 1 }})
              </template>
            </div>
          </div>
        </template>
      </div>
      <div class="flex flex-row p-2 gap-4">
        <button
          @click="submit"
          class="basis-0 flex-1 bg-blue-700 p-2 rounded-md"
        >
          Submit
        </button>
        <button
          @click="goToNextRound"
          class="basis-0 flex-1 bg-gray-700 p-2 rounded-md"
        >
          Next round
        </button>
      </div>
    </div>
    <div class="flex flex-col h-full" v-else>
      <!-- Show submitted cards -->
      <div class="bg-black p-4 rounded-lg text-lg bold">
        {{ formatCard(game.blackCard.value.text) }}
      </div>
      <div class="flex-1 overflow-scroll flex flex-col gap-2 mx-2">
        <template v-for="idx in selectedIndices" :key="idx">
          <div
            class="bg-white p-4 rounded-lg text-black text-3xl font-bold min-h-40 grow flex-shrink-0"
          >
            {{ game.whiteCards.value[idx] }}
          </div>
        </template>
      </div>
      <div class="p-2 flex flex-row">
        <button
          @click="goToNextRound"
          class="basis-0 flex-1 bg-gray-700 p-2 rounded-md"
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
