<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, Form } from "@nuxt/ui";

definePageMeta({
  layout: "blank",
  auth: false,
});

const { fetch: refreshSession } = useUserSession();

const currentStep = ref(1); // 1: Token Entry, 2: Name Entry, 3: Success
const loading = ref(false);

const nameInputRef = ref<HTMLInputElement | null>(null);
const tokenFormRef = ref<Form<TokenSchema> | null>(null);
const toast = useToast();

const verifyToken = ref("");

const tokenSchema = z.object({
  token: z
    .string()
    .transform((val) => val.replace(/-/g, ""))
    .pipe(z.string().length(6, "Enter the 6-character code from your device.")),
});
type TokenSchema = z.output<typeof tokenSchema>;

const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter a name.")
    .max(50, "Name must be 50 characters or less.")
    .regex(/^[a-zA-Z0-9\s'-]+$/, "Name contains invalid characters."),
});
type NameSchema = z.output<typeof nameSchema>;

const state = reactive({
  token: "",
  name: "",
});

async function handleTokenSubmit(event: FormSubmitEvent<TokenSchema>) {
  loading.value = true;
  try {
    const res = await $fetch<{ result: boolean; token?: string }>(
      "/api/verify",
      {
        method: "POST",
        body: { token: event.data.token },
      }
    );

    if (res.result && res.token) {
      verifyToken.value = res.token;

      toast.add({
        title: "Code Verified!",
        icon: "i-heroicons-check-circle-solid",
        color: "success",
      });
      currentStep.value = 2;
      // Move focus to the name input on the next screen
      await nextTick();
      nameInputRef.value?.focus();
    } else {
      throw new Error("The code is invalid or has expired.");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.add({
      title: "Verification Failed",
      description: error.message || "Please check the code and try again.",
      icon: "i-heroicons-x-circle-solid",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function handleNameSubmit(event: FormSubmitEvent<NameSchema>) {
  loading.value = true;
  try {
    const res = await $fetch("/api/request-access", {
      method: "POST",
      body: { name: event.data.name, token: verifyToken.value },
    });
    // toast.add({
    //   title: 'Pairing Complete!',
    //   description: `Device '${event.data.name}' is now connected.`,
    //   icon: 'i-heroicons-party-popper-solid',
    //   color: 'success',
    //   duration: 5000,
    // })

    console.log(res.message);

    await refreshSession();
    await navigateTo('/')

    currentStep.value = 3;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.add({
      title: "Error Saving Name",
      description:
        error.data?.message || "A server error occurred. Please try again.",
      icon: "i-heroicons-exclamation-triangle-solid",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  state.token = "";
  state.name = "";
  currentStep.value = 1;
}
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4"
  >
    <UCard
      class="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 text-slate-100"
    >
      <div class="text-center mb-8">
        <div
          class="mx-auto w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4"
        >
          <UIcon
            name="i-heroicons-qr-code"
            class="w-7 h-7 text-blue-300 animate-pulse"
          />
        </div>
        <h1
          class="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
        >
          Pair your Token
        </h1>
        <p
          class="text-sm mt-2 transition-opacity duration-300 text-slate-400"
          :class="{ 'opacity-0': currentStep === 3 }"
        >
          {{
            currentStep === 1
              ? "Enter the code from your device screen."
              : "Almost done! Please enter your name."
          }}
        </p>
      </div>

      <div class="min-h-[160px]">
        <Transition
          mode="out-in"
          enter-active-class="animate__animated animate__fadeInRight animate__faster"
          leave-active-class="animate__animated animate__fadeOutLeft animate__faster"
        >
          <div v-if="currentStep === 1" key="step1">
            <UForm
              ref="tokenFormRef"
              :schema="tokenSchema"
              :state="state"
              novalidate
              @submit="handleTokenSubmit"
            >
              <div class="flex items-center justify-center">
                <UFormField name="token" error="Please enter a valid code">
                  <UInput
                    v-model="state.token"
                    placeholder="123-456"
                    size="xl"
                    :disabled="loading"
                    autofocus
                    input-class="w-[240px] text-center font-mono tracking-[0.3em] text-2xl placeholder:text-slate-600"
                    name="token"
                    inputmode="numeric"
                  />
                </UFormField>
              </div>

              <div class="pt-6">
                <UButton
                  type="submit"
                  size="lg"
                  block
                  :loading="loading"
                  :disabled="
                    state.token.replace('-', '').length !== 6 || loading
                  "
                >
                  {{ loading ? "Verifying..." : "Verify Code" }}
                </UButton>
              </div>
            </UForm>
          </div>

          <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
            <div>
              <p class="text-xs text-slate-400 mb-1">Verified Code</p>
              <div
                class="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md border border-slate-700"
              >
                <UIcon
                  name="i-heroicons-lock-closed-solid"
                  class="text-green-400"
                />
                <p class="font-mono text-slate-300">{{ state.token }}</p>
              </div>
            </div>

            <UForm
              :schema="nameSchema"
              :state="state"
              class="space-y-2"
              @submit="handleNameSubmit"
            >
              <div class="flex items-center justify-center">
                <UFormField label="Your Name" name="name">
                  <UInput
                    ref="nameInputRef"
                    v-model="state.name"
                    placeholder="e.g., Alex"
                    size="lg"
                    :disabled="loading"
                    input-class="w-[240px] text-center font-mono tracking-[0.3em] text-2xl placeholder:text-slate-600"
                    maxlength="50"
                  />
                </UFormField>
              </div>

              <div class="!mt-6">
                <UButton
                  type="submit"
                  size="lg"
                  block
                  :loading="loading"
                  :disabled="!state.name || loading"
                >
                  Submit
                </UButton>
              </div>
            </UForm>
          </div>

          <div v-else key="step3" class="text-center p-4">
            <div
              class="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
            >
              <UIcon
                name="i-heroicons-check-badge-solid"
                class="w-9 h-9 text-green-400 animate-bounce"
              />
            </div>
            <h2 class="text-xl font-semibold text-white">All Set!</h2>
            <p class="text-slate-300 mt-1">
              Your account
              <strong class="text-white">{{ state.name }}</strong> is now
              connected.
            </p>
            <UButton
              variant="link"
              icon="i-heroicons-arrow-path-20-solid"
              class="mt-6"
              @click="resetForm"
            >
              Refresh
            </UButton>
          </div>
        </Transition>
      </div>
    </UCard>
  </section>
</template>
