<script setup lang="ts">
import { ref } from "vue";
import CardDeck from "./components/CardDeck.vue";

const seed = ref<string | null>(null);
const nPeople = ref<number | null>(null);
const idxPerson = ref<number | null>(null);
const cardPerPerson = ref<number | null>(null);

const submittedData = ref<{
  seed: string;
  nPeople: number;
  idxPerson: number;
  cardPerPerson: number;
} | null>(null);

const submitted = ref(false);

function submit() {
  submittedData.value = {
    seed: seed.value as string,
    nPeople: nPeople.value as number,
    idxPerson: (idxPerson.value as number) % (nPeople.value as number),
    cardPerPerson: cardPerPerson.value as number,
  };
  submitted.value = true;
}
</script>

<template>
  <div
    v-if="submittedData === null"
    class="flex flex-col gap-2 justify-center align-center"
  >
    <input v-model="seed" placeholder="Enter seed" />
    <input v-model="nPeople" placeholder="Enter number of people" />
    <input v-model="idxPerson" placeholder="Enter index of person " />
    <input
      v-model="cardPerPerson"
      placeholder="Enter number of cards per person"
    />
    <button @click="submit">Submit</button>
  </div>
  <CardDeck
    v-else
    :seed="submittedData.seed"
    :nPeople="submittedData.nPeople"
    :idxPerson="submittedData.idxPerson"
    :cardPerPerson="submittedData.cardPerPerson"
  />
</template>

<style scoped>
input {
  @apply bg-black text-white p-2 rounded-lg;
}
</style>
