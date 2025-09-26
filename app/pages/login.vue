<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "blank",
});

const schema = z.object({
  token: z.string().min(1, "Token is required"),
});
type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  token: "",
});

const toast = useToast();
const paired = ref(false);
const loading = ref(false);
const message = ref("Waiting for pairing...");

const name = ref("");
const nameSubmitted = ref(false);

const open = ref(false);
defineShortcuts({
  o: () => (open.value = !open.value),
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  paired.value = false;
  message.value = "Verifying token...";

  try {
    const res = await $fetch("/api/verify", {
      method: "POST",
      body: { token: event.data.token },
    });
    if (res.result) {
      paired.value = true;
      message.value = "Paired successfully! Please wait for a moment.";
      toast.add({
        title: "Success!",
        description: "Device paired successfully.",
        icon: "i-heroicons-check-circle",
        color: "success",
      });
      // open modal to ask for name
      open.value = true;
    } else {
      throw new Error("Invalid token");
    }
  } catch (e) {
    paired.value = false;
    message.value = "Pairing failed. Please check your token and try again.";
    toast.add({
      title: "Failed",
      description: "Invalid token or server error. Please try again.",
      icon: "i-heroicons-x-circle",
      color: "error",
    });
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function onNameSubmit() {
  if (!name.value.trim()) {
    toast.add({ title: "Name required", description: "Please enter a name.", color: "error", icon: "i-heroicons-x-circle" });
    return;
  }
  try {
    await $fetch("/api/save-name", { method: "POST", body: { name: name.value } });
    nameSubmitted.value = true;
    open.value = false; // close modal
    toast.add({ title: "Name saved", description: "Name saved successfully.", color: "success", icon: "i-heroicons-check-circle" });
  } catch (e) {
    toast.add({ title: "Save failed", description: "Could not save name.", color: "error", icon: "i-heroicons-x-circle" });
    console.error(e);
  }
}
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-6">
    <UCard
      class="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 text-slate-100 transition-all duration-300 hover:shadow-3xl">
      <!-- Header with Icon -->
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-8 h-8 text-blue-300" />
        </div>
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Token Pairing
        </h1>
        <p class="text-sm text-slate-400">
          Securely connect by entering the pairing token.
        </p>
      </div>

      <!-- Form -->
      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UInput v-model="state.token" :disabled="loading" size="lg" type="text" variant="soft" color="neutral"
          placeholder="e.g. ABC-123-XYZ" class="text-lg font-mono tracking-wider w-full"
          :class="{ 'opacity-50 cursor-not-allowed': loading }" />

        <UButton type="submit" :loading="loading" :disabled="!state.token || loading" size="lg" color="primary"
          variant="solid" class="w-full text-lg" :class="{ 'cursor-not-allowed': loading }">
          <template #leading>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 font-semibold" />
          </template>
          Pair Token
        </UButton>
      </UForm>

      <!-- Status Indicator -->
      <div id="pair-status" class="mt-6 p-4 bg-slate-800/30 rounded-2xl text-center transition-all duration-500" :class="[
        {
          'bg-green-500/20 border border-green-500/30 text-green-300 animate-pulse': paired,
          'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300': loading,
          'bg-slate-800/50 border border-slate-700/50 text-slate-400': !paired && !loading,
        }
      ]" aria-live="polite">

        <div v-if="loading" class="flex items-center justify-center space-x-2">
          <UProgress />
          <span>{{ message }}</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2">
          <UIcon :name="paired ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" :class="[
            paired ? 'w-5 h-5 text-green-400' : 'w-5 h-5 text-slate-400'
          ]" />
          <span>{{ message }}</span>
        </div>
      </div>

      <!-- Optional: show saved name -->
      <div v-if="nameSubmitted" class="mt-4 text-sm text-green-300">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 inline mr-2" /> Name saved: <strong
          class="ml-1 text-white">{{ name }}</strong>
      </div>
    </UCard>

    <!-- Modal for device name -->
    <UModal v-model:open="open">
      <!-- If your UModal requires a trigger, leave blank or remove -->
      <template #content>
        <div class="p-6 w-full max-w-md bg-slate-900 text-slate-100 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Name this device</h2>
          <p class="text-sm text-slate-400 mb-4">Enter a friendly name to identify this device.</p>

          <UInput v-model="name" placeholder="Device name" size="lg" variant="soft" color="neutral" class="w-full mb-4" />

          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="() => (open = false)">Cancel</UButton>
            <UButton color="primary" :disabled="!name.trim()" @click="onNameSubmit">Save</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>
