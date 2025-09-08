<script setup>
import { ref, onMounted } from "vue";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Dashboard",
});

const userName = ref("Admin");
const currentTime = ref("");

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

const greeting = ref(getGreeting());

onMounted(() => {
  const user = useCookie("user");
  if (user.value && user.value.name) {
    userName.value = user.value.name;
  }

  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  currentTime.value = now.toLocaleDateString("id-ID", options);
});
</script>

<template>
  <NuxtLayout name="protected">
    <template #header />
    <section class="max-w-7xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-md p-8 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">
              {{ greeting }}, {{ userName }}!
            </h1>
            <p class="text-gray-600 mt-2">{{ currentTime }}</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        </div>
        <p class="text-lg text-gray-700">
          Selamat datang di Aplikasi Manajemen Sparepart. Aplikasi ini akan
          membantu Anda mengelola data pengguna, sparepart, transaksi, dan
          melihat laporan dengan mudah.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <NuxtLink
            to="/users"
            class="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg transition-colors flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-blue-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span class="text-xl font-semibold text-gray-800">Users</span>
          </NuxtLink>

          <NuxtLink
            to="/spareparts"
            class="bg-green-50 hover:bg-green-100 p-6 rounded-lg transition-colors flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-green-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="text-xl font-semibold text-gray-800">Spareparts</span>
          </NuxtLink>

          <NuxtLink
            to="/transactions"
            class="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg transition-colors flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-purple-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span class="text-xl font-semibold text-gray-800"
              >Transactions</span
            >
          </NuxtLink>

          <NuxtLink
            to="/reports"
            class="bg-yellow-50 hover:bg-yellow-100 p-6 rounded-lg transition-colors flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-yellow-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span class="text-xl font-semibold text-gray-800">Reports</span>
          </NuxtLink>
        </div>
      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>
