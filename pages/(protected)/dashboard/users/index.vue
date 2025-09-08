<script setup>
import { ref, onMounted } from "vue";
import { useFlowbite } from "/composables/useFlowbite.js";
import { initFlowbite } from "flowbite";
import { useUser } from "/composables/useUser";
import { useRole } from "/composables/useRole";

useHead({
  title: "User Management",
});

const { getUsers, createUser, updateUser, deleteUser, assignRoles } = useUser();
const users = ref([]);
const { getRoles } = useRole();
const loading = ref(true);
const error = ref(null);

// Form fields
const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("user");
const availableRoles = ref(["admin", "user", "manager"]); // This should come from your backend
const selectedRoles = ref([]);
const formError = ref("");
const deleteError = ref("");

const userToDelete = ref(null);
const userToEditRoles = ref(null);
const isEditing = ref(false);
const editId = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const data = await getUsers();
    users.value = data || [];
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
    console.error("Error fetching users:", err);
  }
};

const fetchRoles = async () => {
  try {
    const roles = await getRoles();
    availableRoles.value = roles.map(role => role.name);
  } catch (err) {
    console.error("Error fetching roles:", err);
    // Default roles if API fails
    availableRoles.value = ["admin", "user"];
  }
};

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    let backdrop = document.querySelector(".modal-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40";
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
  name.value = "";
  email.value = "";
  password.value = "";
  role.value = "user";
  isEditing.value = false;
  editId.value = null;
  formError.value = "";
};

const openEditModal = (user) => {
  isEditing.value = true;
  editId.value = user.id;
  name.value = user.name;
  email.value = user.email;
  password.value = ""; // Don't populate password for security
  if (user.roles && user.roles.length > 0) {
    role.value = user.roles[0].name || "user";
  }
  openModal("crud-modal");
};

const openCreateModal = () => {
  resetForm();
  openModal("crud-modal");
};

const openDeleteModal = (user) => {
  userToDelete.value = user;
  openModal("delete-modal");
};

const openRolesModal = (user) => {
  userToEditRoles.value = user;
  if (user.roles && Array.isArray(user.roles)) {
    selectedRoles.value = user.roles.map(role => 
      typeof role === 'string' ? role : role.name
    );
  } else {
    selectedRoles.value = [];
  }
  openModal("roles-modal");
};

const handleSubmit = async () => {
  formError.value = "";
  try {
    const userData = {
      name: name.value,
      email: email.value,
      role: role.value,
    };

    if (password.value) {
      userData.password = password.value;
    }

    if (isEditing.value) {
      await updateUser(editId.value, userData);
    } else {
      await createUser(userData);
    }

    resetForm();
    closeModal("crud-modal");
    await fetchUsers();
  } catch (error) {
    formError.value = error.message;
    console.error("Failed to save user", error);
  }
};

const handleDelete = async () => {
  if (!userToDelete.value) return;

  deleteError.value = "";
  try {
    await deleteUser(userToDelete.value.id);
    closeModal("delete-modal");
    await fetchUsers();
  } catch (error) {
    deleteError.value = error.message;
    console.error(`Failed to delete user ${userToDelete.value.id}`, error);
  } finally {
    userToDelete.value = null;
  }
};

const handleRoleToggle = (roleName) => {
  if (selectedRoles.value.includes(roleName)) {
    selectedRoles.value = selectedRoles.value.filter(r => r !== roleName);
  } else {
    selectedRoles.value.push(roleName);
  }
};

const handleRolesSubmit = async () => {
  if (!userToEditRoles.value) return;

  try {
    await assignRoles(userToEditRoles.value.id, selectedRoles.value);
    closeModal("roles-modal");
    await fetchUsers();
  } catch (error) {
    console.error(`Failed to update roles for user ${userToEditRoles.value.id}`, error);
  } finally {
    userToEditRoles.value = null;
  }
};

const isRoleSelected = (roleName) => {
  return selectedRoles.value.includes(roleName);
};

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  });
  fetchUsers();
    fetchRoles();
});
</script>

<template>
  <NuxtLayout name="protected">
    <template #header />
    <section class="max-w-7xl mx-auto my-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">User Management</h2>
        <Button @click="openCreateModal" class="bg-blue-700 hover:bg-blue-800">
          Add User
        </Button>
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div v-if="loading" class="p-4 text-center">
          <p>Loading users data...</p>
        </div>
        <div v-else-if="error" class="p-4 text-center text-red-500">
          <p>Error: {{ error }}</p>
        </div>
        <table v-else class="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Email</th>
              <th scope="col" class="px-6 py-3">Roles</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in users"
              :key="user.id"
              class="odd:bg-white even:bg-gray-50 border-b border-gray-200"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {{ user.name }}
              </th>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <div v-if="user.roles && user.roles.length > 0" class="flex flex-wrap gap-1">
                  <span 
                    v-for="role in user.roles" 
                    :key="typeof role === 'string' ? role : role.name" 
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {{ typeof role === 'string' ? role : role.name }}
                  </span>
                </div>
                <span v-else class="text-gray-400">No roles assigned</span>
              </td>
              <td class="px-6 py-4 flex space-x-3">
                <button
                  @click="openEditModal(user)"
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
                  @click="openRolesModal(user)"
                  class="bg-green-600 hover:bg-green-800 text-white p-2 rounded-md"
                  title="Manage Roles"
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                  <span class="sr-only">Manage Roles</span>
                </button>
                <button
                  type="button"
                  @click="openDeleteModal(user)"
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
            <tr v-if="users.length === 0">
              <td colspan="5" class="px-6 py-4 text-center">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit User Modal -->
      <div
        id="crud-modal"
        tabindex="-1"
        aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow-sm">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? "Edit User" : "Create New User" }}
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
              <div class="grid gap-4 mb-4 grid-cols-1">
                <div>
                  <Label for="name">Name</Label>
                  <Input v-model="name" type="text" id="name" placeholder="Enter user name" required />
                </div>
                <div>
                  <Label for="email">Email</Label>
                  <Input v-model="email" type="email" id="email" placeholder="name@example.com" required />
                </div>
                <div>
                  <Label for="password">
                    Password
                    <span v-if="isEditing" class="ml-1 text-xs text-gray-500">(Leave empty to keep current)</span>
                  </Label>
                  <Input
                    v-model="password"
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    :required="!isEditing"
                  />
                </div>
                <div>
                  <Label for="role">Default Role</Label>
                  <select
                    id="role"
                    v-model="role"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  >
                    <option v-for="availableRole in availableRoles" :key="availableRole" :value="availableRole">
                      {{ availableRole }}
                    </option>
                  </select>
                </div>
              </div>
              <div v-if="formError" class="text-red-500 mb-4">
                {{ formError }}
              </div>
              <Button type="submit" class="inline-flex items-center bg-blue-700 hover:bg-blue-800">
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
                {{ isEditing ? "Update User" : "Add User" }}
              </Button>
            </form>
          </div>
        </div>
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
                Are you sure you want to delete this user?
              </h3>
              <div v-if="userToDelete" class="mb-5 p-3 bg-gray-50 rounded-lg">
                <p><span class="font-semibold">Name:</span> {{ userToDelete.name }}</p>
                <p><span class="font-semibold">Email:</span> {{ userToDelete.email }}</p>
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

      <!-- Roles Management Modal -->
      <div
        id="roles-modal"
        tabindex="-1"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow-sm">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                Manage User Roles
              </h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                @click="closeModal('roles-modal')"
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

            <div class="p-4 md:p-5">
              <div v-if="userToEditRoles" class="mb-5">
                <p class="font-medium text-gray-700">Assign roles to {{ userToEditRoles.name }}</p>
                <div class="mt-4 space-y-2">
                  <div v-for="availableRole in availableRoles" :key="availableRole" class="flex items-center">
                    <input
                      type="checkbox"
                      :id="`role-${availableRole}`"
                      :checked="isRoleSelected(availableRole)"
                      @change="handleRoleToggle(availableRole)"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label :for="`role-${availableRole}`" class="ml-2 text-sm font-medium text-gray-900">
                      {{ availableRole }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="flex justify-end pt-4 border-t border-gray-200">
                <button
                  @click="handleRolesSubmit"
                  type="button"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Changes
                </button>
                <button
                  @click="closeModal('roles-modal')"
                  type="button"
                  class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <template #footer />
  </NuxtLayout>
</template>