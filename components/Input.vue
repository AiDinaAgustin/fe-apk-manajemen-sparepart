<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    @input="(event) => emit('update:modelValue', event.target.value)"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
  />
</template>
