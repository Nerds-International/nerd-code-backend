import { SessionDto } from 'src/auth-service/auth/dto/session.dto';
import { Cache } from 'cache-manager';
export declare class RedisService {
    private readonly cacheManager;
    constructor(cacheManager: Cache);
    private readonly logger;
    updateSession(uuid: string, token: string): Promise<void>;
    cleanSession(uuid: string): Promise<void>;
    getSession(uuid: string): Promise<SessionDto>;
}
