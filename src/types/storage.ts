// Contratos do serviço de storage (DIP — permite trocar o provedor no futuro).

export type StorageUploadInput = {
  key: string;
  body: Buffer;
  contentType: string;
  originalName: string;
};

export type StorageUploadResult = {
  key: string;
  url: string;
  size: number;
  contentType: string;
};

export interface ObjectStorageService {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  removeByUrl(url: string): Promise<void>;
}
