import Axios from 'axios'

// Get API base URL from environment variable, with fallback for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3030'
const BASE_URL = `${API_BASE_URL}/api/`

var axios = Axios.create({
    withCredentials: true
})

export const httpService = {
    get(endpoint, data) {
        return ajax(endpoint, 'GET', data)
    },
    post(endpoint, data) {
        return ajax(endpoint, 'POST', data)
    },
    put(endpoint, data) {
        return ajax(endpoint, 'PUT', data)
    },
    delete(endpoint, data) {
        return ajax(endpoint, 'DELETE', data)
    }
}

async function ajax(endpoint, method = 'GET', data = null) {
    try {
        const res = await axios({
            url: `${BASE_URL}${endpoint}`,
            method,
            data,
            params: (method === 'GET') ? data : null
        })

        return res.data
    } catch (err) {
        console.log(`Had Issues ${method}ing to the backend, endpoint: ${endpoint}, with data: `, data)
        console.dir(err)
        if (err.response && err.response.status === 401) {
            sessionStorage.clear()
            window.location.assign('/login')
        }
        // Preserve error response data for proper error messages
        const error = new Error(err.response?.data?.err || err.message || 'Request failed')
        error.response = err.response
        throw error
    }
}