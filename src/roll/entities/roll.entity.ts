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
  private rolls = [];
  private critical_f: boolean;
  private critical_s: number;
  constructor(amount: number, public diff = 6, public success = 0) {
    this.doRolls(amount, diff);
  }

  private doRolls(amount: number, diff: number) {
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

    this.rolls = rolls.sort((a, b) => b - a);
  }
  private get rollsToEmojiString(): string {
    let emojiStr = '';
    let hasInsertedSuccessArrow = false;
    let hasInsertedFailArrow = false;
    const rollStr = this.rolls.join(''); // Convert rolls to string for easier pattern detection
    let easterEggs = ''; // Separate string for easter eggs
    let foundEasterEgg = false;
    if (rollStr.includes('777')) {
      easterEggs += ' :slot_machine:'; // Jackpot for 777
      foundEasterEgg = true;
    }
    if (
      rollStr.includes('8') &&
      this.rolls.filter((r) => r === 8).length === 1
    ) {
      easterEggs += ' :8ball:'; // Single 8 for magic 8 ball
      foundEasterEgg = true;
    }
    if (rollStr.includes('666')) {
      easterEggs += ' :smiling_imp:'; // 666 for devil
      foundEasterEgg = true;
    }
    if (rollStr.includes('101010')) {
      easterEggs += ' 👑'; // Triple crown for three 10s
      foundEasterEgg = true;
    }
    if (rollStr.includes('999')) {
      easterEggs += ' 🎆'; // Almost perfect for three 9s
      foundEasterEgg = true;
    }
    if (rollStr.includes('111')) {
      easterEggs += ' 🐢'; // Slow or lowest tier for three 1s
      foundEasterEgg = true;
    }
    if (rollStr.endsWith('22')) {
      easterEggs += ' 🦆'; // Duck for ending in 2
      foundEasterEgg = true;
    }

    for (let i = 0; i < this.rolls.length; i++) {
      if (this.rolls[i] >= this.diff && !hasInsertedSuccessArrow) {
        emojiStr += ' :chart_with_upwards_trend: '; // Add upwards trend to indicate start of successes
        hasInsertedSuccessArrow = true;
      }
      if (this.rolls[i] < this.diff && !hasInsertedFailArrow) {
        emojiStr += ' :chart_with_downwards_trend: '; // Add downwards trend to indicate start of failures
        hasInsertedFailArrow = true;
      }
      emojiStr += RollsD10.numberToEmojiMap[this.rolls[i]];
    }
    if (foundEasterEgg) emojiStr += `\n${easterEggs}`; // Add easter eggs if found

    return emojiStr; // Combine easter eggs and roll emojis
  }

  toEmbed() {
    const embed = new EmbedBuilder();
    const fields: APIEmbedField[] = [];
    let total = this.success;
    embed.setAuthor({
      name: 'Dificuldade: ' + this.diff.toString(),
    });

    fields.push({
      name: 'Sucessos',
      value: this.success.toString(),
      inline: true,
    });

    if (this.critical_f) {
      embed.setTitle('Falha Crítica').setColor('#FF0000'); // Red
    } else if (this.critical_s) {
      embed.setTitle(`Sucesso Crítico x${this.critical_s}`).setColor('#FFD700'); // Gold
      total += this.critical_s * 2;
      fields.push({
        name: 'Sucessos (De Criticos)',
        value: (this.critical_s * 2).toString(),
        inline: true,
      });
    } else if (this.success > 0) {
      embed.setTitle('Sucesso').setColor('#00FF00'); // Green
    } else {
      embed.setTitle('Falha').setColor('#8B0000'); // Dark Red
    }

    fields.push({
      name: 'Total',
      value: total.toString(),
      inline: true,
    });

    embed.setDescription(this.rollsToEmojiString);
    embed.addFields(fields);

    return embed;
  }
}
