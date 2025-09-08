<script setup>
import { ref, onMounted } from "vue";
import { useAuthApi } from "/composables/useAuth";
import { getGreeting, formatCurrentDate } from "/utils/helper";

useHead({
  title: "Dashboard",
});

const { getUser, hasPermission } = useAuthApi();
const userName = ref("Admin");
const currentTime = ref("");
const userRole = ref("");
const greeting = ref(getGreeting());

onMounted(() => {
  const userData = getUser();
  if (userData && userData.name) {
    userName.value = userData.name;
  }

  const userCookie = useCookie("user_roles");
  if (userCookie.value && userCookie.value.length > 0) {
    userRole.value = userCookie.value[0];
  }

  currentTime.value = formatCurrentDate();
});
</script>

<template>
  <NuxtLayout name="protected">
    <template #header />
    <section class="max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8 my-6">
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

      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>
