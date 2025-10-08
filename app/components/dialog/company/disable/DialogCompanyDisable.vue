<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(['cancel', 'disabled']);

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
  if (props.company) {
    emit('disabled', props.company.company_id);
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Disable Company for {{ props.company?.company_name }}</h2>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="emit('cancel')"
        />
      </div>
    </template>

    <UForm :state="{}" class="space-y-6" @submit.prevent="onSubmit">
      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')">Cancel</UButton>
        <UButton color="warning" type="submit">Disable</UButton>
      </div>
    </UForm>
  </UCard>
</template>
