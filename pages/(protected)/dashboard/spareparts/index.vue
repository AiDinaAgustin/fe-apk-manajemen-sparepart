<script setup>
import { ref, onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useSpareparts } from "/composables/services/useSpareparts";
import { useAuthApi } from "/composables/useAuth";

useHead({
  title: "Spareparts",
});

const {
  getSpareparts,
  getSparepartById,
  createSparepart,
  updateSparepart,
  deleteSparepart,
} = useSpareparts();
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
  () => isAdmin() || hasPermission("sparepart.create"),
);
const canEdit = computed(() => isAdmin() || hasPermission("sparepart.update"));
const canDelete = computed(
  () => isAdmin() || hasPermission("sparepart.delete"),
);

const spareparts = ref([]);
const loading = ref(true);
const error = ref(null);

const name_sparepart = ref("");
const minimal_stok = ref(0);
const stok = ref(0);
const formError = ref("");
const deleteError = ref("");

const sparepartToDelete = ref(null);
const selectedSparepart = ref(null);
const loadingDetails = ref(false);

const isEditing = ref(false);
const editId = ref(null);

const fetchSpareparts = async () => {
  loading.value = true;
  try {
    const response = await getSpareparts();
    console.log("Spareparts data:", response);
    spareparts.value = response.data || [];
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
    console.error("Error fetching spareparts:", err);
    showToast("danger", `Failed to load spareparts: ${err.message}`);
  }
};

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
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

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
    }

    const otherBackdrop = document.querySelector(".bg-gray-900\\/50");
    if (otherBackdrop) {
      document.body.removeChild(otherBackdrop);
    }

    document.body.classList.remove("overflow-hidden");
  }
};

const resetForm = () => {
  name_sparepart.value = "";
  minimal_stok.value = 0;
  stok.value = 0;
  isEditing.value = false;
  editId.value = null;
  formError.value = "";
};

const openEditModal = (sparepart) => {
  if (!canEdit.value) {
    showToast("warning", "You don't have permission to edit spareparts");
    return;
  }

  isEditing.value = true;
  editId.value = sparepart.id;
  name_sparepart.value = sparepart.name_sparepart;
  minimal_stok.value = sparepart.minimal_stok || 0;
  stok.value = sparepart.stok || 0;
  openModal("crud-modal");
};

const openCreateModal = () => {
  if (!canCreate.value) {
    showToast("warning", "You don't have permission to create spareparts");
    return;
  }

  resetForm();
  openModal("crud-modal");
};

const openDeleteModal = (sparepart) => {
  if (!canDelete.value) {
    showToast("warning", "You don't have permission to delete spareparts");
    return;
  }

  sparepartToDelete.value = sparepart;
  openModal("delete-modal");
};

const openDetailModal = async (sparepart) => {
  loadingDetails.value = true;
  selectedSparepart.value = sparepart;
  openModal("detail-modal");

  try {
    const response = await getSparepartById(sparepart.id);
    selectedSparepart.value = response.data;
  } catch (error) {
    console.error(`Failed to fetch sparepart details: ${error.message}`);
    showToast("danger", `Failed to load complete details: ${error.message}`);
  } finally {
    loadingDetails.value = false;
  }
};

const handleSubmit = async () => {
  formError.value = "";
  try {
    if (
      (isEditing.value && !canEdit.value) ||
      (!isEditing.value && !canCreate.value)
    ) {
      const action = isEditing.value ? "edit" : "create";
      showToast("warning", `You don't have permission to ${action} spareparts`);
      return;
    }

    const sparepartData = {
      name_sparepart: name_sparepart.value,
      minimal_stok: parseInt(minimal_stok.value),
      stok: parseInt(stok.value),
    };

    if (isEditing.value) {
      await updateSparepart(editId.value, sparepartData);
      showToast("success", "Sparepart updated successfully");
    } else {
      await createSparepart(sparepartData);
      showToast("success", "Sparepart created successfully");
    }

    resetForm();
    closeModal("crud-modal");
    await fetchSpareparts();
  } catch (error) {
    formError.value = error.message;
    showToast("danger", `Failed to save sparepart: ${error.message}`);
    console.error("Failed to save sparepart", error);
  }
};

const handleDelete = async () => {
  if (!sparepartToDelete.value) return;

  if (!canDelete.value) {
    showToast("warning", "You don't have permission to delete spareparts");
    return;
  }

  deleteError.value = "";
  try {
    await deleteSparepart(sparepartToDelete.value.id);
    showToast("success", "Sparepart deleted successfully");
    closeModal("delete-modal");
    await fetchSpareparts();
  } catch (error) {
    deleteError.value = error.message;
    showToast("danger", `Failed to delete sparepart: ${error.message}`);
    console.error(
      `Failed to delete sparepart ${sparepartToDelete.value.id}`,
      error,
    );
  } finally {
    sparepartToDelete.value = null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
  fetchSpareparts();
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
        <h2 class="text-xl font-bold">Sparepart List</h2>
        <Button
          v-if="canCreate"
          @click="openCreateModal"
          class="bg-blue-700 hover:bg-blue-800"
        >
          Add Sparepart
        </Button>
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div v-if="loading" class="p-4 text-center">
          <p>Loading spareparts data...</p>
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
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Minimal Stok</th>
              <th scope="col" class="px-6 py-3">Stok</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(sparepart, index) in spareparts"
              :key="sparepart.id"
              class="odd:bg-white even:bg-gray-50 border-b border-gray-200"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                {{ sparepart.name_sparepart }}
              </th>
              <td class="px-6 py-4">{{ sparepart.minimal_stok || 0 }}</td>
              <td class="px-6 py-4">{{ sparepart.stok || 0 }}</td>
              <td class="px-6 py-4 flex space-x-3">
                <button
                  @click="openDetailModal(sparepart)"
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
                </button>
                <button
                  v-if="canEdit"
                  @click="openEditModal(sparepart)"
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
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  @click="openDeleteModal(sparepart)"
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
                <div
                  v-if="!canEdit && !canDelete"
                  class="text-gray-400 italic text-sm"
                >
                  No actions available
                </div>
              </td>
            </tr>
            <tr v-if="spareparts.length === 0">
              <td colspan="5" class="px-6 py-4 text-center">
                No spareparts found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        id="detail-modal"
        tabindex="-1"
        aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow-sm">
            <div
              class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                Sparepart Details
              </h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                @click="closeModal('detail-modal')"
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
            </div>

            <div class="p-4 md:p-5" v-if="selectedSparepart">
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">ID</p>
                      <p class="font-medium text-gray-900">
                        {{ selectedSparepart.id }}
                      </p>
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">Name</p>
                      <p class="font-medium text-gray-900">
                        {{ selectedSparepart.name_sparepart }}
                      </p>
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">Minimal Stock</p>
                      <p class="font-medium text-gray-900">
                        {{ selectedSparepart.minimal_stok || 0 }}
                      </p>
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">Current Stock</p>
                      <p class="font-medium text-gray-900">
                        {{ selectedSparepart.stok || 0 }}
                      </p>
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">Created At</p>
                      <p class="font-medium text-gray-900">
                        {{ formatDate(selectedSparepart.created_at) }}
                      </p>
                    </div>
                    <div class="text-sm">
                      <p class="font-semibold text-gray-500">Updated At</p>
                      <p class="font-medium text-gray-900">
                        {{ formatDate(selectedSparepart.updated_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end mt-6">
                <button
                  @click="closeModal('detail-modal')"
                  type="button"
                  class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="crud-modal"
        tabindex="-1"
        aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow-sm">
            <div
              class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? "Edit Sparepart" : "Create New Sparepart" }}
              </h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                @click="closeModal('crud-modal')"
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
            </div>

            <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
              <div class="grid gap-4 mb-4 grid-cols-2">
                <div class="col-span-2">
                  <Label for="name_sparepart">Name</Label>
                  <Input
                    v-model="name_sparepart"
                    type="text"
                    id="name_sparepart"
                    placeholder="Enter sparepart name"
                    required
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <Label for="minimal_stok">Minimal Stock</Label>
                  <Input
                    v-model="minimal_stok"
                    type="number"
                    id="minimal_stok"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <Label for="stok">Current Stock</Label>
                  <Input
                    v-model="stok"
                    type="number"
                    id="stok"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div v-if="formError" class="text-red-500 mb-4">
                {{ formError }}
              </div>
              <Button
                type="submit"
                class="inline-flex items-center bg-blue-700 hover:bg-blue-800"
              >
                <svg
                  v-if="!isEditing"
                  class="me-1 -ms-1 w-5 h-5"
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
                <svg
                  v-else
                  class="me-1 -ms-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  ></path>
                </svg>
                {{ isEditing ? "Update Sparepart" : "Add Sparepart" }}
              </Button>
            </form>
          </div>
        </div>
      </div>

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
              @click="closeModal('delete-modal')"
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
                Are you sure you want to delete this sparepart?
              </h3>
              <div
                v-if="sparepartToDelete"
                class="mb-5 p-3 bg-gray-50 rounded-lg"
              >
                <p>
                  <span class="font-semibold">Name:</span>
                  {{ sparepartToDelete.name_sparepart }}
                </p>
                <p>
                  <span class="font-semibold">Current Stock:</span>
                  {{ sparepartToDelete.stok || 0 }}
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
                @click="closeModal('delete-modal')"
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
