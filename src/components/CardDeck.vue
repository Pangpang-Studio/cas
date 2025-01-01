<script setup lang="ts">
import { onMounted, ref } from "vue";
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

function submit() {
  game!.submitCards(selectedIndices.value);
}

function goToNextRound() {
  game!.drawBlack();
}
</script>

<template>
  <template v-if="loaded && game">
    <div class="bg-black p-4 rounded-lg text-lg bold">
      {{ game.blackCard.value.text }}
    </div>
    <template v-for="(card, i) in game.whiteCards.value" :key="i">
      <div
        class="bg-white p-4 rounded-lg text-black m-4"
        :class="{ 'bg-gray-300': selectedIndices.includes(i) }"
        @click="selectCard(i)"
      >
        {{ card }}
        <template v-if="cardSelectIdx(i) !== -1">
          <div class="text-sm text-gray-500">({{ cardSelectIdx(i) + 1 }})</div>
        </template>
      </div>
    </template>
    <button @click="submit">Submit</button>
    <button @click="goToNextRound">Next round</button>
  </template>
  <template v-else>
    <div>Loading...</div>
  </template>
</template>
