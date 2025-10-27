<script setup lang="ts">

definePageMeta({
  middleware: ["qr"],
})

const { data, refresh } = await useFetch<{ token: string; otp?: string }>("/api/qr", { method: "GET" });

const qr = useQrcode(data.value?.token as string, {
  toBase64: true,
});
const intervalId = setInterval(refresh, 5000);

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center w-4/5 h-4/5 mx-auto">
    <div class="shadow-lg rounded-lg p-6 text-center bg-accented">
      <h1 class="text-2xl font-semibold mb-4">Scan the QR Code</h1>
      <img class="w-48 h-auto mx-auto rounded shadow-md mb-4" :src="qr" alt="QR Code">
      
      <div v-if="data?.otp" class="p-4 mb-4 rounded">
        <p class="font-medium">{{ data?.otp }}</p>
      </div>
      
      <button class="mt-4 px-4 py-2 rounded transition duration-300" @click="() => refresh()">
        Rescan
      </button>
    </div>
  </div>
</template>