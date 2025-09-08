export const useTransactions = () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const tokenCookie = useCookie("access_token");

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenCookie.value}`,
    };
  };

  const getTransactions = async () => {
    try {
      const response = await fetch(`${apiUrl}/transactions`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch transactions:`, error);
      throw error;
    }
  };

  const getTransactionById = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/transactions/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      throw error;
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const response = await fetch(`${apiUrl}/transactions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to create transaction:`, error);
      throw error;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await fetch(`${apiUrl}/transactions/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update transaction ${id}:`, error);
      throw error;
    }
  };

  const approveTransaction = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/transactions/${id}/approve`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to approve transaction ${id}:`, error);
      throw error;
    }
  };

  const rejectTransaction = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/transactions/${id}/reject`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to reject transaction ${id}:`, error);
      throw error;
    }
  };

  return {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    approveTransaction,
    rejectTransaction,
  };
};
