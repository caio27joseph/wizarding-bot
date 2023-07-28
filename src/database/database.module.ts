import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/wizards.sqlite',
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
