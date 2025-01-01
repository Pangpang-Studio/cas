<script setup lang="ts">
const { label, placeholder = '' } = defineProps<{
  label: string
  placeholder?: string
}>()

const model = defineModel()
</script>

<template>
  <div class="flex flex-col gap-1 items-stretch">
    <label>{{ label }}</label>
    <input v-model="model" :placeholder="placeholder" />
  </div>
</template>

<style scoped>
input {
  @apply bg-black border-2 border-gray-500 focus:border-white text-white p-2 rounded-md;
}

label {
  @apply text-white text-sm font-bold;
}
</style>
