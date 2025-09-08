export const useReport = () => {
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
   * Handle file download from blob response
   */
  const handleFileDownload = async (response, filename) => {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Export single transaction to PDF
   */
  const exportTransactionToPDF = async (transactionId) => {
    try {
      const response = await fetch(`${apiUrl}/reports/transaction/${transactionId}/pdf`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `transaction_${transactionId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      await handleFileDownload(response, filename);
      return true;
    } catch (error) {
      console.error(`Failed to export transaction ${transactionId} to PDF:`, error);
      throw error;
    }
  };

  /**
   * Export single transaction to Excel
   */
  const exportTransactionToExcel = async (transactionId) => {
    try {
      const response = await fetch(`${apiUrl}/reports/transaction/${transactionId}/excel`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `transaction_${transactionId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      await handleFileDownload(response, filename);
      return true;
    } catch (error) {
      console.error(`Failed to export transaction ${transactionId} to Excel:`, error);
      throw error;
    }
  };

  /**
   * Export all transactions to PDF with filters
   * @param {Object} filters - Optional filters like startDate, endDate, status
   */
  const exportAllTransactionsToPDF = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('start_date', filters.startDate);
      if (filters.endDate) queryParams.append('end_date', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${apiUrl}/reports/transactions/pdf?${queryString}` : `${apiUrl}/reports/transactions/pdf`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'transactions_report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      await handleFileDownload(response, filename);
      return true;
    } catch (error) {
      console.error("Failed to export transactions to PDF:", error);
      throw error;
    }
  };

  return {
    exportTransactionToPDF,
    exportTransactionToExcel,
    exportAllTransactionsToPDF,
  };
};