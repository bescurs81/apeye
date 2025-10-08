const ENCRYPTION_KEY_STORAGE = 'encryption_master_key';

async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKey = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);

  if (storedKey) {
    const keyData = JSON.parse(storedKey);
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(exportedKey));

  return key;
}

export async function encrypt(text: string): Promise<string> {
  if (!text) return '';

  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  const encryptedArray = new Uint8Array(encryptedData);
  const resultArray = new Uint8Array(iv.length + encryptedArray.length);
  resultArray.set(iv, 0);
  resultArray.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...resultArray));
}

export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';

  try {
    const key = await getOrCreateKey();
    const encryptedArray = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    const iv = encryptedArray.slice(0, 12);
    const data = encryptedArray.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption Error]';
  }
}

export function clearEncryptionKey(): void {
  sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

export function hasEncryptionKey(): boolean {
  return sessionStorage.getItem(ENCRYPTION_KEY_STORAGE) !== null;
}
