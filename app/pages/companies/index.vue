<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { Company, Meta, PaginatedResponse } from "~~/shared/types";
import type { TableColumn } from "@nuxt/ui";
import { useDebounceFn } from "@vueuse/core";

const table = useTemplateRef("table");
const companies = ref<Company[]>([]);
const meta = ref<Meta | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(15);

// Create Company
const now = new Date();
const isCreateDialogOpen = ref(false);
const companyName = ref("");
const companyCode = ref("");
const databaseName = ref("");
const expiresAt = shallowRef(new CalendarDate(now.getFullYear() + 1, now.getMonth() + 1, now.getDate()));

const columns: TableColumn<Company>[] = [
  {
    accessorKey: "company_id",
    header: "#",
  },
  {
    accessorKey: "company_name",
    header: "Company",
  },
  {
    accessorKey: "company_code",
    header: "Code",
  },
  {
    accessorKey: "database_name",
    header: "Database",
  },
  {
    accessorKey: "subscription_expires_at",
    header: "Expires At",
  },
  {
    accessorKey: "is_active",
    header: "Status",
  },
  {
    accessorKey: "actions",
    header: "Actions",
  },
];

const openCreateDialog = () => {
  isCreateDialogOpen.value = true;
};

const createCompany = async () => {
  try {
    const payload = {
      name: companyName.value,
      code: companyCode.value,
      database: databaseName.value,
      expiresAt: expiresAt.value.toDate("UTC").toISOString(),
    };

    await $fetch("/api/companies", {
      method: "POST",
      body: payload,
    });

    // Reset form
    companyName.value = "";
    companyCode.value = "";
    databaseName.value = "";

    isCreateDialogOpen.value = false;
    fetchCompanies();
  } catch (err: unknown) {
    console.error("Create Error:", err);
    if (err instanceof Error) error.value = err.message;
  }
};

const fetchCompanies = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Construct the query parameters
    const params = new URLSearchParams();
    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }
    params.append("page", currentPage.value.toString());
    params.append("limit", itemsPerPage.value.toString());

    // Fetch data from the API
    const response = await $fetch<PaginatedResponse<Company>>(
      `/api/companies`,
      {
        method: "GET",
        query: params,
      }
    );

    companies.value = response.data;
    meta.value = response.meta;
  } catch (err: unknown) {
    console.error("API Error:", err);
    if (err instanceof Error) error.value = err.message;
    companies.value = []; // Clear data on error
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = useDebounceFn(
  () => {
    currentPage.value = 1; // Reset to first page on new search
    fetchCompanies();
  },
  300,
  { maxWait: 5000 }
);

watch(searchQuery, () => {
  debouncedFetch();
});

onMounted(() => {
  fetchCompanies();
});
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div class="relative">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            variant="outline"
            type="text"
            placeholder="Search by company name or code..."
            :ui="{
              base: 'min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] w-full',
            }"
          />
        </div>
        <div>
          <UButton type="button" @click="openCreateDialog">
            Create Company
          </UButton>
        </div>
      </div>

      <UModal
        v-model:open="isCreateDialogOpen"
        :ui="{ wrapper: 'sm:max-w-xl' }"
      >
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
                  >
                    <UIcon
                      name="i-heroicons-building-office-2-solid"
                      class="h-5 w-5 text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <div>
                    <h2
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Create Company
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Add a new company to your organization
                    </p>
                  </div>
                </div>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isCreateDialogOpen = false"
                />
              </div>
            </template>

            <UForm :state="{}" class="space-y-6" @submit="createCompany">
              <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <UFormField
                  label="Company Name"
                  name="companyName"
                  required
                  class="sm:col-span-2 w-full"
                >
                  <UInput
                    v-model="companyName"
                    placeholder="e.g., Acme Corporation"
                    icon="i-heroicons-building-office-2"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Company Code"
                  name="companyCode"
                  required
                  help="Unique identifier (e.g., ACME001)"
                >
                  <UInput
                    v-model="companyCode"
                    placeholder="ACME001"
                    icon="i-heroicons-hashtag"
                    size="lg"
                    :maxlength="20"
                  />
                </UFormField>

                <UFormField
                  label="Database Name"
                  name="databaseName"
                  required
                  help="Database identifier for this company"
                >
                  <UInput
                    v-model="databaseName"
                    placeholder="acme_db"
                    icon="i-heroicons-circle-stack"
                    size="lg"
                  />
                </UFormField>

                <UFormField
                  label="Subscription Expires"
                  name="expiresAt"
                  required
                  class="sm:col-span-2"
                >
                  <DatePicker v-model="expiresAt" />
                </UFormField>
              </div>

              <div class="flex justify-end gap-3">
                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  @click="isCreateDialogOpen = false"
                >
                  Cancel
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  icon="i-heroicons-plus-circle"
                >
                  Create Company
                </UButton>
              </div>
            </UForm>
          </UCard>
        </template>
      </UModal>

      <div class="shadow-lg overflow-hidden">
        <div v-if="isLoading" class="p-8 text-center">
          <svg
            class="animate-spin h-8 w-8 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p class="mt-4">Loading companies...</p>
        </div>

        <div
          v-else-if="error"
          class="p-8 text-center bg-red-50 text-red-700 rounded-lg"
        >
          <h3 class="text-xl font-semibold">An Error Occurred</h3>
          <p class="mt-2">{{ error }}</p>
          <UButton
            size="sm"
            color="red"
            variant="soft"
            class="mt-4"
            @click="fetchCompanies"
          >
            Try Again
          </UButton>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <UTable ref="table" :columns="columns" :data="companies">
              <template #action-cell="{ row }">
                <UButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  @click="() => console.log(row)"
                >
                  Edit
                </UButton>
              </template>
            </UTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
