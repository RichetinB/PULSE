import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'
import { parseCorsOrigins } from './config/cors-origins'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .required(),
        PORT: Joi.number().port().default(3000),
        CORS_ORIGINS: Joi.string()
          .required()
          .custom((value: string, helpers) => {
            try {
              parseCorsOrigins(value)
              return value
            } catch {
              return helpers.error('any.invalid')
            }
          }),
      }),
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
