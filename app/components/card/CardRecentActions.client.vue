<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface AuditLog {
  created_at: string
  actor: string
  action: string
  target: string
  status: string
  description: string
}

const page = ref(1);
const limit = ref(10);
const offset = computed(() => (page.value - 1) * limit.value);

const { data: logs, pending, error } = useFetch<AuditLog[]>("/api/activities", {
  query: {
    limit,
    offset
  },
  lazy: true
});


const columns: TableColumn<AuditLog>[] = [
  { accessorKey: 'actor', header: 'Actor' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'target', header: 'Target' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'created_at', header: 'Timestamp' },
];

</script>

<template>
  <div>
    <UCard class="rounded-xl shadow-sm">
      <div class="space-y-4">
        <div v-if="error">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="red"
            variant="soft"
            title="Failed to load audit logs"
            :description="error.statusMessage || 'An unexpected error occurred. Please try again.'"
          />
        </div>

        <!-- Loading & Data State -->
        <div v-else>
          <UTable
            :data="logs"
            :columns="columns"
            :loading="pending"
            :empty-state="{ icon: 'i-heroicons-circle-stack', label: 'No logs found.' }"
            class="w-full"
          >
            <template #status-cell="{ row }">
              <UBadge
                variant="soft"
                size="xs"
              >
                {{ row.original.status }}
              </UBadge>
            </template>

            <template #created_at-cell="{ row }">
              <span class="text-gray-600 dark:text-gray-300 font-mono text-xs">
                {{ fmtShort(row.original.created_at) }}
              </span>
            </template>
          </UTable>
        </div>
      </div>
    </UCard>
  </div>
</template>