<script setup>
import Navbar from "/components/Navbar.vue";
import Footer from "/components/Footer.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header>
      <slot name="header">
        <Navbar />
      </slot>
    </header>
    <main class="flex-grow">
      <slot />
    </main>
    <footer>
      <slot name="footer">
        <Footer />
      </slot>
    </footer>
  </div>
</template>
