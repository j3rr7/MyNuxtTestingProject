<script setup lang="ts"></script>

<template>
  <header
    class="border-b border-gray-200 dark:border-gray-800 transition-colors duration-200"
  >
    <UContainer class="py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <!-- Brand / Title -->
        <NuxtLink
          to="/"
          class="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          aria-label="Home"
        >
          Saleswatch Internal Tools
        </NuxtLink>

        <!-- Right-side actions -->
        <div class="flex items-center gap-2">
          <ColorModeButton />

          <!-- Logout Button -->
          <AuthState v-slot="{ loggedIn, clear }">
            <UButton
              v-if="loggedIn"
              size="sm"
              color="error"
              variant="soft"
              @click="
                async () => {
                  await clear();
                  await navigateTo('/login');
                }
              "
            >
              <UIcon name="i-lucide-log-out" class="mr-1" />
              Logout
            </UButton>
          </AuthState>
        </div>
      </div>
    </UContainer>
  </header>
</template>
