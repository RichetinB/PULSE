import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { HealthController } from '../src/health/health.controller'
import { HealthService } from '../src/health/health.service'

describe('Health endpoint', () => {
  let app: INestApplication
  const dataSource = {
    query: jest.fn(),
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  beforeEach(() => {
    dataSource.query.mockReset()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns HTTP 200 and database status at GET /api/health', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }])

    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'connected' })
  })

  it('returns HTTP 503 when PostgreSQL is unavailable', async () => {
    dataSource.query.mockRejectedValue(new Error('connection failed'))

    await request(app.getHttpServer())
      .get('/api/health')
      .expect(503)
      .expect({ status: 'error', database: 'unavailable' })
  })
})
