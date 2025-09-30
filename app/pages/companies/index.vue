<script setup lang="ts">
import type { Company, Meta, PaginatedResponse } from "~~/shared/types";
import { useDebounceFn } from "@vueuse/core";

const companies = ref<Company[]>([]);
const meta = ref<Meta | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(15);

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
          <UButton
            type="button"
          >
            Create Company
          </UButton>
        </div>
      </div>

      <div class="rounded-lg shadow-lg overflow-hidden border">
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
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-4">Loading companies...</p>
        </div>

        <div
          v-else-if="error"
          class="p-8 text-center bg-red-50 text-red-700 rounded-lg"
        >
          <h3 class="text-xl font-semibold">An Error Occurred</h3>
          <p class="mt-2">{{ error }}</p>
          <button
            class="mt-4 px-4 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500"
            @click="fetchCompanies"
          >
            Try Again
          </button>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y">
              <thead>
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                  >
                    Company Name
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Company Code
                  </th>
                  <th
                    scope="col"
                    class="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Database
                  </th>
                  <th
                    scope="col"
                    class="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Subscription Expires
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody v-if="companies.length > 0" class="divide-y">
                <tr v-for="company in companies" :key="company.company_id">
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6"
                  >
                    <div class="font-medium">
                      {{ company.company_name }}
                    </div>
                    <div class="lg:hidden mt-1">
                      {{ company.database_name }}
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        company.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-current',
                      ]"
                    >
                      {{ company.is_active ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td
                    class="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm"
                  >
                    {{ company.company_code }}
                  </td>
                  <td
                    class="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm"
                  >
                    {{ company.database_name }}
                  </td>
                  <td
                    class="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm"
                  >
                    {{ fmt(company.subscription_expires_at) }}
                  </td>
                  <td
                    class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                  >
                    <a href="#" class="text-indigo-600 hover:text-indigo-900"
                      >Edit<span class="sr-only"
                        >, {{ company.company_name }}</span
                      ></a
                    >
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td colspan="6" class="text-center py-12 px-6">
                    <svg
                      class="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        vector-effect="non-scaling-stroke"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 class="mt-2 text-lg font-semibold">
                      No Companies Found
                    </h3>
                    <p class="mt-1 text-sm">
                      No results for your search query. Try using different
                      keywords.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>