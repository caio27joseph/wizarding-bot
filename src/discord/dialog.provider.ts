import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Message,
} from 'discord.js';

export class DiscordDialogProvider {
  private components = [];
  private dialogs = [];
  constructor(private message: Message) {}

  yesOrNo(question: string) {
    const confirm = new ButtonBuilder()
      .setCustomId('yes')
      .setLabel('Sim')
      .setStyle(ButtonStyle.Success);

    const cancel = new ButtonBuilder()
      .setCustomId('no')
      .setLabel('Nao')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(cancel, confirm);
    this.components.push(row);

    const filter = (interaction: ButtonInteraction) => {
      return (
        interaction.customId === 'yes' ||
        (interaction.customId === 'no' &&
          interaction.user.id === this.message.author.id)
      );
    };
    this.dialogs.push(async () => {
      this.message.channel.send({
        content: question,
        components: [row as any],
      });

      const confirmation = await this.message.channel.awaitMessageComponent({
        filter: filter as any,
        time: 15000,
      });

      if (confirmation.customId === 'yes') {
        this.message.channel.send('Clicked Yes');
        confirmation.deferReply();
      } else if (confirmation.customId === 'no') {
        this.message.channel.send('Clicked No');
        confirmation.deleteReply();
      }
      return;
    });
    return this;
  }
  async start() {
    for (const dialog of this.dialogs) {
      await dialog();
    }
  }
}
