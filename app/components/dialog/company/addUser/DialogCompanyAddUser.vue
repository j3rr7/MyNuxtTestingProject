<script setup lang="ts">

const props = defineProps<{ company: Company | null }>();
const emit = defineEmits(["cancel", "added"]);
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Add User to {{ props.company?.company_name }}</h2>
        <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="emit('cancel')" />
      </div>
    </template>

    <div class="text-sm font-medium">Add a user to this company</div>
  </UCard>
</template>