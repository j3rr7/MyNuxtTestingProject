<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  today,
  getLocalTimeZone,
  parseDate,
  type CalendarDate,
} from "@internationalized/date";

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["extended", "cancel"]);

const expiresAt = shallowRef<CalendarDate>(
  props.company?.subscription_expires_at
    ? parseDate(props.company.subscription_expires_at.split("T")[0] || "")
    : today(getLocalTimeZone())
);

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
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
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Extend Subscription for {{ props.company?.company_name }}
        </h2>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="emit('cancel')"
        />
      </div>
    </template>

    <UForm :state="expiresAt" class="space-y-6" @submit.prevent="onSubmit">
      <UFormField label="New Expiration Date" required>
        <DatePicker
          v-model="expiresAt"
          :min-date="
            parseDate(
              props.company?.subscription_expires_at.split('T')[0] || ''
            ) || today(getLocalTimeZone())
          "
        />
      </UFormField>

      <div class="flex justify-end gap-3 mt-6">
        <UButton variant="soft" color="neutral" @click="emit('cancel')"
          >Cancel</UButton
        >
        <UButton color="primary" type="submit">Extend</UButton>
      </div>
    </UForm>
  </UCard>
</template>
