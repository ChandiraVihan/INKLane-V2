import axios from 'axios';

// A separate axios instance for Cloudinary uploads without auth headers
const cloudinaryApi = axios.create({
  baseURL: 'https://api.cloudinary.com/v1_1',
});

export default cloudinaryApi;