<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useWebSocket } from "@vueuse/core";

const UButton = resolveComponent("UButton");

interface Inquiry {
  id: bigint;
  first_name: string;
  last_name: string;
  company_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  question: string;
  submitted_at: string;
}

interface InquiryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  filters: {
    email: string | null;
    company: string | null;
  };
  sortBy: string;
  order: "ASC" | "DESC";
}

type InquiriesResponse = {
  data: Inquiry[];
  meta: InquiryMeta;
};

const toast = useToast();
const table = useTemplateRef("table");
const expanded = ref({});

const columns: TableColumn<Inquiry>[] = [
  {
    id: "expand",
    cell: ({ row }) => {
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      });
    },
  },
  {
    accessorKey: "id",
    header: "#",
    cell: (info) => `#${info.getValue()}`,
  },
  {
    accessorKey: "display_name",
    header: "Name",
    cell: (info) => {
      const row = info.row.original;
      return `${row.first_name} ${row.last_name}`;
    },
  },
  {
    accessorKey: "company_name",
    header: "Company",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "question",
    header: "Question",
  },
];

// === Reactive Query State ===
const filters = reactive({
  q: "",
  email: null as string | null,
  company: null as string | null,
});

const sort = reactive({
  sortBy: "submitted_at",
  order: "DESC",
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

const queryParams = computed(() => ({
  page: tablePagination.value.pageIndex + 1,
  limit: tablePagination.value.pageSize,
  q: filters.q || undefined,
  sortBy: sort.sortBy,
  order: sort.order,
}));

// === Fetch Tickets ===
const { data, pending, error, refresh } = await useFetch<InquiriesResponse>(
  "/api/inquiries",
  {
    query: queryParams,
    lazy: true,
  }
);

const inquiries = computed(() => data.value?.data || []);
const meta = computed(
  () => data.value?.meta || ({ total: 0, totalPages: 0 } as InquiryMeta)
);

// === Watchers for auto-refresh ===
watch([() => filters.q, () => filters.email, () => filters.company], () => {
  tablePagination.value.pageIndex = 0;
  refresh();
});

watch([() => sort.sortBy, () => sort.order], () => {
  tablePagination.value.pageIndex = 0;
  refresh();
});

watch(data, (newData) => {
  if (newData?.meta) {
    // The API returns a 1-based page, but table pagination is 0-based
    tablePagination.value.pageIndex = newData.meta.page - 1;
    tablePagination.value.pageSize = newData.meta.limit;
  }
});

const loadingExport = ref(false);
const exportData = async () => {
  loadingExport.value = true;

  try {
    const blob = await $fetch("/api/inquiries/export", {
      method: "GET",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `contact_submissions_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    loadingExport.value = false;
  }
};

// WS
const { open, close, status } = useWebSocket("/ws/inquiries", {
  immediate: false,
  onMessage: (ws, event) => {
    console.log("[WebSocket] Message received:", event.data);
    toast.add({
      title: "New inquiry arrived!",
      description: "The list is updating automatically.",
    });
    refresh();
  },
});

const getWsLabel = (status: string) => {
  switch (status) {
    case "OPEN":
      return "Live";
    case "CONNECTING":
      return "Connecting";
    case "CLOSED":
    case "ERROR":
    default:
      return "Offline";
  }
};

const getWsColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "green";
    case "CONNECTING":
      return "yellow";
    case "CLOSED":
    case "ERROR":
    default:
      return "red";
  }
};

onMounted(() => {
  open();
});

onBeforeUnmount(() => {
  close();
});
</script>

<template>
  <div class="space-y-4 animate__animated animate__fadeIn">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Inquiries
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage and review all submitted contact forms.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <UTooltip text="Real-time updates connection status">
          <UBadge variant="subtle" size="sm" :color="getWsColor(status)" class="flex items-center gap-2"
            aria-live="polite">
            <span class="inline-block w-2 h-2 rounded-full" :class="{
              'bg-green-500': status === 'OPEN',
              'bg-yellow-400 animate-pulse': status === 'CONNECTING',
              'bg-red-500': status === 'CLOSED',
            }" aria-hidden="true" />
            <span class="font-medium">
              {{ getWsLabel(status) }}
            </span>
          </UBadge>
        </UTooltip>
      </div>
    </header>

    <div v-if="pending && !data" class="py-12 flex flex-col items-center text-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-primary-500 text-4xl" />
      <p class="text-lg mt-4 text-gray-600 dark:text-gray-300">
        Loading inquiries...
      </p>
    </div>

    <div v-else-if="error" class="py-8 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
        <UIcon name="i-lucide-alert-triangle" class="text-2xl" />
        <div>
          <p class="font-bold">Error Loading Inquiries</p>
          <p class="text-sm mt-1">{{ error.message }}</p>
          <UButton size="sm" color="red" variant="soft" class="mt-3" @click="refresh()">
            <UIcon name="i-lucide-refresh-cw" class="mr-1" />
            Try Again
          </UButton>
        </div>
      </div>
    </div>

    <div v-else-if="inquiries.length === 0" class="py-12 text-center">
      <UIcon name="i-lucide-inbox" class="text-5xl mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">
        No Inquiries Found
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">
        {{
          filters.q
            ? "Try adjusting your search terms."
            : "There are no inquiries to display yet."
        }}
      </p>
      <UButton v-if="filters.q" size="sm" color="primary" variant="soft" class="mt-4" @click="filters.q = ''">
        Clear Search
      </UButton>
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex-1 w-full md:w-auto">
          <UInput v-model="filters.q" placeholder="Search by name, email, or question..." icon="i-lucide-search"
            class="w-full md:w-96">
            <template v-if="filters.q?.length" #trailing>
              <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input"
                @click="filters.q = ''" />
            </template>
          </UInput>
        </div>

        <div class="flex items-center gap-2">
          <USelect v-model="sort.sortBy" :items="[
            { label: 'Sort: Newest', value: 'submitted_at' },
            { label: 'Sort: ID', value: 'id' },
            { label: 'Sort: Name', value: 'display_name' },
          ]" class="w-36" />
          <UButton color="gray" variant="ghost" :icon="sort.order === 'ASC' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
            " @click="sort.order = sort.order === 'ASC' ? 'DESC' : 'ASC'" />
          <UButton icon="i-lucide-refresh-cw" color="gray" variant="ghost" :loading="pending" @click="refresh()" />
          <UButton :icon="loadingExport ? 'i-lucide-loader' : 'i-lucide-download'" color="gray" variant="ghost"
            :loading="loadingExport" :disabled="loadingExport" @click="exportData" />
        </div>
      </div>

      <div class="rounded-lg overflow-hidden -mx-6 sm:-mx-8 md:-mx-12 lg:mx-0">
        <div class="overflow-x-auto">
          <UTable ref="table" v-model:expanded="expanded" v-model:pagination="tablePagination" :columns="columns"
            :data="inquiries" :loading="pending" loading-color="primary" loading-animation="carousel">
            <template #expanded="{ row }">
              <div class="p-4 bg-gray-100 dark:bg-gray-800 animate__animated animate__fadeIn">
                <dl class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Full Name
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300">
                      {{ row.original.first_name }} {{ row.original.last_name }}
                    </dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Company
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300">
                      {{ row.original.company_name || "N/A" }}
                    </dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Submitted
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300">
                      {{ 
                      new Date(row.original.submitted_at).toLocaleDateString("en-GB", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })
                      }}
                    </dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Email
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300">
                      {{ row.original.email || "N/A" }}
                    </dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Phone
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300">
                      {{ row.original.phone_number || "N/A" }}
                    </dd>
                  </div>
                  <div class="sm:col-span-2 md:col-span-3">
                    <dt class="font-semibold text-gray-900 dark:text-white">
                      Full Question
                    </dt>
                    <dd class="mt-1 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {{ row.original.question }}
                    </dd>
                  </div>
                </dl>
              </div>
            </template>

            <template #question-cell="{ row }">
              <span class="line-clamp-2">{{ row.original.question }}</span>
            </template>
          </UTable>
        </div>

        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-2 text-sm">
            <span>Rows per page</span>
            <USelect v-model="tablePagination.pageSize" :items="[10, 25, 50, 100]" size="xs" />
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ (meta.page - 1) * meta.limit + 1 }} to
            {{ Math.min(meta.page * meta.limit, meta.total) }} of
            {{ meta.total }} inquiries
          </p>

          <UPagination v-model:page="currentPage" show-edge-buttons :items-per-page="tablePagination.pageSize"
            :total="meta.total" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
