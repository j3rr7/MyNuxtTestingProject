<script setup lang="ts">
const { loggedIn } = useUserSession()

const logout = async () => {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  } finally {
    // Safety measure in case logout redirection fails
    await navigateTo({ path: "/login" }, { replace: true });
  }
}
</script>

<template>
  <header class="border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
    <UContainer class="py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <!-- Brand / Title -->
        <NuxtLink 
          to="/"
          class="text-xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
          aria-label="Home">
          Internal Tools
        </NuxtLink>

        <!-- Right-side actions -->
        <div class="flex items-center gap-2">
          <ColorModeButton />

          <!-- Logout Button -->
          <UButton v-if="loggedIn" size="sm" color="error" variant="soft" @click="logout">
            <UIcon name="i-lucide-log-out" class="mr-1" />
            Logout
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>
