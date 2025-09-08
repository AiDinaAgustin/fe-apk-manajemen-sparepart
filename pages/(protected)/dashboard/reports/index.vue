<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useTransactions } from "/composables/services/useTransactions";
import { useReport } from "/composables/services/useReport";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Transaction Reports",
});

const { getTransactions } = useTransactions();
const { exportTransactionToPDF, exportTransactionToExcel, exportAllTransactionsToPDF } = useReport();
const { hasPermission } = useAuthApi();

// State variables
const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const toastVisible = ref(false);
const toastType = ref("success");
const toastMessage = ref("");
const exportLoading = ref(false);

// Filter variables
const filters = reactive({
  startDate: "",
  endDate: "",
  status: "",
});

// Computed properties for filtered transactions
const filteredTransactions = computed(() => {
  let result = [...transactions.value];
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    result = result.filter(t => new Date(t.created_at) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59); // End of day
    result = result.filter(t => new Date(t.created_at) <= endDate);
  }
  
  if (filters.status) {
    result = result.filter(t => t.status === filters.status);
  }
  
  return result;
});

// Methods
const fetchTransactions = async () => {
  loading.value = true;
  try {
    const response = await getTransactions();
    transactions.value = response.data || [];
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching transactions:", err);
  } finally {
    loading.value = false;
  }
};

const handleExportPDF = async (transactionId) => {
  exportLoading.value = true;
  try {
    await exportTransactionToPDF(transactionId);
    showToast("success", "PDF exported successfully");
  } catch (err) {
    showToast("error", "Failed to export PDF: " + err.message);
  } finally {
    exportLoading.value = false;
  }
};

const handleExportExcel = async (transactionId) => {
  exportLoading.value = true;
  try {
    await exportTransactionToExcel(transactionId);
    showToast("success", "Excel exported successfully");
  } catch (err) {
    showToast("error", "Failed to export Excel: " + err.message);
  } finally {
    exportLoading.value = false;
  }
};

const handleExportAllPDF = async () => {
  exportLoading.value = true;
  try {
    await exportAllTransactionsToPDF({
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status
    });
    showToast("success", "All transactions exported to PDF successfully");
  } catch (err) {
    showToast("error", "Failed to export all transactions to PDF: " + err.message);
  } finally {
    exportLoading.value = false;
  }
};

const resetFilters = () => {
  filters.startDate = "";
  filters.endDate = "";
  filters.status = "";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const showToast = (type, message, duration = 3000) => {
  toastType.value = type;
  toastMessage.value = message;
  toastVisible.value = true;
  
  setTimeout(() => {
    hideToast();
  }, duration);
};

const hideToast = () => {
  toastVisible.value = false;
};

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
  fetchTransactions();
});
</script>

<template>
  <NuxtLayout name="protected">
    <template #header />
    <section class="max-w-7xl mx-auto my-6">
      <!-- Page Title and Export All Button -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Transaction Reports</h2>
        <Button 
          @click="handleExportAllPDF"
          :disabled="exportLoading" 
          class="bg-blue-700 hover:bg-blue-800 flex items-center"
        >
          <span v-if="exportLoading" class="mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          Export All to PDF
        </Button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <h3 class="text-lg font-semibold mb-3">Filter Transactions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label for="start-date">Start Date</Label>
            <Input 
              v-model="filters.startDate" 
              type="date" 
              id="start-date" 
            />
          </div>
          <div>
            <Label for="end-date">End Date</Label>
            <Input 
              v-model="filters.endDate" 
              type="date" 
              id="end-date" 
            />
          </div>
          <div>
            <Label for="status">Status</Label>
            <select 
              v-model="filters.status" 
              id="status"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="resetFilters"
            type="button"
            class="py-2 px-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Transaction Table -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div v-if="loading" class="p-4 text-center">
          <p>Loading transactions data...</p>
        </div>
        <div v-else-if="error" class="p-4 text-center text-red-500">
          <p>Error: {{ error }}</p>
        </div>
        <table v-else class="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Transaction ID</th>
              <th scope="col" class="px-6 py-3">Requester</th>
              <th scope="col" class="px-6 py-3">Created By</th>
              <th scope="col" class="px-6 py-3">Date</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Items</th>
              <th scope="col" class="px-6 py-3">Export</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(transaction, index) in filteredTransactions"
              :key="transaction.id"
              class="odd:bg-white even:bg-gray-50 border-b border-gray-200"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {{ transaction.no_transaksi }}
              </th>
              <td class="px-6 py-4">{{ transaction.nama_pemohon }}</td>
              <td class="px-6 py-4">{{ transaction.user?.name || 'Unknown' }}</td>
              <td class="px-6 py-4">{{ formatDate(transaction.created_at) }}</td>
              <td class="px-6 py-4">
                <span :class="`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(transaction.status)}`">
                  {{ transaction.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                {{ transaction.details?.length || 0 }} items
              </td>
              <td class="px-6 py-4 flex space-x-2">
                <button
                  @click="handleExportPDF(transaction.id)"
                  :disabled="exportLoading"
                  class="bg-red-600 hover:bg-red-800 text-white p-2 rounded-md"
                  title="Export to PDF"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span class="sr-only">Export to PDF</span>
                </button>
                <button
                  @click="handleExportExcel(transaction.id)"
                  :disabled="exportLoading"
                  class="bg-green-600 hover:bg-green-800 text-white p-2 rounded-md"
                  title="Export to Excel"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="sr-only">Export to Excel</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="8" class="px-6 py-4 text-center">
                No transactions found.
                <span v-if="filters.startDate || filters.endDate || filters.status">
                  Try clearing your filters.
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Toast notification -->
    <div
      v-if="toastVisible"
      :class="`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg ${
        toastType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`"
      role="alert"
    >
      <div v-if="toastType === 'success'" class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-500">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        <span class="sr-only">Success icon</span>
      </div>
      <div v-else class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 text-red-500">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.5 11.707-1.293 1.293L10 11.293l-2.207 2.207-1.293-1.293L8.707 10 6.5 7.793l1.293-1.293L10 8.707l2.207-2.207 1.293 1.293L11.293 10l2.207 2.207Z"/>
        </svg>
        <span class="sr-only">Error icon</span>
      </div>
      <div class="ml-3 text-sm font-normal">{{ toastMessage }}</div>
      <button
        type="button"
        @click="hideToast"
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
      >
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
    
    <template #footer />
  </NuxtLayout>
</template>