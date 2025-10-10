<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["cancel", "enabled"]);

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
  if (props.company) {
    emit("enabled", props.company.company_id);
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Enable Company for {{ props.company?.company_name }}
        </h2>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="emit('cancel')"
        />
      </div>
    </template>

    <UForm :state="{}" class="space-y-6" @submit.prevent="onSubmit">
      <p class="text-sm font-medium">Enable this company for use?</p>

      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')"
          >Cancel</UButton
        >
        <UButton color="success" type="submit">Enable</UButton>
      </div>
    </UForm>
  </UCard>
</template>
