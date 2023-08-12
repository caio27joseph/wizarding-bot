import { APIEmbedField, EmbedBuilder } from 'discord.js';

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class RollsD10 {
  private static numberToEmojiMap = {
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
    6: ':six:',
    7: ':seven:',
    8: ':eight:',
    9: ':nine:',
    10: ':keycap_ten:',
  };
  private static criticFailEmoji = '<:keycap_one_red:1139678841435074651>';
  private static criticSuccessEmoji =
    '<:keycap_ten_golden:1139683620429234226>';
  private static numberToFailEmojiMap = {
    1: '<:keycap_one_gray:1139683452317339788>',
    2: '<:keycap_two_gray:1139683461628690483>',
    3: '<:keycap_three_gray:1139683471485308960>',
    4: '<:keycap_four_gray:1139683484240199710>',
    5: '<:keycap_five_gray:1139683495447371829>',
    6: '<:keycap_six_gray:1139683507682160802>',
    7: '<:keycap_seven_gray:1139683518440558612>',
    8: '<:keycap_eight_gray:1139683529479958679>',
    9: '<:keycap_nine_gray:1139683541903487107>',
  };

  private rolls = [];
  private critical_f: boolean;
  private critical_s: number;
  public success: number;
  public expression;
  public total: number;
  constructor(
    private readonly values: number[],
    public diff = 6,
    public autoSuccess = 0,
    public readonly message = '',
  ) {
    this.expression = '';
    let total = values.reduce((a, b) => a + b, 0);
    if (total > 50) total = 50;
    this.expression += `${values.join(' + ')} = ${total}d10${
      autoSuccess ? `, Auto: ${autoSuccess}` : ''
    }, Diff: ${diff}`;
    this.success = 0;
    this.doRolls(total, diff);
  }

  private doRolls(amount: number, diff: number) {
    if (amount < 1) return;
    const rolls = [];
    let rolls10 = 0;
    let rolls1 = 0;

    for (let i = 0; i < amount; i++) {
      const value = randomIntFromInterval(1, 10);
      if (value >= diff) this.success++;
      if (value === 10) rolls10++;
      if (value === 1) rolls1++;
      rolls.push(value);
    }
    this.critical_s = Math.floor(rolls10 / 2);
    this.critical_f = rolls1 >= 1 && this.success === 0;

    // this.rolls = rolls.sort((a, b) => b - a);
    this.rolls = rolls;
    this.calculate();
  }

  private get rollsToEmojiString(): string {
    let emojiStr = '';

    for (let index = 0; index < this.autoSuccess; index++) {
      emojiStr += ':dart: ';
    }

    const totalTens = this.rolls.filter((value) => value === 10).length;
    let goldenTensLeft = Math.floor(totalTens / 2) * 2; // Multiply by 2 since we're using golden tens for pairs

    for (let rollValue of this.rolls) {
      if (rollValue === 10) {
        if (goldenTensLeft > 0) {
          emojiStr += RollsD10.criticSuccessEmoji + ' ';
          goldenTensLeft--;
        } else {
          emojiStr += RollsD10.numberToEmojiMap[10] + ' ';
        }
      } else if (rollValue === 1 && this.critical_f) {
        emojiStr += RollsD10.criticFailEmoji + ' ';
      } else if (rollValue >= this.diff) {
        emojiStr += RollsD10.numberToEmojiMap[rollValue] + ' ';
      } else {
        emojiStr +=
          RollsD10.numberToFailEmojiMap[rollValue] || `:grey_question:`;
        emojiStr += ' ';
      }
    }

    return emojiStr.trim();
  }
  calculate() {
    this.total = this.success + this.autoSuccess + this.critical_s * 2;
  }

  toEmbed() {
    const embed = new EmbedBuilder();
    const fields: APIEmbedField[] = [];

    fields.push({
      name: 'Sucessos',
      value: this.success.toString(),
      inline: true,
    });

    if (this.critical_f) {
      embed
        .setTitle(
          `Falha Crítica${this.message.length > 0 ? ' - ' + this.message : ''}`,
        )
        .setColor('#FF0000'); // Red
    } else if (this.critical_s) {
      embed
        .setTitle(
          `Sucesso Crítico x${this.critical_s}${
            this.message.length > 0 ? ' - ' + this.message : ''
          }`,
        )
        .setColor('#FFD700'); // Gold
      fields.push({
        name: 'Bônus de Criticos',
        value: (this.critical_s * 2).toString(),
        inline: true,
      });
    } else if (this.success > 0 || this.autoSuccess > 0) {
      embed
        .setTitle(
          `Sucesso${this.message.length > 0 ? ' - ' + this.message : ''}`,
        )
        .setColor('#00FF00'); // Green
    } else {
      embed
        .setTitle(`Falha${this.message.length > 0 ? ' - ' + this.message : ''}`)
        .setColor('#8B0000'); // Dark Red
    }
    if (this.autoSuccess > 0) {
      fields.push({
        name: 'Sucessos Automáticos',
        value: this.autoSuccess.toString(),
        inline: true,
      });
    }

    fields.push({
      name: 'Total',
      value: this.total.toString(),
      inline: true,
    });

    embed.setDescription(this.rollsToEmojiString);
    embed.addFields(fields);
    embed.setFooter({
      text: this.expression,
    });

    return embed;
  }
}
