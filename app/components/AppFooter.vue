<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="px-6 py-4">
    <div class="flex flex-col items-center justify-center text-center space-y-2">
      <div class="flex items-center gap-1">
        <UAvatar
          src="/app.webp"
          alt="Logo"
          size="xs"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">
          © {{ year }} by SSS. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
</template>