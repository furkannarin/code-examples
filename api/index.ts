import ENV from '../../env.json';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import stores from '@/stores';

type Packet = unknown[] | string | number | boolean | Record<string, unknown> | FormData;

type Response<T> = {
  statusCode: string | null
  data: T | null
}

type AvailableEnvs = 'PROD' | 'DEV' | 'TEST'
const Environment: AvailableEnvs = ENV.IS_TEST_ENV ? 'TEST' : ENV.IS_DEV_ENV ? 'DEV' : 'PROD';

const DEFAULT_TIMEOUT = 10000;

let TOKEN: string | null = null;
export const setToken = (val: string | null) => {
  TOKEN = val;
};

const config: AxiosRequestConfig = {
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': null
  }
};

const connectionResponse = { data: null, statusCode: 'ERR_NETWORK' };
const checkConnection = () => {
  const { Connection: { isConnected, setShowConnectionError } } = stores;
  if (!isConnected) {
    setShowConnectionError(true);
    return false;
  }
  return true;
};

async function POST<T>(url: string, data: Packet | FormData, isFormData?: boolean): Promise<Response<T>> {
  if (!checkConnection()) return connectionResponse;

  try {
    const controller = new AbortController();
    config.signal = controller.signal;

    if (TOKEN && !config.headers!.Authorization) {
      config.headers!.Authorization = `Bearer ${TOKEN}`;
    }

    if (isFormData) config.headers!['Content-Type'] = 'multipart/form-data';
    else config.headers!['Content-Type'] = 'application/json';

    const response = await axios.post(ENV[Environment] + url, data, config);

    if (url === '/authentication/logout') {
      config.headers!.Authorization = null;
    }

    return {
      data: response.data as T,
      statusCode: '200'
    };
  }
  catch (error) {
    const CastErrType = error as AxiosError;
    console.warn(`Error during POST request to "${url}".`);
    return {
      data: null,
      statusCode: CastErrType.code || null
    };
  }
}

async function PATCH<T>(url: string, data: Packet, isFormData?: boolean): Promise<Response<T>> {
  if (!checkConnection()) return connectionResponse;

  try {
    const controller = new AbortController();
    config.signal = controller.signal;

    if (TOKEN && !config.headers!.Authorization) {
      config.headers!.Authorization = `Bearer ${TOKEN}`;
    }

    if (isFormData) config.headers!['Content-Type'] = 'multipart/form-data';
    else config.headers!['Content-Type'] = 'application/json';

    const response = await axios.patch(ENV[Environment] + url, data, config);

    return {
      data: response.data as T,
      statusCode: '200'
    };
  }
  catch (error) {
    const CastErrType = error as AxiosError;
    console.warn(`Error during PATCH request to "${url}".`);
    return {
      data: null,
      statusCode: CastErrType.code || null
    };
  }
}

async function GET<T>(url: string, params?: Record<string, unknown>): Promise<Response<T>> {
  if (!checkConnection()) return connectionResponse;

  try {
    const controller = new AbortController();
    config.signal = controller.signal;
    config.params = params;

    if (TOKEN && !config.headers!.Authorization) {
      config.headers!.Authorization = `Bearer ${TOKEN}`;
    }

    const response = await axios.get(ENV[Environment] + url, config);
    return {
      data: response.data as T,
      statusCode: '200'
    };
  }
  catch (error) {
    const CastErrType = error as AxiosError;
    console.warn(`Error during GET request to "${url}".`);
    return {
      data: null,
      statusCode: CastErrType.code || null
    };
  }
}

async function DELETE<T>(url: string): Promise<Response<T>> {
  if (!checkConnection()) return connectionResponse;

  try {
    const controller = new AbortController();
    config.signal = controller.signal;

    if (TOKEN && !config.headers!.Authorization) {
      config.headers!.Authorization = `Bearer ${TOKEN}`;
    }

    const response = await axios.delete(ENV[Environment] + url, config);
    return {
      data: response.data as T,
      statusCode: '200'
    };
  }
  catch (error) {
    const CastErrType = error as AxiosError;
    console.warn(`Error during GET request to "${url}".`);
    return {
      data: null,
      statusCode: CastErrType.code || null
    };
  }
}

export default { GET, POST, PATCH, DELETE };

export { AuthService } from './services/Auth';
export { ClientService } from './services/Client';
export { SurveyService } from './services/Survey';
export { CategoryService } from './services/Category';
export { SocialAuthService } from './services/SocialAuth';
export { AppointmentService } from './services/Appointment';
export { PaymentService } from './services/Payment';
export { SoundClipService } from './services/SoundClip';
export { ProfileService } from './services/Profile';
export { MessageService } from './services/Message';
export { NotificationService } from './services/Notification';
