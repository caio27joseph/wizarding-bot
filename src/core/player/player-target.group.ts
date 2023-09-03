import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { PlayerService } from './player.service';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
@Group({
  name: 'player',
  description: 'Comandos relacionado ao proprio personagem',
})
@Injectable()
export class PlayerTargetGroup {
  constructor(private readonly service: PlayerService) {}

  @Command({
    name: 'ver',
    description: 'Mostra as informacoes do personagem',
    mod: true,
  })
  async findPlayer(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer({
      name: 'jogador',
      description: 'Jogador para ver as informacoes',
    })
    _,
  ) {
    const player = await this.service.findOne({
      where: {
        id: _.id,
      },
      relations: {
        attributes: true,
        abilities: true,
        witchPredilections: true,
        nonConvPredilections: true,
        extras: true,
      },
    });
    const embeds: EmbedBuilder[] = [player.toEmbed()];
    embeds.push(
      player.attributes
        ? player.attributes.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Atributos não configurados`)
            .setDescription('Para configurar use /atb atualizar'),
    );
    embeds.push(
      player.abilities
        ? player.abilities.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Habilidades não configuradas`)
            .setDescription(
              'Para configurar use /[pericias|talentos|conhecimentos] atualizar',
            ),
    );
    embeds.push(
      player.witchPredilections
        ? player.witchPredilections.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Predileções Bruxas não configuradas`)
            .setDescription('Para configurar use /pred_bruxa atualizar'),
    );
    embeds.push(
      player.nonConvPredilections
        ? player.nonConvPredilections.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Predileções não convencionais não configuradas`)
            .setDescription('Para configurar use /pred_nc atualizar'),
    );
    embeds.push(
      player.extras
        ? player.extras.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Informações extras não configuradas`)
            .setDescription('Para configurar use /extras atualizar'),
    );
    await interaction.reply({
      embeds,
      ephemeral: true,
    });
  }
}
