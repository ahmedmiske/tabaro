async function fetchWithInterceptors(url, options) {
    console.log('Request URL:', url);
    console.log('Request Options:', options);

    const response = await fetch(url, options);
    
console.log('Response Status:', response.status);
console.log('Response Headers:', response.headers);
const responseBody = await response.json();
console.log('Response Body:', responseBody);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

export default fetchWithInterceptors;
