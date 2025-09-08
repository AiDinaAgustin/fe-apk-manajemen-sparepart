<script setup>
import { onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite";
import { initFlowbite } from "flowbite";

const yearSuffix = new Date().getFullYear();

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
});
</script>

<template>
  <footer class="bg-white shadow-sm dark:bg-gray-800">
    <div
      class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"
    >
      <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        © {{ yearSuffix }}
        <span class="font-medium">Manajemen Sparepart</span>. All Rights
        Reserved.
      </span>
      <ul
        class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0"
      >
        <li>
          <NuxtLink to="/dashboard" class="hover:underline me-4 md:me-6"
            >Dashboard</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/users" class="hover:underline me-4 md:me-6"
            >Users</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/spareparts" class="hover:underline me-4 md:me-6"
            >Spareparts</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/transactions" class="hover:underline"
            >Transactions</NuxtLink
          >
        </li>
      </ul>
    </div>
  </footer>
</template>
