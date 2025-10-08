<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { CalendarDate } from "@internationalized/date";

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["extended", "cancel"]);

const now = new Date();
const expiresAt = ref(
  props.company?.subscription_expires_at
    ? new CalendarDate(
        new Date(props.company.subscription_expires_at).getFullYear(),
        new Date(props.company.subscription_expires_at).getMonth() + 1,
        new Date(props.company.subscription_expires_at).getDate()
      )
    : new CalendarDate(now.getFullYear() + 1, now.getMonth() + 1, now.getDate())
);

watch(
  () => props.company,
  (newCompany) => {
    if (newCompany?.subscription_expires_at) {
      const d = new Date(newCompany.subscription_expires_at);
      expiresAt.value = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    } else {
      expiresAt.value = new CalendarDate(now.getFullYear() + 1, now.getMonth() + 1, now.getDate());
    }
  }
);

const onSubmit = async (event: FormSubmitEvent<>) => {
  if (props.company) {
    emit("extended", {
      companyId: props.company.company_id,
      expiresAt: expiresAt.value.toDate("UTC").toISOString(),
    });
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">Extend Subscription for {{ props.company?.company_name }}</h2>
    </template>

    <UForm @submit="onSubmit">
      <UFormField label="New Expiration Date" required>
        <DatePicker v-model="expiresAt" />
      </UFormField>

      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')">Cancel</UButton>
        <UButton color="primary" type="submit">Extend</UButton>
      </div>
    </UForm>
  </UCard>
</template>
