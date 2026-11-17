import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'
import { parseCorsOrigins } from './config/cors-origins'
import { AuthModule } from './auth/auth.module'
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
          OSU_CLIENT_ID: Joi.string().required(),
          OSU_CLIENT_SECRET: Joi.string().required(),
          OSU_REDIRECT_URI: Joi.string().uri().required(),
          FRONTEND_URL: Joi.string().uri().required(),
          NODE_ENV: Joi.string()
            .valid('development', 'test', 'production')
            .default('development'),
      }),
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
