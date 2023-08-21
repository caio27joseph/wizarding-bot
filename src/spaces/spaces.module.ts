import { Module } from '@nestjs/common';
import { SpaceModule } from './space/space.module';

@Module({
  imports: [SpaceModule],
})
export class SpacesModule {}
