<script setup>
import { ref, onMounted, computed } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useTransactions } from "/composables/services/useTransactions";
import { useReport } from "/composables/services/useReport";
import { useAuthApi } from "/composables/useAuth";
import { useRoute, useRouter } from "vue-router";

useHead({
  title: "Transaction Details",
});

const route = useRoute();
const router = useRouter();
const transactionId = route.params.id;

const { getTransactionById, approveTransaction, rejectTransaction } = useTransactions();
const { exportTransactionToPDF, exportTransactionToExcel } = useReport();
const { hasPermission } = useAuthApi();

const transaction = ref(null);
const loading = ref(true);
const error = ref(null);
const actionLoading = ref(false);
const exportLoading = ref(false);

const toastVisible = ref(false);
const toastType = ref("success");
const toastMessage = ref("");
const toastTimeout = ref(null);

// Permissions
const canApprove = computed(() => hasPermission("transaction.approve"));
const canReject = computed(() => hasPermission("transaction.reject"));

const showToast = (type, message, duration = 3000) => {
  toastType.value = type;
  toastMessage.value = message;
  toastVisible.value = true;

  if (toastTimeout.value) clearTimeout(toastTimeout.value);
  
  toastTimeout.value = setTimeout(() => {
    hideToast();
  }, duration);
};

const hideToast = () => {
  toastVisible.value = false;
};

const fetchTransaction = async () => {
  loading.value = true;
  try {
    const response = await getTransactionById(transactionId);
    transaction.value = response.data;
  } catch (err) {
    error.value = err.message;
    console.error(`Error fetching transaction ${transactionId}:`, err);
    showToast("danger", `Failed to load transaction: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

const handleApprove = async () => {
  if (!canApprove.value) {
    showToast("warning", "You don't have permission to approve transactions");
    return;
  }

  actionLoading.value = true;
  try {
    await approveTransaction(transactionId);
    await fetchTransaction();
    showToast("success", "Transaction approved successfully");
  } catch (err) {
    console.error(`Error approving transaction ${transactionId}:`, err);
    showToast("danger", `Failed to approve transaction: ${err.message}`);
  } finally {
    actionLoading.value = false;
  }
};

const handleReject = async () => {
  if (!canReject.value) {
    showToast("warning", "You don't have permission to reject transactions");
    return;
  }

  actionLoading.value = true;
  try {
    await rejectTransaction(transactionId);
    await fetchTransaction();
    showToast("success", "Transaction rejected successfully");
  } catch (err) {
    console.error(`Error rejecting transaction ${transactionId}:`, err);
    showToast("danger", `Failed to reject transaction: ${err.message}`);
  } finally {
    actionLoading.value = false;
  }
};

const handleExportPDF = async () => {
  exportLoading.value = true;
  try {
    await exportTransactionToPDF(transactionId);
    showToast("success", "PDF exported successfully");
  } catch (err) {
    showToast("danger", `Failed to export PDF: ${err.message}`);
  } finally {
    exportLoading.value = false;
  }
};

const handleExportExcel = async () => {
  exportLoading.value = true;
  try {
    await exportTransactionToExcel(transactionId);
    showToast("success", "Excel exported successfully");
  } catch (err) {
    showToast("danger", `Failed to export Excel: ${err.message}`);
  } finally {
    exportLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const getStatusBadgeClass = (status) => {
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

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
  fetchTransaction();
});
</script>

<template>
  <NuxtLayout name="protected">
    <template #header />
    <section class="max-w-7xl mx-auto my-6">
      <!-- Toast notification -->
      <div
        v-if="toastVisible"
        :class="`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg ${
          toastType === 'success' 
            ? 'bg-green-50 text-green-800' 
            : toastType === 'danger'
              ? 'bg-red-50 text-red-800'
              : 'bg-yellow-50 text-yellow-800'
        }`"
        role="alert"
      >
        <div v-if="toastType === 'success'" class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-500">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          <span class="sr-only">Success icon</span>
        </div>
        <div v-else-if="toastType === 'danger'" class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 text-red-500">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.5 11.707-1.293 1.293L10 11.293l-2.207 2.207-1.293-1.293L8.707 10 6.5 7.793l1.293-1.293L10 8.707l2.207-2.207 1.293 1.293L11.293 10l2.207 2.207Z"/>
          </svg>
          <span class="sr-only">Error icon</span>
        </div>
        <div v-else class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-100 text-yellow-500">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
          </svg>
          <span class="sr-only">Warning icon</span>
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

      <div class="mb-6">
        <NuxtLink
          to="/dashboard/transactions"
          class="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            class="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Transactions
        </NuxtLink>
      </div>

      <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6 flex justify-center">
        <p>Loading transaction details...</p>
      </div>

      <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-6">
        <div class="p-4 text-center text-red-500">
          <p>Error: {{ error }}</p>
        </div>
      </div>

      <div v-else-if="transaction" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Transaction Details</h2>
          <div class="flex space-x-2">
            <NuxtLink
              v-if="transaction.status === 'pending'"
              :to="`/dashboard/transactions/${transactionId}/edit`"
              class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Edit
            </NuxtLink>
            <div class="flex items-center space-x-2">
              <button
                @click="handleExportPDF"
                :disabled="exportLoading"
                class="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                PDF
              </button>
              <button
                @click="handleExportExcel"
                :disabled="exportLoading"
                class="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction info card -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-lg mb-3">Transaction Information</h3>
            <div class="space-y-2">
              <div class="flex flex-col">
                <span class="text-sm text-gray-500">Transaction No</span>
                <span class="font-medium">{{ transaction.no_transaksi }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-gray-500">Status</span>
                <span :class="`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${getStatusBadgeClass(transaction.status)}`">
                  {{ transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : '-' }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-gray-500">Date Created</span>
                <span>{{ formatDate(transaction.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-lg mb-3">Requester Information</h3>
            <div class="space-y-2">
              <div class="flex flex-col">
                <span class="text-sm text-gray-500">Requester Name</span>
                <span class="font-medium">{{ transaction.nama_pemohon }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-gray-500">Created By</span>
                <span>{{ transaction.user?.name || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction items -->
        <div class="mb-6">
          <h3 class="font-medium text-lg mb-3">Transaction Items</h3>
          <div class="relative overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3">No</th>
                  <th scope="col" class="px-6 py-3">Spare Part</th>
                  <th scope="col" class="px-6 py-3">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in transaction.details" :key="item.id" class="bg-white border-b">
                  <td class="px-6 py-4">{{ index + 1 }}</td>
                  <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {{ item.sparepart?.name_sparepart || 'Unknown Spare Part' }}
                  </th>
                  <td class="px-6 py-4">{{ item.jumlah }}</td>
                </tr>
                <tr v-if="!transaction.details || transaction.details.length === 0">
                  <td colspan="3" class="px-6 py-4 text-center">No items in this transaction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action buttons for pending transactions -->
        <div v-if="transaction.status === 'pending'" class="border-t pt-4 flex justify-end space-x-3">
          <button
            v-if="canReject"
            @click="handleReject"
            :disabled="actionLoading"
            class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
          >
            <span v-if="actionLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Reject Transaction
          </button>
          <button
            v-if="canApprove"
            @click="handleApprove"
            :disabled="actionLoading"
            class="py-2.5 px-5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
          >
            <span v-if="actionLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Approve Transaction
          </button>
        </div>
      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>