import { EmbedBuilder } from '@discordjs/builders';
import { ActionContext } from './menu-helper';
import { DiscordSimpleError } from '../exceptions';

export class MessageCollectorHelper {
  constructor(private readonly context: ActionContext) {}

  async prompt(promptContent: string): Promise<string | null> {
    // Send the initial prompt message
    const prompt = await this.context.interaction.editReply({
      content: promptContent,
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: 'Escreva CANCELAR para cancelar' })
          .setTitle('Você tem 10 minutos para responder!'),
      ],
    });

    // Await the user's response
    const collected = await this.context.interaction.channel.awaitMessages({
      filter: (m) => m.author.id === this.context.interaction.user.id,
      max: 1,
      time: 1000 * 60 * 10,
    });

    const message = collected.first();

    await message.delete();
    // await prompt.delete();
    if (!message) {
      throw new DiscordSimpleError('Você não enviou sua ação a tempo!');
    }

    return message.content;
  }
}
