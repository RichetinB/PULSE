import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../src/database/prisma.service'
import { HealthController } from '../src/health/health.controller'
import { HealthService } from '../src/health/health.service'

describe('Health endpoint', () => {
  let app: INestApplication
  const prisma = {
    $queryRaw: jest.fn(),
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  beforeEach(() => {
    prisma.$queryRaw.mockReset()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns HTTP 200 and database status at GET /api/health', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'connected' })
  })

  it('returns HTTP 503 when PostgreSQL is unavailable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection failed'))

    await request(app.getHttpServer())
      .get('/api/health')
      .expect(503)
      .expect({ status: 'error', database: 'unavailable' })
  })
})
