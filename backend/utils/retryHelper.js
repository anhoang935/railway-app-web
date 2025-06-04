// New utility file for retry logic
export const retryOperation = async (operation, maxRetries = 3, initialDelayMs = 300) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}`);
            return await operation();
        } catch (error) {
            console.log(`Operation failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
            lastError = error;

            if (attempt < maxRetries) {
                // Exponential backoff with jitter
                const delayMs = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100;
                console.log(`Retrying in ${delayMs.toFixed(0)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
};