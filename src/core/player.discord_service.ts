import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './core.entity';
import { Repository } from 'typeorm';
import { Group } from '~/discord/decorators/group.decorator';

@Group({
  name: 'pj',
  description: 'Comandos relacionado ao jogador',
})
@Injectable()
export class PlayerDiscordService {
  constructor(@InjectRepository(Player) private repo: Repository<Player>) {}

  // @Command({
  //   name: "player",
  //   placeholder: "Criando Usuario"
  // })
  // public async test(
  //   @Message() message: DiscordMessage,
  //   @Author() author: DiscordUser,
  //   @Guild() guild: DiscordGuild
  // ) {
  //   let player = await this.repo.findOneBy({
  //     discordId: author.id,
  //   })
  //   if (!player) {
  //     const data = this.repo.create({
  //       name: author.username,
  //       description: "",
  //       discordId: author.id,
  //     });
  //     player = await this.repo.save(data);
  //   }
  //   return await message.channel.send(`${author} para o user ${player?.id}`)
  // }
}
