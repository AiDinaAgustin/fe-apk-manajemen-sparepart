export const useUser = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const tokenCookie = useCookie("access_token");
  const userCookie = useCookie("user_data");
  const permissionsCookie = useCookie("user_permissions");
  const rolesCookie = useCookie("user_roles");
//   const { getAuthHeaders } = useAuthApi();

  /**
   * Get all users
   */

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenCookie.value}`,
    };
  };
  const getUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  };

  /**
   * Get a specific user
   */
  const getUser = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  };

  /**
   * Create a new user
   */
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };

  /**
   * Update a user
   */
  const updateUser = async (id, userData) => {
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  };

  /**
   * Delete a user
   */
  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  };

  /**
   * Assign roles to a user
   */
  const assignRoles = async (id, roles) => {
    try {
      const response = await fetch(`${apiUrl}/users/${id}/roles`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ roles }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to assign roles to user ${id}:`, error);
      throw error;
    }
  };

  return {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    assignRoles,
  };
};