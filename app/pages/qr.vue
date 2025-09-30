<script setup lang="ts">
const { data } = await useFetch<{ token: string }>("/api/token", {
  lazy: true,
  method: "POST"
});

const key = computed(() => data.value?.token || "");

definePageMeta({
  layout: "blank",
  auth: false
})

</script>

<template>
  <div class="min-h-[240px] flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-sm backdrop-blur-sm rounded-xl shadow-md ring-1 ring-slate-200 dark:ring-slate-700 p-6">
      <h2 class="text-center text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Administrator Key
      </h2>

      <p class="text-center text-sm text-slate-500 dark:text-slate-300 mb-4">
        Scan the QR code to get administrator access
      </p>

      <div class="flex items-center justify-center mb-4">
        <div class="w-[160px] h-[160px] sm:w-44 sm:h-44 md:w-56 md:h-56 p-2 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center">
          <Qrcode :value="key" />
        </div>
      </div>
    </div>
  </div>
</template>