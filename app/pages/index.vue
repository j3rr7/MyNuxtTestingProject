<script setup lang="ts">
type StatItem = {
  name: string;
  label: string;
  value: number;
};

type StatsResponse = {
  stats: StatItem[];
};

const { data } = useFetch<StatsResponse>("/api/dashboard/stats", {
  lazy: true,
});

const statistics = computed(() => {
  if (!data?.value?.stats) {
    return [];
  }

  return data?.value?.stats.map((v) => {
    if (v.name === "new_inquiries") {
      return {
        label: "New Inquiries",
        value: v.value,
        icon: "i-heroicons-chat-bubble-left-right",
        bgColor: "bg-blue-500",
      };
    } else if (v.name === "open_tickets") {
      return {
        label: "Open Tickets",
        value: v.value,
        icon: "i-heroicons-ticket",
        bgColor: "bg-red-500",
      };
    } else if (v.name === "tickets_resolved_today") {
      return {
        label: "Resolved Today",
        value: v.value,
        icon: "i-heroicons-check-circle",
        bgColor: "bg-green-500",
      };
    } else if (v.name === "total_tickets") {
      return {
        label: "Total Tickets",
        value: v.value,
        icon: "i-heroicons-ticket",
        bgColor: "bg-gray-500",
      }
    }
    else {
      return {
        label: v.label,
        value: v.value,
        icon: "i-heroicons-chart-bar",
        bgColor: "bg-gray-500",
      };
    }
  });
});

const quickActions = [
  {
    title: "Companies",
    description: "View and manage your companies",
    icon: "i-heroicons-building-library",
    to: "/companies",
    permission: "company:read",
  },
  {
    title: "View Tickets",
    description: "Browse and respond to customer support tickets",
    icon: "i-heroicons-plus-circle",
    to: "/tickets",
    permission: "ticket:read",
  },
  {
    title: "View Inquiries",
    description: "Browse and respond to customer inquiries",
    icon: "i-heroicons-envelope",
    to: "/inquiries",
    permission: "inquiry:read",
  },
  {
    title: "Manage Billing",
    description: "View and manage company billing information",
    icon: "i-heroicons-credit-card",
    to: "/billing",
    permission: "billing:read;billing:write;billing:delete",
  },
  {
    title: "Invoices",
    description: "View and manage company invoices",
    icon: "i-heroicons-currency-dollar",
    to: "/invoices",
    permission: "invoice:read;invoice:write;invoice:delete",
  },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard
        v-for="stat in statistics"
        :key="stat?.label"
        class="rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ stat?.label }}
            </p>
            <p class="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
              {{ stat?.value }}
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="stat?.bgColor"
          >
            <UIcon :name="stat?.icon || ''" class="text-white w-6 h-6" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard
          v-for="action in quickActions"
          :key="action.title"
          class="group hover:shadow-md transition-shadow rounded-xl cursor-pointer"
        >
          <NuxtLink :to="action.to">
            <div class="flex items-start justify-between">
              <div>
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {{ action.title }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  {{ action.description }}
                </p>
              </div>
              <div
                class="w-10 h-10 rounded-full p-2.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors"
              >
                <UIcon :name="action.icon" class="w-5 h-5" />
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Recent Activity</h2>
        <UButton size="xs" color="neutral" variant="link" to="/activity">
          View All
        </UButton>
      </div>

      <UCard class="rounded-xl"> ... </UCard>
    </div>
  </div>
</template>
