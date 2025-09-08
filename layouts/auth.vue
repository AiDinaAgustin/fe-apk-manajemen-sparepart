<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <div
      class="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-white text-black p-6 md:p-8"
    >
      <div class="text-center md:text-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold">
          Aplikasi Manajemen Sparepart
        </h2>
        <p class="text-lg mt-3 mb-6">
          Buat Semua jadi <span class="text-blue-600 font-medium">mudah</span>
        </p>
      </div>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzYzjcdfYIe5GiQEX5SpGOs3Uq9DQMfEJkUw&s"
        alt="Gambar Mobil"
        class="mb-6 max-w-xs w-full"
      />
    </div>
    <div
      class="w-full md:w-1/2 flex-1 flex items-center justify-center pt-2 md:pt-6 px-6 pb-6 md:p-8 bg-white"
    >
      <section class="w-full max-w-md">
        <slot />
      </section>
    </div>
  </div>
</template>
