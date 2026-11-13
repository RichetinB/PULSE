import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

export type HealthResponse = {
  status: 'ok'
  database: 'connected'
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', database: 'connected' }
    } catch {
      this.logger.warn('Database health check failed')
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unavailable',
      })
    }
  }
}
