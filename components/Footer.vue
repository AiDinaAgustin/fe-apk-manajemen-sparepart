<script setup>
import { onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite";
import { initFlowbite } from "flowbite";

const yearSuffix = new Date().getFullYear();
const navLinks = [
  { text: "Dashboard", to: "/dashboard" },
  { text: "Users", to: "/users" },
  { text: "Spareparts", to: "/spareparts" },
  { text: "Transactions", to: "/transactions" },
];

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
});
</script>

<template>
  <footer class="bg-primary shadow-sm mt-auto">
    <div
      class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"
    >
      <span class="text-sm text-white sm:text-center">
        © {{ yearSuffix }}
        <span class="font-medium">Manajemen Sparepart</span>. All Rights
        Reserved.
      </span>
      <ul
        class="flex flex-wrap items-center mt-3 text-sm font-medium text-white sm:mt-0"
      >
        <li v-for="(link, index) in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="hover:underline hover:text-secondary"
            :class="{ 'me-4 md:me-6': index !== navLinks.length - 1 }"
          >
            {{ link.text }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>
