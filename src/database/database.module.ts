import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnModule } from '~/evolution/learn/learn.module';
import { CleanerService } from './cleaner.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: ['dist/**/*.entity.js'],
      subscribers: ['dist/**/*.subscriber.js'],
      synchronize: true,
    }),
    LearnModule,
  ],
  providers: [CleanerService],
})
export class DatabaseModule {}
