<script setup lang="ts">
import TableCompany from "~/components/table/TableCompany.vue";
import useCompanies from "~/composable/useCompanies";

const { companies, searchQuery, fetchCompanies } = useCompanies();

const isCreateDialogOpen = ref(false);
const isExtendDialogOpen = ref(false);
const isDisableDialogOpen = ref(false);

onMounted(() => {
  fetchCompanies();
});
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
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
      <UButton icon="i-heroicons-plus-circle" @click="isCreateDialogOpen = true"
        >Create Company</UButton
      >
    </div>

    <UModal v-model:open="isCreateDialogOpen" :ui="{ wrapper: 'sm:max-w-xl' }">
      <template #content>
        <DialogCompanyCreate
          @created="
            () => {
              console.log('created');
            }
          "
          @cancel="
            () => {
              isCreateDialogOpen = false;
            }
          "
        />
      </template>
    </UModal>

    <UModal v-model:open="isExtendDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyExtend
          :company="companies[0]!"
          @extended="
            () => {
              console.log('extended');
            }
          "
          @cancel="
            () => {
              isExtendDialogOpen = false;
            }
          "
        />
      </template>
    </UModal>

    <UModal v-model:open="isDisableDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>

      </template>
    </UModal>

    <TableCompany
      :companies="companies"
      @extend="
        () => {
          isExtendDialogOpen = true;
        }
      "
      @disable="
        () => {
          console.log('disable');
        }
      "
      @enable="
        () => {
          console.log('enable');
        }
      "
      @delete="
        () => {
          console.log('delete');
        }
      "
    />
  </div>
</template>
