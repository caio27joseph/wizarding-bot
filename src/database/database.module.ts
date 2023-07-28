import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || 'data/database.db',
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
