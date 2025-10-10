<script setup lang="ts">
import TableCompany from "~/components/table/TableCompany.vue";
import useCompanies from "~/composable/useCompanies";

const { companies, searchQuery, fetchCompanies, debouncedFetch } =
  useCompanies();

const isCreateDialogOpen = ref(false);
const isExtendDialogOpen = ref(false);
const isDisableDialogOpen = ref(false);
const isEnableDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isAddUserDialogOpen = ref(false);

const selectedCompany = ref<Company | null>(null);

const api = {
  createCompany: async (new_company: {
    name: string;
    code: string;
    database: string;
    expiresAt: string;
  }) => {
    console.log("createCompany", new_company);

    try {
      const response = await $fetch("/api/companies", {
        method: "POST",
        body: new_company,
      });

      console.log(response);

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      isCreateDialogOpen.value = false;
    }
  },

  extendExpiration: async (_company: {
    companyId: string;
    expiresAt: string;
  }) => {
    console.log("extendExpiration", _company);

    try {
      const response = await $fetch(`/api/companies/${_company.companyId}`, {
        method: "PATCH",
        body: { expiresAt: _company.expiresAt },
      });

      console.log(response);

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      isExtendDialogOpen.value = false;
    }
  },

  disableCompany: async (_companyId: string) => {
    console.log("disableCompany", _companyId);

    try {
      const response = await $fetch(`/api/companies/${_companyId}`, {
        method: "PATCH",
        body: { isActive: false },
      });

      console.log(response);

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      isDisableDialogOpen.value = false;
    }
  },

  enableCompany: async (_companyId: string) => {
    console.log("enableCompany", _companyId);

    try {
      const response = await $fetch(`/api/companies/${_companyId}`, {
        method: "PATCH",
        body: { isActive: true },
      });

      console.log(response);

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      isEnableDialogOpen.value = false;
    }
  },

  deleteCompany: async (_companyId: string, _reason: string) => {
    console.log("deleteCompany", _companyId);

    try {
      const response = await $fetch(`/api/companies/${_companyId}`, {
        method: "DELETE",
        body: { reason: _reason },
      });

      console.log(response);

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      isDeleteDialogOpen.value = false;
    }
  },

  addUser: async (_user: { displayName: string; username: string; email: string; password: string; role: number, companyId: string }) => {
    try {
      const response = await $fetch(`/api/companies/${_user.companyId}/users`, {
        method: "POST",
        body: _user,
      });

      console.log(response);

    } catch (error) {
      console.error(error);
    } finally {
      isAddUserDialogOpen.value = false;
    }
  }
};

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
      <UInput v-model="searchQuery" icon="i-lucide-search" variant="outline" type="text"
        placeholder="Search by company name or code..." :ui="{
          base: 'min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] w-full',
        }" />
      <UButton icon="i-heroicons-plus-circle" @click="isCreateDialogOpen = true">Create Company</UButton>
    </div>

    <UModal v-model:open="isCreateDialogOpen" :ui="{ wrapper: 'sm:max-w-xl' }">
      <template #content>
        <DialogCompanyCreate @created="api.createCompany" @cancel="
          () => {
            isCreateDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <UModal v-model:open="isExtendDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyExtend :company="selectedCompany" @extended="api.extendExpiration" @cancel="
          () => {
            isExtendDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <UModal v-model:open="isDisableDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyDisable :company="selectedCompany" @disabled="api.disableCompany" @cancel="
          () => {
            isDisableDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <UModal v-model:open="isEnableDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyEnable :company="selectedCompany" @enabled="api.enableCompany" @cancel="
          () => {
            isEnableDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <UModal v-model:open="isDeleteDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyDelete :company="selectedCompany" @deleted="api.deleteCompany" @cancel="
          () => {
            isDeleteDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <UModal v-model:open="isAddUserDialogOpen" :ui="{ wrapper: 'sm:max-w-md' }">
      <template #content>
        <DialogCompanyAddUser :company="selectedCompany" @added="api.addUser" @cancel="
          () => {
            isAddUserDialogOpen = false;
          }
        " />
      </template>
    </UModal>

    <TableCompany :companies="companies" @extend="
      (_selectedCompany) => {
        selectedCompany = _selectedCompany;
        isExtendDialogOpen = true;
      }
    " @disable="
        (_selectedCompany) => {
          selectedCompany = _selectedCompany;
          isDisableDialogOpen = true;
        }
      " @enable="
        (_selectedCompany) => {
          selectedCompany = _selectedCompany;
          isEnableDialogOpen = true;
        }
      " @delete="
        (_selectedCompany) => {
          selectedCompany = _selectedCompany;
          isDeleteDialogOpen = true;
        }
      " @add-user="
        (_selectedCompany) => {
          selectedCompany = _selectedCompany;
          isAddUserDialogOpen = true;
        }
      " />
  </div>
</template>
