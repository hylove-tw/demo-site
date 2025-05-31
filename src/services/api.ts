import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ANALYSIS_API_BASE || 'http://localhost:3000';

export async function post(path: string, payload: any) {
  const url = `${API_BASE_URL}${path}`;
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
}
