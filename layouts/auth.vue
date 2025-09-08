<template>
  <div class="flex min-h-screen">
    <div
      class="w-3/4 flex flex-col justify-center items-center bg-white text-black p-8"
    >
      <h2 class="text-3xl font-bold mb-2">Aplikasi Manajemen</h2>
      <h3 class="text-2xl font-semibold mb-2">Sparepart</h3>
      <p class="text-lg mb-6">
        Buat Semua jadi <span class="text-blue-600">mudah</span>
      </p>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzYzjcdfYIe5GiQEX5SpGOs3Uq9DQMfEJkUw&s"
        alt="Gambar Mobil"
        class="mb-6 max-w-xs w-full"
      />
    </div>
    <div class="w-1/4 flex items-center justify-center p-8 bg-white">
      <section class="w-full max-w-md">
        <slot />
      </section>
    </div>
  </div>
</template>
