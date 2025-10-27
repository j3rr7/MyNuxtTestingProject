import { useDebounceFn } from "@vueuse/core";

export default function () {
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
      const params = new URLSearchParams();
      if (searchQuery.value) {
        params.append("search", searchQuery.value);
      }
      params.append("page", currentPage.value.toString());
      params.append("limit", itemsPerPage.value.toString());

      const response = await $fetch<PaginatedResponse<Company>>(
        `/api/companies?${params.toString()}`,
        { method: "GET" },
      );

      companies.value = response.data;
      meta.value = response.meta;
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message;
      companies.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const getCompany = async (id: string) => {
    const response = await $fetch<Company>(`/api/companies/${id}`, {
      method: "GET",
    });
    return response;
  }

  const debouncedFetch = useDebounceFn(
    () => {
      currentPage.value = 1;
      fetchCompanies();
    },
    300,
    { maxWait: 5000 },
  );

  const createCompany = async (payload: {
    name: string;
    code: string;
    database: string;
    expiresAt: string;
  }) => {
    await $fetch("/api/companies", {
      method: "POST",
      body: payload,
    });
    await fetchCompanies();
  };

  const extendSubscription = async (companyId: string, expiresAt: string) => {
    await $fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      body: { expiresAt },
    });
    await fetchCompanies();
  };

  const disableCompany = async (companyId: string) => {
    await $fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      body: { is_active: false },
    });
    await fetchCompanies();
  };

  const enableCompany = async (companyId: string) => {
    await $fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      body: { is_active: true },
    });
    await fetchCompanies();
  };

  const deleteCompany = async (companyId: string) => {
    await $fetch(`/api/companies/${companyId}`, { method: "DELETE" });
    await fetchCompanies();
  };

  const getUsers = async (companyId: string) => {
    const response = await $fetch(`/api/companies/${companyId}/users`, { method: "GET" });
    return response.data as unknown as CompanyUser[];
  };

  const addUser = async (
    companyId: string,
    userData: { displayName: string; username: string; email: string; password: string; role: number },
  ) => {
    await $fetch(`/api/companies/${companyId}/users`, {
      method: "POST",
      body: { ...userData },
    });
  };

  return {
    companies,
    meta,
    isLoading,
    error,
    searchQuery,
    currentPage,
    itemsPerPage,
    fetchCompanies,
    getCompany,
    debouncedFetch,
    createCompany,
    extendSubscription,
    disableCompany,
    enableCompany,
    deleteCompany,

    getUsers,
    addUser,
  };
}
