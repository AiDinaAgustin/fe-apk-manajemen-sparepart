export const useSpareparts = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const tokenCookie = useCookie("access_token");

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenCookie.value}`,
    };
  };

  const getSpareparts = async () => {
    try {
      const response = await fetch(`${apiUrl}/spareparts`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch spareparts:`, error);
      throw error;
    }
  };

  const getSparepartById = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/spareparts/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch sparepart ${id}:`, error);
      throw error;
    }
  };

  const createSparepart = async (sparepartData) => {
    try {
      const response = await fetch(`${apiUrl}/spareparts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(sparepartData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to create sparepart:`, error);
      throw error;
    }
  };

  const updateSparepart = async (id, sparepartData) => {
    try {
      const response = await fetch(`${apiUrl}/spareparts/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(sparepartData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update sparepart ${id}:`, error);
      throw error;
    }
  };

  const deleteSparepart = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/spareparts/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete sparepart ${id}:`, error);
      throw error;
    }
  };

  const getSparepartList = async () => {
    try {
      const response = await fetch(`${apiUrl}/spareparts/list/view`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch sparepart list:`, error);
      throw error;
    }
  };

  return {
    getSpareparts,
    getSparepartById,
    createSparepart,
    updateSparepart,
    deleteSparepart,
    getSparepartList,
  };
};
