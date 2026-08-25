import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface DecryptedSecret {
  apiKey?: string;
  clientSecret?: string;
  serviceAccountKey?: string;
  accessToken?: string;
  customHeaders?: Record<string, string>;
}

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private readonly memoryStore = new Map<string, DecryptedSecret>();

  async storeSecret(secretData: DecryptedSecret): Promise<string> {
    const secretRef = `sec_${uuidv4()}`;
    this.memoryStore.set(secretRef, secretData);
    this.logger.log(`[SECRET_MANAGER] Secret reference created: ${secretRef}`);
    return secretRef;
  }

  async getSecret(secretRef: string): Promise<DecryptedSecret | null> {
    if (!secretRef) return null;
    const secret = this.memoryStore.get(secretRef as string);
    if (!secret) {
      this.logger.warn(
        `[SECRET_MANAGER] Reference not found in vault: ${secretRef}`,
      );
      return null;
    }
    return secret;
  }

  async rotateSecret(
    secretRef: string,
    newSecretData: DecryptedSecret,
  ): Promise<void> {
    if (this.memoryStore.has(secretRef)) {
      this.memoryStore.set(secretRef, newSecretData);
      this.logger.log(
        `[SECRET_MANAGER] Secret reference rotated: ${secretRef}`,
      );
    } else {
      await this.storeSecret(newSecretData);
    }
  }

  async deleteSecret(secretRef: string): Promise<void> {
    this.memoryStore.delete(secretRef);
    this.logger.log(`[SECRET_MANAGER] Secret reference deleted: ${secretRef}`);
  }
}
