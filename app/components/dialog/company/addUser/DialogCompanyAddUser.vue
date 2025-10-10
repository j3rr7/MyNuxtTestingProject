<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["cancel", "added"]);

const state = ref({
  displayName: '',
  username: '',
  email: '',
  password: '',
  role: undefined,
});

const isPasswordVisible = ref(false);

const passwordInputType = computed(() => isPasswordVisible.value ? 'text' : 'password');
const passwordIcon = computed(() => isPasswordVisible.value ? 'i-heroicons-eye-slash' : 'i-heroicons-eye');

const roleOptions = [
  { label: 'Admin', id: 1 },
  { label: 'Analytics', id: 2 },
  { label: 'Sales', id: 3 },
];

const onSubmit = (_: FormSubmitEvent<HTMLFormElement>) => {
  if (!props.company) return;

  emit('added', { ...state.value, companyId: props.company.company_id });
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Add User to {{ props.company?.company_name }}</h2>
        <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="emit('cancel')" />
      </div>
    </template>

    <UForm :state="state" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Display Name" name="displayName" required>
          <UInput v-model="state.displayName" placeholder="e.g., Jane Doe" icon="i-heroicons-user-circle" />
        </UFormField>

        <UFormField label="Username" name="username" required>
          <UInput v-model="state.username" placeholder="e.g., janedoe" icon="i-heroicons-identification" />
        </UFormField>

        <UFormField label="Email" name="email" required class="col-span-full">
          <UInput 
            v-model="state.email" type="email" placeholder="e.g., jane.doe@example.com"
            icon="i-heroicons-envelope" />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput v-model="state.password" :type="passwordInputType" placeholder="Enter a secure password">
            <template #trailing>
              <UButton 
                :icon="passwordIcon" variant="link" color="gray" :padded="false"
                @click="isPasswordVisible = !isPasswordVisible" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Role" name="role" required>
          <USelectMenu 
            v-model="state.role" :items="roleOptions" value-key="id" option-attribute="label"
            placeholder="Select a role" icon="i-heroicons-user-group" />
        </UFormField>
      </div>

      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
        <UButton label="Cancel" color="gray" variant="ghost" @click="emit('cancel')" />
        <UButton type="submit" label="Add User" />
      </div>
    </UForm>
  </UCard>
</template>