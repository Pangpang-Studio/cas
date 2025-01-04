<script setup lang="ts">
import { ref } from 'vue'
import Input from './Input.vue'
import { useRouter } from 'vue-router'
import CardPackList from './CardPackSelector.vue'
import type { RawPackSelection } from '../cah'

export interface SubmitData {
  seed: string
  nPeople: number
  idxPerson: number
  cardPerPerson: number
}

const seed = ref<string>('')
const nPeople = ref<number>(4)
const idxPerson = ref<number>(0)
const cardPerPerson = ref<number>(10)

const router = useRouter()

function submit() {
  const submittedData = {
    seed: seed.value as string,
    nPeople: nPeople.value as number,
    cardPerPerson: cardPerPerson.value as number,
    idxPerson: (idxPerson.value as number) % (nPeople.value as number),
    cardSelection: JSON.stringify(cardSelection.value),
  }
  router.push({ name: 'game', query: submittedData })
}

function randomSeed() {
  seed.value = Math.random().toString(36).substring(2, 7).toUpperCase()
}

const authors = [
  {
    name: 'Rynco Maekawa',
    link: 'https://github.com/lynzrand',
  },
  {
    name: 'Rami3L',
    link: 'https://github.com/rami3l',
  },
  { name: 'Icecovery', link: 'https://github.com/icecovery' },
]

const cardSelection = ref<RawPackSelection[]>([])
</script>

<template>
  <div class="container flex flex-col min-h-full justify-center items-center">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h1 class="text-3xl font-bold">Cards Against Synchronicity</h1>
        <p>
          A Cards Against Humanity implementation for offline parties, without
          the need of a central server to coordinate the game. This webpage
          serves as your card deck.
        </p>
        <p>Best played on phones.</p>
        <div class="text-sm text-gray-500">
          <p>
            <a href="https://github.com/lynzrand/cards-against-synchronicity"
              >Source code</a
            >
          </p>
          <p>
            Made by
            <template v-for="(author, i) in authors" :key="i">
              <a :href="author.link">{{ author.name }}</a
              >{{ i < authors.length - 1 ? ', ' : '' }}
            </template>
          </p>
        </div>
      </div>
      <div class="flex flex-col space-y-4 md:pt-20">
        <h2 class="text-2xl font-bold">Card Pack Selector</h2>
        <CardPackList v-model="cardSelection" />
        <h2 class="text-2xl font-bold">Various Tweakable Parameters</h2>
        <div class="flex gap-2 justify-between items-end">
          <Input v-model="seed" label="Random seed" class="flex-grow" />
          <button
            @click="randomSeed"
            class="dice-button py-2.5 px-3 bg-gray-600 hover:bg-gray-700 rounded-md"
          >
            <span>🎲</span>
          </button>
        </div>
        <Input v-model="nPeople" label="Number of people" />
        <Input v-model="idxPerson" label="Your index within people" />
        <Input v-model="cardPerPerson" label="Number of cards per person" />
        <button
          @click="submit"
          class="self-stretch p-4 bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Go
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input {
  @apply bg-black border-2 border-gray-500 focus:border-white text-white p-2 rounded-md;
}

.dice-button span {
  @apply inline-block transition-transform duration-300 rotate-[360deg];
}

.dice-button:active span {
  @apply rotate-0 duration-0;
}
</style>
