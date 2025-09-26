<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "blank",
});

const schema = z.object({
  token: z.string().min(1),
});
type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  token: "",
});

const toast = useToast();
const paired = ref(false);
const message = ref("Waiting for pairing...");
const timer = ref(300); // seconds
const tokenQr = ref(""); // will hold keyuri

// QR as base64 image data computed from tokenQr via useQrcode
const qrBase64 = ref<string | null>(null);
let qrStopper: (() => void) | null = null;
watch(
  tokenQr,
  async (val) => {
    if (!val) {
      qrBase64.value = null;
      return;
    }
    // useQrcode returns a stop + reactive ref depending on implementation; call it each time
    try {
      const q = useQrcode(val, { toBase64: true });
      // q may be a ref<string> or a computed string; copy its value
      qrBase64.value = (q as any).value ?? null;
      // if the composable returns a stop function, call it on change
      if (qrStopper) {
        try { qrStopper(); } catch {}
        qrStopper = null;
      }
      if ((q as any).stop) qrStopper = (q as any).stop;
    } catch (e) {
      console.error("QR generation failed", e);
      qrBase64.value = null;
    }
  },
  { immediate: true }
);

const formattedTime = computed(() => {
  const mins = Math.floor(timer.value / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timer.value % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
});

let intervalId: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  intervalId = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      message.value = "Token expired. Refresh to generate a new one.";
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (qrStopper) {
    try { qrStopper(); } catch {}
    qrStopper = null;
  }
});

// Lazy fetch factory; call it to request a token
const { data, pending, error, execute } = await useFetch("/api/token", {
  lazy: true,
  server: false,
  method: "POST",
  // If your API needs a body, pass it when calling execute()
});

watch(
  () => data.value,
  (val) => {
    if (val && (val as any).keyuri) {
      tokenQr.value = (val as any).keyuri;
      message.value = "Scan the QR or enter the token below.";
    }
  }
);

if (error?.value) {
  message.value = "Failed to generate token. Please refresh.";
  console.error(error.value);
}

// Kick off token generation immediately (remove if you want user-triggered)
execute().catch((e) => {
  console.error("Failed to execute token fetch", e);
  message.value = "Failed to generate token. Please refresh.";
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // event.data contains validated values
  console.log("[onSubmit]", event.data);
  toast.add({
    title: "Pairing...",
    description: "Please wait for pairing to complete.",
  });

  // Example: POST token to verify pairing (adjust endpoint as needed)
  try {
    const res = await $fetch("/api/verify", {
      method: "POST",
      body: { token: event.data.token },
    });
    paired.value = true;
    message.value = "Paired successfully!";
  } catch (e) {
    paired.value = false;
    message.value = "Pairing failed. Check token and try again.";
    console.error(e);
  }
}
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6">
    <div class="w-full max-w-3xl bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10 text-slate-100">
      <!-- Title & Description -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold">
          Scan the QR or insert your token here
        </h2>
        <p class="text-sm text-slate-300 mt-2">
          Connect your device by scanning the code or entering the token
          manually.
        </p>
      </div>

      <div class="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div class="flex flex-col items-center">
          <img v-if="qrBase64" :src="qrBase64" class="w-48 h-48 object-contain" alt="QR Code" />
          <div v-else class="w-48 h-48 bg-slate-700/30 flex items-center justify-center text-xs text-slate-400">
            No QR available
          </div>
          <p class="mt-3 text-xs text-slate-400">Scan this QR code</p>
        </div>

        <!-- Right: Token Input -->
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full md:w-auto mt-4 md:mt-0">
          <div class="w-full">
            <label for="token-input" class="block text-sm font-medium mb-2">Enter your token</label>
            <input id="token-input" type="hidden" name="token" />

            <UInput v-model="state.token" size="xl" type="text" variant="outline" placeholder="e.g. ABC-123"
              :disabled="timer <= 0" />

            <p class="mt-2 text-xs text-slate-400">
              Expires in
              <span id="pair-timer" class="font-mono">{{ formattedTime }}</span>
            </p>

            <div class="mt-4">
              <UButton type="submit" :disabled="!state.token || timer <= 0">Pair</UButton>
            </div>
          </div>
        </UForm>
      </div>

      <!-- Status Message -->
      <div id="pair-status" class="mt-8 p-3 bg-slate-800/50 rounded-lg text-sm text-center"
        :class="{ 'text-green-300': paired, 'text-slate-300': !paired }" aria-live="polite">
        {{ message }}
      </div>
    </div>
  </section>
</template>
