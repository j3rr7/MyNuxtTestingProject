<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { CalendarDate } from '@internationalized/date';

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(['extended', 'cancel']);

const now = new Date();

const state = reactive({
  expiresAt: props.company?.subscription_expires_at
    ? new CalendarDate(
        new Date(props.company.subscription_expires_at).getFullYear(),
        new Date(props.company.subscription_expires_at).getMonth() + 1,
        new Date(props.company.subscription_expires_at).getDate()
      )
    : new CalendarDate(now.getFullYear() + 1, now.getMonth() + 1, now.getDate()),
});

const onSubmit = (_: FormSubmitEvent<typeof state>) => {
  if (props.company) {
    emit('extended', {
      companyId: props.company.company_id,
      expiresAt: state.expiresAt.toDate('UTC').toISOString(),
    });
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">Extend Subscription for {{ props.company?.company_name }}</h2>
    </template>

    <UForm :state="state" class="space-y-6" @submit.prevent="onSubmit">
      <UFormField label="New Expiration Date" required>
        <DatePicker v-model="state.expiresAt" />
      </UFormField>

      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')">Cancel</UButton>
        <UButton color="primary" type="submit">Extend</UButton>
      </div>
    </UForm>
  </UCard>
</template>
