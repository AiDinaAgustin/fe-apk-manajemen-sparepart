export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie("access_token");
  const { hasPermission, hasRole } = useAuthApi();

  const protectedRoutes = [
    { path: "/dashboard", permission: null },
    { path: "/dashboard/users", permission: "user.read" },
    {
      path: "/dashboard/spareparts",
      permission: ["sparepart.read", "sparepart.read_list"],
    },
    {
      path: "/dashboard/transactions",
      permission: ["transaction.read_all", "transaction.read_own"],
    },
    { path: "/dashboard/reports", permission: "report.read" },
  ];

  if (authToken.value && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/dashboard");
  }

  const protectedRoute = protectedRoutes.find(
    (route) => to.path === route.path || to.path.startsWith(route.path + "/"),
  );

  if (protectedRoute) {
    if (!authToken.value) {
      return navigateTo("/login");
    }

    if (protectedRoute.permission) {
      const hasAccess = Array.isArray(protectedRoute.permission)
        ? protectedRoute.permission.some((perm) => hasPermission(perm))
        : hasPermission(protectedRoute.permission);

      if (!hasAccess && !hasRole("admin")) {
        return navigateTo("/dashboard");
      }
    }
  }
});
