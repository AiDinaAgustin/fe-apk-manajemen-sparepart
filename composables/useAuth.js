export const useAuthApi = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const tokenCookie = useCookie("access_token");
  const userCookie = useCookie("user_data");
  const permissionsCookie = useCookie("user_permissions");
  const rolesCookie = useCookie("user_roles");

  const getBasicHeaders = () => {
    return {
      "Content-Type": "application/json",
    };
  };

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenCookie.value}`,
    };
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: getBasicHeaders(),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      tokenCookie.value = result.access_token;

      userCookie.value = result.user;
      permissionsCookie.value = result.user.all_permissions;
      rolesCookie.value = result.user.roles.map((role) => role.name);

      navigateTo("/dashboard");
      return result;
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      tokenCookie.value = null;
      userCookie.value = null;
      permissionsCookie.value = null;
      rolesCookie.value = null;

      navigateTo("/login");
      return await response.json();
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    if (!permissionsCookie.value) return false;
    return permissionsCookie.value.includes(permission);
  };

  const hasRole = (role) => {
    if (!rolesCookie.value) return false;
    return rolesCookie.value.includes(role);
  };

  const isAdmin = () => {
    return hasRole("admin");
  };

  const getUser = () => {
    return userCookie.value;
  };

  return {
    login,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    getUser,
  };
};
