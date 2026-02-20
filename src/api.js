import axios from 'axios';
import { getConfig } from './config.js';

function getClient() {
  const baseUrl = getConfig('baseUrl') || 'https://api.fraudlabspro.com';
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

export async function sendVerification(params = {}) {
  const client = getClient();
  const apiKey = getConfig('apiKey');

  if (!apiKey && !params.key) {
    throw new Error('API key is required. Set it with: fraudlabspro config set --api-key YOUR_KEY');
  }

  const requestParams = {
    key: params.key || apiKey,
    tel: params.tel,
    format: params.format || 'json'
  };

  if (params.country_code) {
    requestParams.country_code = params.country_code;
  }

  if (params.mesg) {
    requestParams.mesg = params.mesg;
  }

  const response = await client.post('/v1/verification/send', null, { params: requestParams });
  return response.data;
}

export async function verifyOtp(params = {}) {
  const client = getClient();
  const apiKey = getConfig('apiKey');

  if (!apiKey && !params.key) {
    throw new Error('API key is required. Set it with: fraudlabspro config set --api-key YOUR_KEY');
  }

  const requestParams = {
    key: params.key || apiKey,
    tran_id: params.tran_id,
    otp: params.otp,
    format: params.format || 'json'
  };

  const response = await client.get('/v1/verification/result', { params: requestParams });
  return response.data;
}
