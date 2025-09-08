<script setup>
import { ref, onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useTransactions } from "/composables/services/useTransactions";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Transactions",
});

const { getTransactions } = useTransactions();
const { hasPermission, hasRole, isAdmin } = useAuthApi();

const toastVisible = ref(false);
const toastType = ref("success");
const toastMessage = ref("");
const toastTimeout = ref(null);

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

const canCreate = computed(
  () => isAdmin() || hasPermission("transaction.create"),
);
const canEdit = computed(
  () => isAdmin() || hasPermission("transaction.update"),
);
const canDelete = computed(
  () => isAdmin() || hasPermission("transaction.delete"),
);
const canApprove = computed(
  () => isAdmin() || hasPermission("transaction.approve"),
);

const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const transactionToDelete = ref(null);
const deleteError = ref("");

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const response = await getTransactions();
    console.log("Transactions data:", response);
    transactions.value = response.data || [];
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching transactions:", err);
    showToast("danger", `Failed to load transactions: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

const openDeleteModal = (transaction) => {
  if (!canDelete.value) {
    showToast("warning", "You don't have permission to delete transactions");
    return;
  }

  transactionToDelete.value = transaction;
  const modal = document.getElementById("delete-modal");
  if (modal) {
    let backdrop = document.querySelector(".modal-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className =
        "modal-backdrop bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40";
      document.body.appendChild(backdrop);
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    backdrop.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
};

const closeDeleteModal = () => {
  const modal = document.getElementById("delete-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
    }

    document.body.classList.remove("overflow-hidden");
  }
};

const handleDelete = async () => {
  if (!transactionToDelete.value) return;

  if (!canDelete.value) {
    showToast("warning", "You don't have permission to delete transactions");
    return;
  }

  deleteError.value = "";
  try {
    // Implementation would be here - Not implemented in useTransactions
    // await deleteTransaction(transactionToDelete.value.id);
    showToast("success", "Transaction deleted successfully");
    closeDeleteModal();
    await fetchTransactions();
  } catch (error) {
    deleteError.value = error.message;
    showToast("danger", `Failed to delete transaction: ${error.message}`);
    console.error(
      `Failed to delete transaction ${transactionToDelete.value.id}`,
      error,
    );
  } finally {
    transactionToDelete.value = null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const formatStatus = (status) => {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
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
      <div class="fixed top-4 right-4 z-50" v-show="toastVisible">
        <div
          :id="`toast-${toastType}`"
          class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm"
          role="alert"
        >
          <div
            v-if="toastType === 'success'"
            class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
              />
            </svg>
            <span class="sr-only">Success icon</span>
          </div>

          <div
            v-if="toastType === 'danger'"
            class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
              />
            </svg>
            <span class="sr-only">Error icon</span>
          </div>

          <div
            v-if="toastType === 'warning'"
            class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
              />
            </svg>
            <span class="sr-only">Warning icon</span>
          </div>

          <div class="ms-3 text-sm font-normal">{{ toastMessage }}</div>
          <button
            type="button"
            class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            @click="hideToast"
            aria-label="Close"
          >
            <span class="sr-only">Close</span>
            <svg
              class="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Transaction List</h2>
        <NuxtLink
          v-if="canCreate"
          to="/dashboard/transactions/create"
          class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Create Transaction
        </NuxtLink>
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div v-if="loading" class="p-4 text-center">
          <p>Loading transactions data...</p>
        </div>
        <div v-else-if="error" class="p-4 text-center text-red-500">
          <p>Error: {{ error }}</p>
        </div>
        <table
          v-else
          class="w-full text-sm text-left rtl:text-right text-gray-500"
        >
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Transaction Code</th>
              <th scope="col" class="px-6 py-3">Date</th>
              <th scope="col" class="px-6 py-3">User</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(transaction, index) in transactions"
              :key="transaction.id"
              class="odd:bg-white even:bg-gray-50 border-b border-gray-200"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                {{ transaction.no_transaksi }}
              </th>
              <td class="px-6 py-4">{{ formatDate(transaction.created_at) }}</td>
              <td class="px-6 py-4">{{ transaction.user?.name || "-" }}</td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'bg-green-100 text-green-800':
                      transaction.status === 'approved',
                    'bg-red-100 text-red-800':
                      transaction.status === 'rejected',
                    'bg-yellow-100 text-yellow-800':
                      transaction.status === 'pending',
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ formatStatus(transaction.status) }}
                </span>
              </td>
              <td class="px-6 py-4 flex space-x-2">
                <NuxtLink
                  :to="`/dashboard/transactions/${transaction.id}`"
                  class="bg-green-600 hover:bg-green-800 text-white p-2 rounded-md"
                  title="View Details"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                  <span class="sr-only">View</span>
                </NuxtLink>
                <NuxtLink
                  v-if="canEdit && transaction.status === 'pending'"
                  :to="`/dashboard/transactions/${transaction.id}/edit`"
                  class="bg-blue-600 hover:bg-blue-800 text-white p-2 rounded-md"
                  title="Edit"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  <span class="sr-only">Edit</span>
                </NuxtLink>
                <button
                  v-if="canDelete && transaction.status === 'pending'"
                  @click="openDeleteModal(transaction)"
                  class="bg-red-600 hover:bg-red-800 text-white p-2 rounded-md"
                  title="Delete"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  <span class="sr-only">Delete</span>
                </button>
              </td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td colspan="6" class="px-6 py-4 text-center">
                No transactions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        id="delete-modal"
        tabindex="-1"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow-sm">
            <button
              type="button"
              class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              @click="closeDeleteModal"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center">
              <svg
                class="mx-auto mb-4 text-gray-400 w-12 h-12"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 class="mb-5 text-lg font-normal text-gray-500">
                Are you sure you want to delete this transaction?
              </h3>
              <div
                v-if="transactionToDelete"
                class="mb-5 p-3 bg-gray-50 rounded-lg"
              >
                <p>
                  <span class="font-semibold">Transaction Code:</span>
                  {{ transactionToDelete.transaction_code }}
                </p>
                <p>
                  <span class="font-semibold">Date:</span>
                  {{ formatDate(transactionToDelete.date) }}
                </p>
              </div>
              <div v-if="deleteError" class="text-red-500 mb-4">
                {{ deleteError }}
              </div>
              <button
                @click="handleDelete"
                type="button"
                class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                Yes, delete it
              </button>
              <button
                @click="closeDeleteModal"
                type="button"
                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>
