import Axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.BASE_API_URL;

function generateHeaders(contentType = 'application/json') {
  const headers = {
    'Content-Type': contentType,
  };

  const token = Cookies.get('75F_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return { headers };
}

async function makeRequest(method, url, params, contentType = 'application/json') {
  try {
    const headers = generateHeaders(contentType);

    if (method === 'GET') {
      const response = await Axios.get(`${API_BASE_URL}${url}`, { ...headers, params });
      return handleResponse(response.data);
    } else {
      const response = await Axios.post(`${API_BASE_URL}${url}`, params, headers);
      return handleResponse(response.data);
    }
  } catch (error) {
    return errorResponse({ message: error.response.data.message });
  }
}

async function fetcher(method, url, params) {
  return makeRequest(method, url, params);
}

async function filesFetch(method, url, params) {
  const formData = new FormData();
  Object.keys(params).forEach((key) => formData.append(key, params[key]));

  return makeRequest(method, url, formData, 'multipart/form-data');
}

async function uploadMultipleFiles(files, url) {
  try {
    const formData = new FormData();
    const fileArray = [];

    for (let i = 0;i < files.length;i++) {
      formData.append('buffer', files[i]);
      fileArray.push(files[i]);
    }

    const getHeaders = () => {
      return {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${Cookies.get('75F_token')}`,
      };
    }

    const header = getHeaders();
    const response = await Axios.post(`${API_BASE_URL}${url}`, formData, { headers: header });
    return { response, fileArray };
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}

function handleResponse(response) {
  if (response.status === 1) {
    return successResponse(response);
  } else {
    return errorResponse(response);
  }
}

function successResponse(response) {
  const { result, message } = response;
  return {
    status: true,
    data: result,
    message,
  };
}

function errorResponse(response) {
  return {
    status: false,
    data: null,
    message: response?.message || 'An error occurred.',
  };
}

export { fetcher, filesFetch, uploadMultipleFiles };
