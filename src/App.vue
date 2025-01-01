<script setup lang="ts">
import { ref } from 'vue'
import CardDeck from './components/CardDeck.vue'
import Homepage, { type SubmitData } from './components/Homepage.vue'

const submittedData = ref<SubmitData | null>(null)

const submitted = ref(false)

function submit(data: SubmitData) {
  submittedData.value = data
  submitted.value = true
}
</script>

<template>
  <Homepage v-if="submittedData === null" @submit="submit" />
  <CardDeck
    v-else
    :seed="submittedData.seed"
    :nPeople="submittedData.nPeople"
    :idxPerson="submittedData.idxPerson"
    :cardPerPerson="submittedData.cardPerPerson"
  />
</template>

<style scoped></style>
