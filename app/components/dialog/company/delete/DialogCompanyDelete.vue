<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["cancel", "deleted"]);

const reason = ref("");

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
  if (props.company) {
    emit("deleted", props.company.company_id, reason.value);
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Delete Company for {{ props.company?.company_name }}
        </h2>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="emit('cancel')"
        />
      </div>
    </template>

    <UForm :state="{}" class="space-y-6" @submit.prevent="onSubmit">
      <div class="border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              This action is permanent.
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>This will delete the company and all associated data, including users, projects, and records. This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-sm">Please provide a reason for deletion</p>
      <UTextarea
        v-model="reason"
        size="xl"
        name="reason"
        placeholder="Reason for deletion"
        class="w-full"
      />

      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')"
          >Cancel</UButton
        >
        <UButton color="error" type="submit">Delete</UButton>
      </div>
    </UForm>
  </UCard>
</template>
