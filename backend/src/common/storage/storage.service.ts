import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';

export interface StorageUploadOptions {
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface IStorageService {
  upload(
    key: string,
    buffer: Buffer,
    options?: StorageUploadOptions,
  ): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: AppConfigService) {}

  async upload(
    key: string,
    buffer: Buffer,
    _options?: StorageUploadOptions,
  ): Promise<string> {
    this.logger.debug(
      `[STORAGE] Storing asset key: ${key} (${buffer.length} bytes, driver: ${this.configService.storage.driver})`,
    );
    // Abstraction placeholder for S3 / local driver
    return `/api/v1/assets/${encodeURIComponent(key)}`;
  }

  async download(key: string): Promise<Buffer> {
    this.logger.debug(`[STORAGE] Downloading asset key: ${key}`);
    return Buffer.from([]);
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`[STORAGE] Deleting asset key: ${key}`);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    this.logger.debug(
      `[STORAGE] Generating signed URL for key: ${key} (ttl: ${expiresInSeconds}s)`,
    );
    return `${this.configService.app.url}/api/v1/assets/signed?key=${encodeURIComponent(key)}&exp=${expiresInSeconds}`;
  }
}
