<script setup>
import { onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite";
import { initFlowbite } from "flowbite";
import { useAuthApi } from "/composables/useAuth";

const { logout } = useAuthApi();

const navLinks = [
  { text: "Dashboard", to: "/dashboard", current: true },
  { text: "Users", to: "/users", current: false },
  { text: "Spareparts", to: "/spareparts", current: false },
  { text: "Transactions", to: "/transactions", current: false },
  { text: "Reports", to: "/reports", current: false },
];

const handleLogout = async () => {
  try {
    await logout();
    navigateTo("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    const tokenCookie = useCookie("access_token");
    tokenCookie.value = null;
    navigateTo("/login");
  }
};

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
});
</script>

<template>
  <nav class="border-gray-200 bg-primary">
    <div
      class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
    >
      <NuxtLink
        to="/dashboard"
        class="flex items-center space-x-3 rtl:space-x-reverse"
      >
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          class="h-8"
          alt="Sparepart Logo"
        />
        <span
          class="self-center text-2xl font-semibold whitespace-nowrap text-white"
        >
          Manajemen Sparepart
        </span>
      </NuxtLink>
      <button
        data-collapse-toggle="navbar-default"
        type="button"
        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-controls="navbar-default"
        aria-expanded="false"
      >
        <span class="sr-only">Open main menu</span>
        <svg
          class="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 17 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>
      <div class="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul
          class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-primary md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="block py-2 px-3 text-white rounded-sm hover:bg-secondary hover:text-white md:text-white md:hover:bg-secondary md:hover:rounded md:py-1 md:px-2 hover:underline hover:underline-offset-8"
              :aria-current="link.current ? 'page' : undefined"
            >
              {{ link.text }}
            </NuxtLink>
          </li>
          <li>
            <button
              @click="handleLogout"
              class="block py-2 px-3 text-white rounded-sm hover:bg-red-600 hover:text-white md:text-white md:hover:bg-red-700 md:hover:rounded md:py-1 md:px-2"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
