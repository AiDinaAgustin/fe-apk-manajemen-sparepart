export const useRole = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const tokenCookie = useCookie("access_token");

  /**
   * Get auth headers for API requests
   */
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenCookie.value}`,
    };
  };

  /**
   * Get all roles with their permissions
   */
  const getRoles = async () => {
    try {
      const response = await fetch(`${apiUrl}/roles`, {
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
      console.error("Failed to fetch roles:", error);
      throw error;
    }
  };

  /**
   * Get a specific role with its permissions
   */
  const getRole = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/roles/${id}`, {
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
      console.error(`Failed to fetch role ${id}:`, error);
      throw error;
    }
  };

  /**
   * Get all available permissions in the system
   */
  const getPermissions = async () => {
    try {
      const response = await fetch(`${apiUrl}/roles/permissions`, {
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
      console.error("Failed to fetch permissions:", error);
      throw error;
    }
  };

  return {
    getRoles,
    getRole,
    getPermissions,
  };
};