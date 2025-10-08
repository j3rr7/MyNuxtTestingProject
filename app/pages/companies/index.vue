<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
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
const companyName = ref("");
const companyCode = ref("");
const databaseName = ref("");
const expiresAt = shallowRef(
  new CalendarDate(now.getFullYear() + 1, now.getMonth() + 1, now.getDate())
);

// Modal
const isCreateDialogOpen = ref(false);
const isExtendDialogOpen = ref(false);
const isDisableDialogOpen = ref(false);
const isEnableDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);

const currentActionCompany = ref<Company | null>(null);

const columns: TableColumn<Company>[] = [
  {
    accessorKey: "company_name",
    header: "Company",
  },
  {
    accessorKey: "company_code",
    header: "Company Code",
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

const openExtendDialog = (company: Company) => {
  currentActionCompany.value = company;
  isExtendDialogOpen.value = true;
};

const openDisableDialog = (company: Company) => {
  currentActionCompany.value = company;
  isDisableDialogOpen.value = true;
};

const openEnableDialog = (company: Company) => {
  currentActionCompany.value = company;
  isEnableDialogOpen.value = true;
};

const openDeleteDialog = (company: Company) => {
  currentActionCompany.value = company;
  isDeleteDialogOpen.value = true;
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
      `/api/companies?${params.toString()}`,
      {
        method: "GET",
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

const extendSubscription = async () => {
  if (!currentActionCompany.value) return;

  try {
    await $fetch(`/api/companies/${currentActionCompany.value.company_id}`, {
      method: "PATCH",
      body: {
        expiresAt: expiresAt.value.toDate("UTC").toISOString(),
      },
    });

    fetchCompanies();
  } catch (error) {
    console.error(error);
  } finally {
    isExtendDialogOpen.value = false;
  }
};

const disableCompany = async () => {
  if (!currentActionCompany.value) return;

  try {
    await $fetch(`/api/companies/${currentActionCompany.value.company_id}`, {
      method: "PATCH",
      body: {
        is_active: false,
      },
    });

    fetchCompanies();
  } catch (error) {
    console.error(error);
  } finally {
    isDisableDialogOpen.value = false;
  }
};

const deleteCompany = async () => {
  if (!currentActionCompany.value) return;

  try {
    await $fetch(`/api/companies/${currentActionCompany.value.company_id}`, {
      method: "DELETE",
    });

    fetchCompanies();
  } catch (error) {
    console.error(error);
  } finally {
    isDeleteDialogOpen.value = false;
  }
};

const enableCompany = async () => {
  if (!currentActionCompany.value) return;

  try {
    await $fetch(`/api/companies/${currentActionCompany.value.company_id}`, {
      method: "PATCH",
      body: {
        is_active: true,
      },
    });

    fetchCompanies();
  } catch (error) {
    console.error(error);
  } finally {
    isEnableDialogOpen.value = false;
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
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="relative">
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

    <UModal v-model:open="isCreateDialogOpen" :ui="{ wrapper: 'sm:max-w-xl' }">
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

    <UModal v-model:open="isExtendDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Extend Subscription for
              {{ currentActionCompany?.company_name || "" }}
            </h2>
          </template>

          <UFormField label="New Expiration Date" required>
            <DatePicker v-model="expiresAt" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="soft"
              @click="isExtendDialogOpen = false"
            >
              Cancel
            </UButton>
            <UButton color="primary" @click="extendSubscription">
              Extend
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="isDisableDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Disable Company {{ currentActionCompany?.company_name || "" }}
            </h2>
          </template>

          <p class="my-4 text-gray-600 dark:text-gray-300">
            Are you sure you want to disable the company account? This action
            will make the company inactive.
          </p>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="soft"
              @click="isDisableDialogOpen = false"
            >
              Cancel
            </UButton>
            <UButton color="warning" @click="disableCompany"> Disable </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Delete Company {{ currentActionCompany?.company_name || "" }}
            </h2>
          </template>

          <p class="my-4 text-red-600">
            This action is irreversible. Are you sure you want to permanently
            delete the company from the system?
          </p>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="soft"
              @click="isDeleteDialogOpen = false"
            >
              Cancel
            </UButton>
            <UButton color="error" @click="deleteCompany"> Delete </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="isEnableDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Restore Company {{ currentActionCompany?.company_name || "" }}
            </h2>
          </template>

          <p class="my-4 text-gray-600 dark:text-gray-300">
            Are you sure you want to restore the company account? This action
            will make the company active.
          </p>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="soft"
              @click="isEnableDialogOpen = false"
            >
              Cancel
            </UButton>
            <UButton color="success" @click="enableCompany"> Restore </UButton>
          </div>
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
            <template #company_id-cell="{ row }">
              <span class="font-semibold">{{ row.original.company_id }}</span>
            </template>

            <template #subscription_expires_at-cell="{ row }">
              <span v-if="row.original.subscription_expires_at">
                {{ fmt(row.original.subscription_expires_at) }}
              </span>
              <span v-else>—</span>
            </template>

            <template #is_active-cell="{ row }">
              <UBadge :color="row.original.is_active ? 'success' : 'error'">
                {{ row.original.is_active ? "Active" : "Inactive" }}
              </UBadge>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  @click="openExtendDialog(row.original)"
                >
                  Extend Subscription
                </UButton>
                <UButton
                  v-if="row.original.is_active"
                  size="xs"
                  color="warning"
                  variant="soft"
                  @click="openDisableDialog(row.original)"
                >
                  Disable
                </UButton>
                <UButton
                  v-else
                  size="xs"
                  color="success"
                  variant="soft"
                  @click="openEnableDialog(row.original)"
                >
                  Enable
                </UButton>
                <UButton
                  size="xs"
                  color="error"
                  variant="soft"
                  @click="openDeleteDialog(row.original)"
                >
                  Delete
                </UButton>
              </div>
            </template>
          </UTable>
        </div>
      </div>
    </div>
  </div>
</template>
