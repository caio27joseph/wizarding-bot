import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './core.entity';
import { Repository } from 'typeorm';
import { Group } from '~/discord/decorators/group.decorator';

@Group({
  name: 'pj',
  description: 'Comandos relacionado ao proprio personagem',
})
@Injectable()
export class PlayerGroup {
  constructor(@InjectRepository(Player) private repo: Repository<Player>) {}

  update() {}
}
