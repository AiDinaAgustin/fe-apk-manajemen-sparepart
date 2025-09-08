/**
 * Returns a time-appropriate greeting in Indonesian
 * @returns {string} Greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

/**
 * Formats current date in Indonesian locale
 * @returns {string} Formatted date string
 */
export const formatCurrentDate = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
};

/**
 * Gets the current year
 * @returns {number} Current year
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};
