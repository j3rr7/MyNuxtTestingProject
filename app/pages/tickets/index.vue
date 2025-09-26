<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

type Ticket = {
  id: bigint;
  subject: string;
  description?: string | null;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  priority: 1 | 2 | 3 | 4 | 5;
  metadata: Record<string, unknown>;
  is_deleted: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
};

type TicketMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
};

const columns: TableColumn<Ticket>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: (info) => `#${info.getValue()}`,
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => null,
  },
];

const table = useTemplateRef("table");

// === Configs ===
const statusConfig = {
  0: { label: "open", color: "info" },
  1: { label: "in progress", color: "primary" },
  2: { label: "pending", color: "warning" },
  3: { label: "resolved", color: "success" },
  4: { label: "closed", color: "neutral" },
  5: { label: "reopened", color: "info" },
  99: { label: "unknown", color: "neutral" },
} as const;

const priorityConfig = {
  1: { label: "lowest", color: "neutral" },
  2: { label: "low", color: "info" },
  3: { label: "medium", color: "info" },
  4: { label: "high", color: "warning" },
  5: { label: "highest", color: "error" },
  99: { label: "unknown", color: "neutral" },
} as const;

const statusFilterOptions = [
  { label: "All Status", value: null },
  ...Object.entries(statusConfig).map(([key, val]) => ({
    label:
      val.label.charAt(0).toUpperCase() + val.label.slice(1).replace(/_/g, " "),
    value: Number(key),
  })),
];

const priorityFilterOptions = [
  { label: "All Priorities", value: null },
  ...Object.entries(priorityConfig).map(([key, val]) => ({
    label:
      val.label.charAt(0).toUpperCase() + val.label.slice(1).replace(/_/g, " "),
    value: Number(key),
  })),
];

// === Filters & Sorting ===
const filters = reactive({
  q: "",
  status: null as number | null,
  priority: null as number | null,
  is_deleted: false,
});

const sort = reactive({
  sortBy: "created_at",
  order: "DESC" as "ASC" | "DESC",
});

const tablePagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const currentPage = computed({
  get() {
    return tablePagination.value.pageIndex + 1;
  },
  set(page: number) {
    tablePagination.value.pageIndex = page - 1;
  },
});

// Sync pageIndex to page 1 on filter/sort change
watch(
  [
    () => filters.q,
    () => filters.status,
    () => filters.priority,
    () => filters.is_deleted,
    () => sort.sortBy,
    () => sort.order,
  ],
  () => {
    tablePagination.value.pageIndex = 0; // reset to first page
  }
);

// === Query Params (computed) ===
const queryParams = computed(() => ({
  page: tablePagination.value.pageIndex + 1,
  limit: tablePagination.value.pageSize,
  q: filters.q || undefined,
  status: filters.status || undefined,
  priority: filters.priority || undefined,
  is_deleted: filters.is_deleted ? "true" : undefined,
  sortBy: sort.sortBy,
  order: sort.order,
}));

// === Fetch Tickets ===
const { data, pending, error, refresh } = await useFetch<TicketResponse>(
  "/api/tickets",
  {
    query: queryParams,
    lazy: true,
  }
);

type TicketResponse = {
  data: Ticket[];
  meta: TicketMeta;
};

const tickets = computed(() => data.value?.data || []);
const meta = computed(() => data.value?.meta || { total: 0, totalPages: 0 });

watch(data, (newData) => {
  if (newData?.meta) {
    // The API returns a 1-based page, but table pagination is 0-based
    tablePagination.value.pageIndex = newData.meta.page - 1;
    tablePagination.value.pageSize = newData.meta.limit;
  }
});

/* ==========  tiny helpers  ========== */
const statusIcon = (s: number) => {
  const map: Record<number, string> = {
    0: "i-heroicons-circle-stack",
    1: "i-heroicons-clock",
    2: "i-heroicons-pause-circle",
    3: "i-heroicons-check-badge",
    4: "i-heroicons-x-circle",
    5: "i-heroicons-arrow-path",
  };
  return map[s] ?? "i-heroicons-question-mark-circle";
};
const priorityIcon = (p: number) => {
  const map: Record<number, string> = {
    1: "i-heroicons-chevron-double-down",
    2: "i-heroicons-chevron-down",
    3: "i-heroicons-minus",
    4: "i-heroicons-chevron-up",
    5: "i-heroicons-chevron-double-up",
  };
  return map[p] ?? "i-heroicons-question-mark-circle";
};

// === Actions ===

const updateTicketStatus = async (ticketId: bigint, status: number) => {
  try {
    await $fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: { status },
    });
    await refresh();
  } catch (err) {
    console.error("Failed to update ticket status", err);
  }
};

const viewTicket = async (ticketId: bigint) => {
  navigateTo(`/tickets/${ticketId}`);
};

const deleteTicket = async (ticketId: bigint) => {
  if (!confirm("Are you sure you want to delete this ticket?")) return;
  try {
    await $fetch(`/api/tickets/${ticketId}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (err) {
    console.error("Failed to delete ticket", err);
  }
};
</script>

<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8">
    <!-- -------------------- Header -------------------- -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Support Tickets
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ meta.total }} total
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="New ticket"
        color="primary"
        to="/tickets/new"
      />
    </header>

    <!-- -------------------- Sticky Command Bar -------------------- -->
    <section
      class="sticky top-0 z-10 grid grid-cols-1 gap-3 rounded-xl bg-white/70 p-4 shadow-sm backdrop-blur-lg dark:bg-gray-900/70 sm:grid-cols-2 lg:grid-cols-5"
    >
      <!-- Search -->
      <div class="sm:col-span-2 lg:col-span-2">
        <UInput
          v-model="filters.q"
          placeholder="Search subject…"
          size="md"
          clearable
          icon="i-heroicons-magnifying-glass"
        />
      </div>

      <!-- Status -->
      <USelect
        v-model="filters.status"
        :items="statusFilterOptions"
        placeholder="Status"
        size="md"
      />

      <!-- Priority -->
      <USelect
        v-model="filters.priority"
        :items="priorityFilterOptions"
        placeholder="Priority"
        size="md"
      />

      <!-- Sort -->
      <div class="flex items-center gap-2">
        <USelect
          v-model="sort.sortBy"
          :items="[
            { label: 'Created', value: 'created_at' },
            { label: 'Updated', value: 'updated_at' },
            { label: 'Status', value: 'status' },
            { label: 'Priority', value: 'priority' },
          ]"
          size="md"
          class="grow"
        />
        <UButton
          square
          variant="ghost"
          color="neutral"
          :icon="
            sort.order === 'ASC'
              ? 'i-heroicons-bars-arrow-up'
              : 'i-heroicons-bars-arrow-down'
          "
          @click="sort.order = sort.order === 'ASC' ? 'DESC' : 'ASC'"
        />
      </div>

      <!-- Deleted toggle -->
      <div class="flex items-center justify-end lg:col-span-5">
        <USwitch v-model="filters.is_deleted" />
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-300"
          >Show deleted</span
        >
      </div>
    </section>

    <!-- -------------------- Table Card -------------------- -->
    <div>
      <!-- Skeleton -->
      <div v-if="pending" class="divide-y dark:divide-gray-800">
        <USkeleton
          v-for="i in tablePagination.pageSize"
          :key="i"
          class="h-16 w-full"
        />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 text-center">
        <p class="text-red-500 mb-3">{{ error.message }}</p>
        <UButton label="Retry" color="primary" @click="refresh()" />
      </div>

      <!-- Table -->
      <UTable
        v-else
        ref="table"
        v-model:pagination="tablePagination"
        :columns="columns"
        :data="tickets"
        :loading="pending"
        class="-mx-28"
      >
        <!-- Subject -->
        <template #subject-cell="{ row }">
          <span class="truncate max-w-xs">{{ row.original.subject }}</span>
        </template>

        <!-- Description -->
        <template #description-cell="{ row }">
          <span class="text-gray-500 dark:text-gray-400">
            {{
              row.original.description
                ? row.original.description.slice(0, 40) + "…"
                : "—"
            }}
          </span>
        </template>

        <!-- Status pill -->
        <template #status-cell="{ row }">
          <UBadge
            :color="statusConfig[row.original.status]?.color || 'gray'"
            variant="subtle"
            size="xs"
            class="px-2 py-1"
          >
            <UIcon :name="statusIcon(row.original.status)" class="mr-1" />
            {{ statusConfig[row.original.status]?.label }}
          </UBadge>
        </template>

        <!-- Priority pill -->
        <template #priority-cell="{ row }">
          <UBadge
            :color="priorityConfig[row.original.priority]?.color || 'gray'"
            variant="subtle"
            size="xs"
            class="px-2 py-1"
          >
            <UIcon :name="priorityIcon(row.original.priority)" class="mr-1" />
            {{ priorityConfig[row.original.priority]?.label }}
          </UBadge>
        </template>

        <!-- Dates -->
        <template #created_at-cell="{ row }">
          {{ fmt(row.original.created_at) }}
        </template>
        <template #updated_at-cell="{ row }">
          {{ fmt(row.original.updated_at) }}
        </template>

        <!-- Actions -->
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              square
              icon="i-heroicons-eye"
              @click="viewTicket(row.original.id)"
            />
            <UButton
              v-if="row.original.status !== 3"
              variant="ghost"
              color="green"
              square
              icon="i-heroicons-check-circle"
              @click="updateTicketStatus(row.original.id, 3)"
            />
            <UButton
              variant="ghost"
              color="error"
              square
              icon="i-heroicons-trash"
              @click="deleteTicket(row.original.id)"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div
        v-if="meta.total > tablePagination.pageSize"
        class="flex items-center justify-between border-t px-4 py-3 dark:border-gray-800"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Per page</span>
          <USelect
            v-model="tablePagination.pageSize"
            :items="[10, 25, 50]"
            class="w-20"
          />
        </div>
        <UPagination
          v-model:page="currentPage"
          :total="meta.total"
          :items-per-page="tablePagination.pageSize"
          show-edge-buttons
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>
