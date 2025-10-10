<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { today, getLocalTimeZone, type CalendarDate } from '@internationalized/date'

const companyName = ref('')
const companyCode = ref('')
const databaseName = ref('')
const expiresAt = shallowRef<CalendarDate>(today(getLocalTimeZone()))

const emit = defineEmits(["created", "cancel"]);

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
  const payload = {
    name: companyName.value,
    code: companyCode.value,
    database: databaseName.value,
    expiresAt: expiresAt.value.toDate("UTC").toISOString(),
  };
  emit("created", payload);

  // Clear form
  companyName.value = ''
  companyCode.value = ''
  databaseName.value = ''
  expiresAt.value = today(getLocalTimeZone())
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Create Company</h2>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="emit('cancel')"
        />
      </div>
    </template>

    <UForm
      :state="{}"
      class="space-y-6"
      @submit.prevent="onSubmit"
    >
      <UFormField label="Company Name" name="companyName" required>
        <UInput
          v-model="companyName"
          placeholder="e.g., Acme Corporation"
          size="lg"
        />
      </UFormField>

      <UFormField
        label="Company Code"
        name="companyCode"
        help="Unique identifier (e.g., ACME001)"
        required
      >
        <UInput
          v-model="companyCode"
          placeholder="ACME001"
          size="lg"
          maxlength="20"
        />
      </UFormField>

      <UFormField
        label="Database Name"
        name="databaseName"
        help="Database identifier for this company"
        required
      >
        <UInput v-model="databaseName" placeholder="acme_db" size="lg" />
      </UFormField>

      <UFormField label="Subscription Expires" name="expiresAt" required>
        <DatePicker v-model="expiresAt" />
      </UFormField>

      <div class="flex justify-end gap-3">
        <UButton variant="soft" color="neutral" @click="emit('cancel')"
          >Cancel</UButton
        >
        <UButton type="submit" color="primary" icon="i-heroicons-plus-circle"
          >Create Company</UButton
        >
      </div>
    </UForm>
  </UCard>
</template>
