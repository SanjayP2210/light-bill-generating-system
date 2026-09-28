export function formatDate(dateString, type) {
    const date = new Date(dateString);

    // Define options for formatting
    const options = type === 'date' ? {
        year: "numeric", // 2024
        month: "short", // Aug
        day: "2-digit", // 01
    } : {
        year: "numeric", // 2024
        month: "short", // Aug
        day: "2-digit", // 01
        hour: "2-digit", // 04
        minute: "2-digit", // 48
        hour12: true, // Use 12-hour time
    };

    // Format date
    return date.toLocaleString("en-US", options).replace(",", "");
}

// Effect to initialize maxDate to today's date
export const formatDateForInput = (billDate) => {
    // Get today's date in YYYY-MM-DD format
    const today = billDate ? new Date(billDate) : new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
};

export const formatDateForTable = (billDate) => {
    const today = billDate ? new Date(billDate) : new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

export const getMaxDate= () => formatDateForInput();
