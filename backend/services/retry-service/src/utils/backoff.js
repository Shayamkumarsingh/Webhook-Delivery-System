export const getBackoffTime = (attempt) => {
    const delays = [
        10 * 1000, 
        20 * 1000, 
        25 * 1000  
    ];

    return delays[attempt - 1] || null;
};