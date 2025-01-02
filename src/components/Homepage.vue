<script setup lang="ts">
import { ref } from 'vue'
import Input from './Input.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  seed?: string
  nPeople?: number
  cardPerPerson?: number
}>()

const seed = ref<string>(props.seed ?? '')
const nPeople = ref<number>(props.nPeople ?? 4)
const cardPerPerson = ref<number>(props.cardPerPerson ?? 10)
const idxPerson = ref<number>(0)

const shareButtonTextOverride = ref<string | null>(null)

const router = useRouter()

function submittedData() {
  return {
    seed: seed.value as string,
    nPeople: nPeople.value as number,
    cardPerPerson: cardPerPerson.value as number,
    idxPerson: ((idxPerson.value as number) % (nPeople.value as number)) as
      | number
      | undefined,
  }
}

function submit() {
  router.push({ name: 'game', query: submittedData() })
}

async function shareSetup() {
  if (seed.value === '') {
    randomSeed()
  }
  const data = submittedData()
  delete data.idxPerson
  router.push({ query: data })

  // wait a frame while the URL updates
  requestAnimationFrame(() => {
    let shareUrl = window.location.href

    // Prefer share API if available
    if ('share' in (navigator as any)) {
      let shareObj: ShareData = {
        title: 'Cards Against Synchronicity',
        text: 'Join my game!',
        url: shareUrl,
      }
      navigator.share(shareObj)
      return
    }

    async function showCopied() {
      shareButtonTextOverride.value = 'Copied!'
      setTimeout(() => {
        shareButtonTextOverride.value = null
      }, 3000)
    }

    // Fallback to clipboard
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(shareUrl)
      showCopied()
      return
    }
    // fallback to even older clipboard API
    if ('execCommand' in document) {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy') // deprecated but used for compatibility
      document.body.removeChild(input)
      showCopied()
      return
    }

    alert(
      'Unable to find a good way to share the link. Please manually copy it :)'
    )
  })
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
        <div class="flex gap-2 justify-between items-end">
          <button
            @click="submit"
            class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Play!
          </button>
          <button
            @click="shareSetup"
            title="Share this setup!"
            class="flex-1 py-2.5 bg-gray-600 hover:bg-gray-700 rounded-md"
          >
            <span>{{ shareButtonTextOverride ?? 'Share' }}</span>
          </button>
        </div>
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
