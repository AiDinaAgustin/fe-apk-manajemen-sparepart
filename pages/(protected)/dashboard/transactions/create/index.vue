<script setup>
import { ref, onMounted, computed } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useTransactions } from "/composables/services/useTransactions";
import { useSpareparts } from "/composables/services/useSpareparts";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Create Transaction",
});

const { createTransaction } = useTransactions();
const { getSpareparts } = useSpareparts();
const { hasPermission } = useAuthApi();

const canCreate = computed(() => {
  const hasPermissionValue = hasPermission("transaction.create");
  console.log("Permission check:", hasPermissionValue);
  return hasPermissionValue;
});

const nama_pemohon = ref("");
const items = ref([{ id_sparepart: "", jumlah: 1 }]);
const formError = ref("");
const loading = ref(false);
const spareparts = ref([]);
const sparepartsLoading = ref(true);

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

const fetchSpareparts = async () => {
  try {
    const response = await getSpareparts();
    spareparts.value = response.data || [];
    console.log("Spareparts loaded:", spareparts.value);
  } catch (err) {
    console.error("Error loading spareparts:", err);
    showToast("danger", `Failed to load spare parts: ${err.message}`);
  } finally {
    sparepartsLoading.value = false;
  }
};

const addItem = () => {
  items.value.push({ id_sparepart: "", jumlah: 1 });
};

const removeItem = (index) => {
  if (items.value.length > 1) {
    items.value.splice(index, 1);
  } else {
    showToast("warning", "Transaction must have at least one item");
  }
};

const validateForm = () => {
  if (!nama_pemohon.value.trim()) {
    formError.value = "Requester name is required";
    return false;
  }

  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i];
    if (!item.id_sparepart) {
      formError.value = `Please select a spare part for item #${i + 1}`;
      return false;
    }
    if (!item.jumlah || item.jumlah < 1) {
      formError.value = `Quantity must be at least 1 for item #${i + 1}`;
      return false;
    }
  }

  return true;
};

const handleSubmit = async (event) => {
  console.log("Form submission triggered");

  if (!canCreate.value) {
    console.warn("User does not have permission to create transactions");
    showToast("warning", "You don't have permission to create transactions");
    return;
  }

  formError.value = "";

  if (!validateForm()) {
    console.warn("Form validation failed:", formError.value);
    showToast("danger", formError.value);
    return;
  }

  loading.value = true;

  try {
    const formattedItems = items.value.map((item) => ({
      id_sparepart: parseInt(item.id_sparepart),
      jumlah: parseInt(item.jumlah),
    }));

    const transactionData = {
      nama_pemohon: nama_pemohon.value,
      items: formattedItems,
    };

    console.log(
      "Sending transaction data:",
      JSON.stringify(transactionData, null, 2),
    );

    const response = await createTransaction(transactionData);
    console.log("Transaction created successfully:", response);

    showToast("success", "Transaction created successfully");

    setTimeout(() => {
      navigateTo("/dashboard/transactions");
    }, 1500);
  } catch (error) {
    console.error("Transaction creation error:", error);
    formError.value = error.message;
    showToast("danger", `Failed to create transaction: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
  fetchSpareparts();

  console.log("Can create transaction:", canCreate.value);
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

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold mb-6">Create New Transaction</h2>

        <form @submit.prevent="handleSubmit">
          <div class="mb-6">
            <Label for="nama_pemohon">Requester Name</Label>
            <Input
              v-model="nama_pemohon"
              id="nama_pemohon"
              type="text"
              placeholder="Enter requester name"
              required
            />
          </div>

          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold">Transaction Items</h3>
              <button
                type="button"
                @click="addItem"
                class="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm px-5 py-2.5"
              >
                <svg
                  class="w-5 h-5 mr-1 inline"
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
                Add Item
              </button>
            </div>

            <div v-if="sparepartsLoading" class="p-4 text-center">
              <p>Loading spare parts data...</p>
            </div>

            <div v-else>
              <div
                v-for="(item, index) in items"
                :key="index"
                class="p-4 border border-gray-200 rounded-lg mb-4"
              >
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium">Item #{{ index + 1 }}</h4>
                  <button
                    v-if="items.length > 1"
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-800"
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
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label :for="`sparepart_${index}`">Spare Part</Label>
                    <select
                      :id="`sparepart_${index}`"
                      v-model="item.id_sparepart"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      required
                    >
                      <option value="">Select Spare Part</option>
                      <option
                        v-for="sparepart in spareparts"
                        :key="sparepart.id"
                        :value="sparepart.id"
                      >
                        {{ sparepart.name_sparepart }} (Stock:
                        {{ sparepart.stok || 0 }})
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label :for="`quantity_${index}`">Quantity</Label>
                    <Input
                      v-model="item.jumlah"
                      :id="`quantity_${index}`"
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="formError"
            class="mb-4 p-3 bg-red-100 text-red-800 rounded-lg"
          >
            {{ formError }}
          </div>

          <div class="flex justify-end space-x-3">
            <NuxtLink
              to="/dashboard/transactions"
              class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              class="font-medium rounded-lg text-sm px-5 py-2.5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading || !canCreate"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? "Creating..." : "Create Transaction" }}
            </button>
          </div>
        </form>
      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>
