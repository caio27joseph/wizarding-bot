import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { AttributeService } from './attribute.service';
import { Repository } from 'typeorm';
import { Attributes } from './entities/attributes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';

@Group({
  name: 'atb',
  description: 'Comandos relacionados a configuracao de atributos',
})
@Injectable()
export class AttributeGroup {
  constructor(private readonly service: AttributeService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os atributos do personagem',
  })
  async showAttributes(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const attributes = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!attributes)
      throw new DiscordSimpleError(
        "Você não possui atributos, use o comando 'atb atualizar' para criar seus atributos.",
      );

    await interaction.reply({
      embeds: [attributes.toEmbed()],
      ephemeral: true,
    });
    return;
  }

  @Command({
    name: 'atualizar',
    description: 'Atualiza os atributos do personagem',
  })
  async updateAttributes(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: 'Força',
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    strength?: number,
    @ArgInteger({
      name: 'Vigor',
      description: 'Vigor do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    vim?: number,
    @ArgInteger({
      name: 'Destreza',
      description: 'Destreza do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    dexterity?: number,
    @ArgInteger({
      name: 'Carisma',
      description: 'Carisma do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    charisma?: number,
    @ArgInteger({
      name: 'Manipulacao',
      description: 'Manipulacao do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    manipulation?: number,
    @ArgInteger({
      name: 'Autocontrole',
      description: 'Autocontrole do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    selfcontrol?: number,
    @ArgInteger({
      name: 'Inteligência',
      description: 'Inteligência do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    intelligence?: number,
    @ArgInteger({
      name: 'Determinação',
      description: 'Determinação do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    determination?: number,
    @ArgInteger({
      name: 'Raciocínio',
      description: 'Raciocínio do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    rationality?: number,
  ) {
    const attributes = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        strength,
        vim,
        dexterity,
        charisma,
        manipulation,
        selfcontrol,
        intelligence,
        determination,
        rationality,
      },
    );
    await interaction.reply({
      embeds: [attributes.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
