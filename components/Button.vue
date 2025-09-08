<script setup>
defineProps({});
</script>

<template>
  <button
    v-bind="$attrs"
    class="font-medium rounded-lg text-sm px-5 py-2.5 text-white bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary"
  >
    <slot />
  </button>
</template>
