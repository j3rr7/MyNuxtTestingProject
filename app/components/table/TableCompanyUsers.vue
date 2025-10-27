<script setup lang="ts">
defineProps<{ users: CompanyUser[] }>();

defineEmits(['new'])

const columns = [
  { accessorKey: 'fullname', header: 'Display Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'actions', header: 'Actions' }
]

const table = useTemplateRef("table");
</script>

<template>
  <UTable ref="table" :columns="columns" :data="users">
    <template #fullname-cell="{ row }">
      <span :class="{ 'text-gray-400 dark:text-gray-500 italic': !row.original.fullname }">
        {{ row.original.fullname || 'N/A' }}
      </span>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex items-center gap-1">
        <UButton>
          <UIcon name="i-heroicons-pencil-square" class="mr-1" />
          Edit
        </UButton>
      </div>
    </template>
  </UTable>
</template>