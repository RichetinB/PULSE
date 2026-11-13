import { DataSource } from 'typeorm'
import { HealthService } from './health.service'

describe('HealthService', () => {
  let dataSource: DataSource
  let service: HealthService

  beforeEach(() => {
    dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      username: 'test',
      password: 'test',
      database: 'test',
    })
    service = new HealthService(dataSource)
  })

  it('reports the API and database as healthy after a successful query', async () => {
    const query = jest
      .spyOn(dataSource, 'query')
      .mockResolvedValue([{ '?column?': 1 }])

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    })
    expect(query).toHaveBeenCalledWith('SELECT 1')
  })

  it('reports database unavailability when the health query fails', async () => {
    jest.spyOn(dataSource, 'query').mockRejectedValue(new Error('connection failed'))

    await expect(service.check()).rejects.toMatchObject({
      status: 503,
      response: { status: 'error', database: 'unavailable' },
    })
  })
})
