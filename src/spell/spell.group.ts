import { Injectable } from '@nestjs/common';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { ArgGuild } from '~/discord/decorators/message.decorators';
import { SpellService } from './spell.service';

@Injectable()
@Group({
  name: 'spell',
  description: 'Comandos relacionados a feitiços',
})
export class SpellGroup {
  constructor(private readonly service: SpellService) {}

  @Command({
    name: 'add',
    description: 'Adiciona um feitiço',
    mod: true,
  })
  addSpell() {}

  @Command({
    name: 'set',
    description: 'Atualiza um feitiço',
    mod: true,
  })
  setSpell() {}

  @Command({
    name: 'del',
    description: 'Deleta um feitiço',
  })
  getSpell(@ArgGuild() guild: Guild) {}

  listSpells() {}
}
