<script setup lang="ts">
import TableCompanyUsers from '~/components/table/TableCompanyUsers.vue';
import useCompanies from '~/composable/useCompanies';

const route = useRoute();
const companyId = route.params.id;
const users = ref<CompanyUser[] | null>(null);

const { getUsers, getCompany, addUser } = useCompanies();

const isAddUserDialogOpen = ref(false);

const currentCompany = await getCompany(companyId as string)

onMounted(async () => {
  users.value = await getUsers(companyId as string);
})
</script>

<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
            Company Users
          </h2>
          <div class="flex gap-2">
            <UButton icon="i-heroicons-plus-20-solid" color="primary" @click="isAddUserDialogOpen = true">
              Add User
            </UButton>
            <UButton variant="outline" to="/companies" icon="i-heroicons-arrow-left-20-solid">
              Back to Companies
            </UButton>
          </div>
        </div>
      </template>

      <template v-if="users">
        <TableCompanyUsers :users="users" />
      </template>
      <template v-else>
        <div class="flex justify-center items-center">
          <h2 class="text-2xl font-semibold leading-tight">
            No Users Found
          </h2>
        </div>
      </template>
    </UCard>

    <UModal v-model:open="isAddUserDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyAddUser 
          :company="currentCompany" 
          @added="addUser" 
          @cancel="
            () => {
              isAddUserDialogOpen = false;
            }
          " />
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped></style>