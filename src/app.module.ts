import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { HouseCupModule } from './house-cup/house-cup.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/generated/schema.gql'),
    }),
    ConfigModule.forRoot(),
    DiscordModule,
    CoreModule,
    DatabaseModule,
    HouseCupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
