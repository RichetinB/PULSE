import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../database/prisma.service'
import { HealthService } from './health.service'

describe('HealthService', () => {
  let moduleRef: TestingModule
  let prisma: { $queryRaw: jest.Mock }
  let service: HealthService

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() }
    moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = moduleRef.get(HealthService)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  it('reports the API and database as healthy after a successful query', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    })
    expect(prisma.$queryRaw).toHaveBeenCalled()
  })

  it('reports database unavailability when the health query fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection failed'))

    await expect(service.check()).rejects.toMatchObject({
      status: 503,
      response: { status: 'error', database: 'unavailable' },
    })
  })
})
