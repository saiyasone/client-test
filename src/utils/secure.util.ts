import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";

export function encryptId(
  id: string | CryptoJS.lib.WordArray,
  secretKey: string | CryptoJS.lib.WordArray,
) {
  const encryptedID = CryptoJS.AES.encrypt(id, secretKey).toString();
  return encodeURIComponent(encryptedID);
}

export const decryptId = (encryptedParam: any, secretKey?: string) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedParam),
      secretKey || ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
    ).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    return null;
  }
};

export const encryptData = (model: any) => {
  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(model), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const ivText = iv.toString(CryptoJS.enc.Base64);
  const encryptedData = cipherText + ":" + ivText;
  return encryptedData;
};

export const encryptDataLink = (data: any) => {
  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  let cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  let ivText = iv.toString(CryptoJS.enc.Base64);

  cipherText = cipherText
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  ivText = ivText.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const encryptedData = cipherText + ":" + ivText;

  return encryptedData;
};

export const decryptDataLink = (data: any) => {
  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;

  const [cipherText, ivText] = data.split(":");
  const cipherTextBase64 = cipherText.replace(/-/g, "+").replace(/_/g, "/");
  const ivBase64 = ivText.replace(/-/g, "+").replace(/_/g, "/");

  const padding = 4 - (cipherTextBase64.length % 4);
  const paddedCipherText = cipherTextBase64 + "=".repeat(padding);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(paddedCipherText || ""),
    } as CryptoJS.lib.CipherParams,
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

export const decryptToken = (encryptData: any, secretKey: string) => {
  try {
    //for dev
    const decodedToken: any = jwtDecode(encryptData);
    const data = decodedToken?.encryptedData;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const parts = data.split(":");
    const ciphertext1 = CryptoJS.enc.Base64.parse(parts[0]);
    const parsedIv = CryptoJS.enc.Base64.parse(parts[1]);
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext1,
      }),
      key,
      {
        iv: parsedIv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );
    const decryptData = decrypted.toString(CryptoJS.enc.Utf8);
    const decryptedData = JSON.parse(decryptData);
    return decryptedData;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const decryptSettingKey = (encryptData: any, secretKey: string) => {
  try {
    if (encryptData && secretKey) {
      const key = CryptoJS.enc.Utf8.parse(secretKey);
      const parts = encryptData?.split(":");
      if (parts) {
        const ciphertext1 = CryptoJS.enc.Base64.parse(parts[0]);
        const parsedIv = CryptoJS.enc.Base64.parse(parts[1]);

        const decrypted = CryptoJS.AES.decrypt(
          CryptoJS.enc.Base64.stringify(ciphertext1),
          key,
          {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: parsedIv,
          },
        );
        const decryptData = decrypted.toString(CryptoJS.enc.Utf8);
        return decryptData;
      } else {
        return null;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const isValidToken = (accessToken: string) => {
  try {
    if (!accessToken) {
      return false;
    }
    const decoded = accessToken;
    const userPayload = decryptToken(
      decoded,
      ENV_KEYS.VITE_APP_TOKEN_SECRET_KEY,
    );
    const currentTime = Date.now() / 1000;
    return (userPayload || decoded).exp > currentTime;
  } catch (e) {
    return false;
  }
};

export const checkAccessToken = (accessToken: string) => {
  if (accessToken) {
    localStorage.setItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
};

export const generateUniqueId = (prefix = "") => {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 5);

  return `${prefix}${timestamp}${randomPart}`.toUpperCase();
};
