<script setup>
import Auth from "/layouts/auth.vue";
import { ref } from "vue";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Login",
});

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const { login } = useAuthApi();

const handleSubmit = async () => {
  errorMsg.value = "";
  try {
    await login({
      email: email.value,
      password: password.value,
    });
    navigateTo("/dashboard");
  } catch (error) {
    errorMsg.value = error.message;
    console.error("Login failed", error);
  }
};
</script>

<template>
  <Auth>
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div>
        <Label for="email">E-mail</Label>
        <Input
          v-model="email"
          type="email"
          name="email"
          id="email"
          placeholder="email"
          required
        />
      </div>
      <div>
        <Label for="password">Password</Label>
        <Input
          v-model="password"
          type="password"
          name="password"
          id="password"
          placeholder="*****"
          required
        />
      </div>
      <Button type="submit" class="w-full">Login</Button>
    </form>
  </Auth>
</template>
