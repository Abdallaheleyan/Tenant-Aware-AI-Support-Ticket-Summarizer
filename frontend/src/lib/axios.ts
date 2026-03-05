import Axios from 'axios';

let csrfTokenFetched = false;

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true, // Crucial for Sanctum cookie-based authentication
    withXSRFToken: true,   // Automatically attach the XSRF token to requests
});

// A helper function to fetch the CSRF cookie from Laravel before making requests
export const fetchCsrfToken = async () => {
    if (!csrfTokenFetched) {
        await axios.get('/sanctum/csrf-cookie');
        csrfTokenFetched = true;
    }
};

export default axios;
