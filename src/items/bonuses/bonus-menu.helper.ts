import { ButtonStyle } from 'discord.js';
import { FormConfig, FormHelper } from '~/discord/helpers/form-helper';
import {
  BonusTarget,
  BonusModifier,
  BonusType,
  BonusHelper,
  Bonus,
  BonusTargetMapping,
} from './item-with-bonus.interface';
import { ActionContext } from '~/discord/helpers/menu-helper';
import { v4 } from 'uuid';

interface AddBonusProps {
  target: BonusTarget;
  modifier: BonusModifier;
}
interface ChooseBonus<R extends BonusTarget = BonusTarget> {
  targetKey: BonusTargetMapping[R];
  amount: number;
  bonusType: BonusType;
}
interface RemoveBonusProps {
  id: string;
}

export class BonusMenuHelper {
  public static addBonus<T extends ActionContext>(
    context: T,
    callback: (i, bonus: Bonus) => Promise<void>,
  ) {
    const config: FormConfig<AddBonusProps> = {
      label: 'Adicionar Bônus',
      buttons: [
        {
          label: 'Cancelar',
          style: ButtonStyle.Danger,
          handler: async (i, props) => {
            await context.interaction.followUp({
              content: 'Cancelado',
              ephemeral: true,
            });
          },
        },
        {
          label: 'Adicionar',
          style: ButtonStyle.Success,
          handler: async (i, props) => {
            if (!props.target) {
              await context.interaction.followUp({
                content: 'Falha: Tipo de Bônus não selecionado',
                ephemeral: true,
              });
              return;
            }
            return await BonusMenuHelper.addBonusForm(context, props, callback);
          },
        },
      ],
      fields: [
        {
          placeholder: 'Onde é Aplicavel',
          propKey: 'target',
          options: Object.keys(BonusTarget).map((k) => ({
            label: BonusTarget[k],
            value: BonusTarget[k],
          })),
        },
        {
          placeholder: 'Modificador de Bônus',
          propKey: 'modifier',
          options: [
            {
              label: 'Valor Adicionado',
              value: BonusModifier.Flat,
            },
            {
              label: 'Multiplicador',
              value: BonusModifier.Multiply,
            },
          ],
          defaultValue: BonusModifier.Flat,
          disabled: true,
        },
      ],
    };
    return new FormHelper(context, config).init();
  }

  public static addBonusForm<T extends ActionContext>(
    context: T,
    props: AddBonusProps,
    handler: (i, props) => Promise<void>,
  ) {
    const helper = new BonusHelper({
      target: props.target,
    } as any);

    let config: FormConfig<ChooseBonus> = {
      label: `Bônus para ${BonusTarget[props.target]}`,
      buttons: [
        {
          label: 'Cancelar',
          style: ButtonStyle.Danger,
          handler: async (i, props) => {
            await context.interaction.followUp({
              content: 'Cancelado',
              ephemeral: true,
            });
          },
        },
        {
          label: 'Adicionar',
          style: ButtonStyle.Success,
          handler: async (i, p) => {
            const bonus: Bonus = {
              id: v4(),
              target: props.target,
              modifier: props.modifier,
              targetKey: p.targetKey,
              amount: p.amount,
              bonusType: p.bonusType,
            };
            await handler(i, bonus);
          },
        },
      ],
      fields: [
        // {
        //   placeholder: 'Onde é Aplicavel',
        //   propKey: 'targetKey',
        //   options: helper.choices.map((k) => ({
        //     label: k.name,
        //     value: k.value,
        //   })),
        //   disabled: helper.choices.length === 0,
        // },
        {
          placeholder: 'Tipo de Bônus',
          propKey: 'bonusType',
          options: [
            {
              label: 'Adicionar Dados',
              value: BonusType.Dice,
            },
            {
              label: 'Sucesso Automático',
              value: BonusType.AutoSuccess,
            },
          ],
          defaultValue: BonusType.Dice,
          disabled: props.modifier !== BonusModifier.Flat,
        },
        {
          placeholder: 'Quantidade',
          propKey: 'amount',
          options: [-4, -3, -2, -1, 1, 2, 3, 4].map((k) => ({
            label: k.toString(),
            value: k.toString(),
          })),
          pipe: (v) => parseInt(v),
        },
      ],
    };

    return new FormHelper(context, config).init();
  }

  public static removeBonus<T extends ActionContext>(
    context: T,
    callback: (i, bonus: Bonus) => Promise<void>,
    bonuses: Bonus[],
  ) {
    const { interaction } = context;
    if (!bonuses.length) {
      interaction.followUp({
        content: 'Não há bônus para remover',
        ephemeral: true,
      });
      return;
    }
    const config: FormConfig<RemoveBonusProps> = {
      label: `Remover Bônus`,
      buttons: [
        {
          label: 'Cancelar',
          style: ButtonStyle.Danger,
          handler: async (i, props) => {
            await context.interaction.followUp({
              content: 'Cancelado',
              ephemeral: true,
            });
          },
        },
        {
          label: 'Remover',
          style: ButtonStyle.Success,
          handler: async (i, props) => {
            const bonus = bonuses.find((b) => b.id === props.id);
            await callback(i, bonus);
          },
        },
      ],
      fields: [
        {
          placeholder: 'Remover Bônus',
          propKey: 'id',
          options: bonuses.map((bonus) => ({
            label: new BonusHelper(bonus).toLineDisplay(),
            value: bonus.id,
          })),
        },
      ],
    };

    return new FormHelper(context, config).init();
  }
}
