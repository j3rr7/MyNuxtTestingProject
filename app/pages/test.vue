<script setup lang="ts">
import TableCompany from "~/components/table/TableCompany.vue";
import useCompanies from "~/composable/useCompanies";

const { companies, fetchCompanies } = useCompanies();

onMounted(() => {
  fetchCompanies();
});
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <DialogCompanyCreate 
      @created="() => {console.log('created')}"
      @cancel="() => {console.log('cancel')}"
    />

    <DialogCompanyExtend 
      :company="companies[0]!"
      @extended="() => {console.log('extended')}"
      @cancel="() => {console.log('cancel')}"
    />

    <TableCompany 
      :companies="companies" 
      @extend="() => {console.log('extend')}" 
      @disable="() => {console.log('disable')}"
      @enable="() => {console.log('enable')}"
      @delete="() => {console.log('delete')}"
    />
  </div>
</template>
