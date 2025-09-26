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
        </div>
      </div>
    </UContainer>
  </header>
</template>