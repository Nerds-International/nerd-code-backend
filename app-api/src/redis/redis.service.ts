import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SessionDto } from 'src/auth/dto/session.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private readonly logger: Logger = new Logger('RedisService');

  async updateSession(uuid: string, token: string) {
    const status = await this.cacheManager.set(uuid, token);
    // if (status) {
    //   this.logger.log(`Session for user ${uuid} updated successfully`);
    // } else {
    //   this.logger.error(`Error when updating session for ${uuid}`);
    // }
  }

  async cleanSession(uuid: string) {
    const count = await this.cacheManager.del(uuid);
    // if (count === 0) {
    //   this.logger.log(`Nothing deleted from cache for user ${uuid}`);
    // } else {
    //   this.logger.log(`Session for user ${uuid} was deleted successfully`);
    // }
  }

  async getSession(uuid: string): Promise<SessionDto> {
    this.cacheManager.store.keys()
    return await this.cacheManager.get(uuid);
  }


  async getKeys(): Promise<string[]> {
    return await this.cacheManager.store.keys();
  }
}
