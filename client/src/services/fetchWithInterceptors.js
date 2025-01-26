const fetchWithInterceptors = async (url, options = {}) => {
    const defaultHeaders = {
        "Content-Type": "application/json",
    };
    // Add default headers (e.g., Authorization)
    const token = localStorage.getItem("token"); // Or sessionStorage
    if (token) {

        defaultHeaders["Authorization"] = `Bearer ${token}`;

    }
    
    // Merge default headers with user-provided headers
    const headers = { ...defaultHeaders, ...options.headers };

    try {
        // Perform the fetch
        const response = await fetch(url, { ...options, headers });

        const body = await response.json();

        // Handle common status codes (e.g., 401 Unauthorized)
        if (response.status === 401) {
            console.error("Unauthorized! Token might be invalid or expired.");
            // Optionally trigger a logout or token refresh flow here
        }

        // save token
        if(
            url.includes('/verify-otp') || 
            url.includes('/login') || 

            ( options.method === 'POST' && url.includes('/users'))
        ){ 
            // sould check if stay logged in is checked

            localStorage.setItem("token", body.token);
        }

        // Check for non-OK responses
        if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        return {headers: response.headers, status: response.status, body, ok: response.ok};
    } catch (error) {

        console.error("Fetch error:", error);

        throw error; // Propagate error to caller
    }
};

export default fetchWithInterceptors;
