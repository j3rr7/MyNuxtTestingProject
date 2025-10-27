<script setup lang="ts">
defineProps<{ companies: Company[] }>();

defineEmits([
  "extend",
  "disable",
  "enable",
  "delete",
  "addUser",
]);

const columns = [
    { accessorKey: 'company_name', header: 'Company' },
    { accessorKey: 'company_code', header: 'Company Code' },
    { accessorKey: 'subscription_expires_at', header: 'Expires At' },
    { accessorKey: 'is_active', header: 'Status' },
    { accessorKey: 'actions', header: 'Actions' }
];
</script>

<template>
  <UTable :columns="columns" :data="companies">
    <template #subscription_expires_at-cell="{ row }">
      <span v-if="row.original.subscription_expires_at">{{ fmt(row.original.subscription_expires_at) }}</span>
      <span v-else>—</span>
    </template>

    <template #is_active-cell="{ row }">
      <UBadge :color="row.original.is_active ? 'success' : 'error'">
        {{ row.original.is_active ? 'Active' : 'Inactive' }}
      </UBadge>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-user-plus"
          size="xs"
          color="violet"
          variant="soft"
          @click="$emit('addUser', row.original)"
        >
          Add User
        </UButton>

        <UButton icon="i-heroicons-clock" size="xs" color="primary" variant="soft" @click="$emit('extend', row.original)">
          Extend
        </UButton>
        <UButton v-if="row.original.is_active" icon="i-heroicons-x-circle" size="xs" color="warning" variant="soft" @click="$emit('disable', row.original)">
          Disable
        </UButton>
        <UButton v-else icon="i-heroicons-check-circle" size="xs" color="success" variant="soft" @click="$emit('enable', row.original)">
          Enable
        </UButton>
        <UButton icon="i-heroicons-trash" size="xs" color="error" variant="soft" @click="$emit('delete', row.original)" />
        <UButton icon="i-heroicons-user-group" size="xs" color="neutral" variant="soft" :to="`/companies/${row.original.company_id}/users`" />
      </div>
    </template>
  </UTable>
</template>
