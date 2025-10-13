/**
 * Formats a string of numbers into a credit card-like format (e.g., "1234 5678 1234 5678").
 * @param {string} cardNumber - The card number string to format.
 * @returns {string} The formatted card number.
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return '';
  }
  // Remove all non-digit characters and then group by 4
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/(\d{1,4})/g);
  return groups ? groups.join(' ') : '';
};

/**
 * Formats a string of numbers into a phone number format (e.g., "667 100 0101").
 * @param {string} phoneNumber - The phone number string to format.
 * @returns {string} The formatted phone number.
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not 10 digits
  }
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

/**
 * Prevents non-letter characters from being entered into an input field.
 * Allows spaces and control keys.
 * @param {React.KeyboardEvent} e - The keyboard event.
 */
export const allowOnlyLetters = (e) => {
  const key = e.key;
  if (e.ctrlKey || e.altKey || e.metaKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(key)) {
    return;
  }
  if (!/^[a-zA-Z]$/.test(key)) {
    e.preventDefault();
  }
};

/**
 * Prevents non-numeric characters from being entered into an input field.
 * Allows control keys.
 * @param {React.KeyboardEvent} e - The keyboard event.
 */
export const allowOnlyNumbers = (e) => {
  const key = e.key;
  if (e.ctrlKey || e.altKey || e.metaKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
    return;
  }
  if (!/^[0-9]$/.test(key)) {
    e.preventDefault();
  }
};

/**
 * Converts a string to Camel Case.
 * @param {string} str - The string to convert.
 * @returns {string} The Camel Cased string.
 */
export const toCamelCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
