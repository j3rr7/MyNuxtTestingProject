<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { CalendarDate } from "@internationalized/date";
import { z } from "zod";

const now = new Date();

const state = reactive({
  companyName: "",
  companyCode: "",
  databaseName: "",
  expiresAt: new CalendarDate(
    now.getFullYear() + 1,
    now.getMonth() + 1,
    now.getDate()
  ),
});

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyCode: z
    .string()
    .min(1, "Company code is required")
    .max(20, "Company code max length is 20"),
  databaseName: z.string().min(1, "Database name is required"),
  expiresAt: z.instanceof(CalendarDate),
});

const validate = (): FormError[] => {
  const errors: FormError[] = [];
  const dataToValidate = {
    companyName: state.companyName,
    companyCode: state.companyCode,
    databaseName: state.databaseName,
    expiresAt: state.expiresAt,
  };

  const result = companySchema.safeParse(dataToValidate);

  if (!result.success) {
    console.error(result.error);
  }

  return errors;
};

const emit = defineEmits(["created", "cancel"]);

const onSubmit = (_: FormSubmitEvent<typeof state>) => {
  const payload = {
    name: state.companyName,
    code: state.companyCode,
    database: state.databaseName,
    expiresAt: state.expiresAt.toDate("UTC").toISOString(),
  };
  emit("created", payload);

  // Clear form
  state.companyName = "";
  state.companyCode = "";
  state.databaseName = "";
  state.expiresAt = new CalendarDate(
    now.getFullYear() + 1,
    now.getMonth() + 1,
    now.getDate()
  );
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
      :validate="validate"
      :state="state"
      class="space-y-6"
      @submit="onSubmit"
    >
      <UFormField label="Company Name" name="companyName" required>
        <UInput
          v-model="state.companyName"
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
          v-model="state.companyCode"
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
        <UInput v-model="state.databaseName" placeholder="acme_db" size="lg" />
      </UFormField>

      <UFormField label="Subscription Expires" name="expiresAt" required>
        <DatePicker v-model="state.expiresAt" />
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
