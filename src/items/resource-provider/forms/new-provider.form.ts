import { Space } from '~/spaces/space/entities/space.entity';
import { ActionContext } from '~/discord/helpers/menu-helper';
import { Item } from '~/items/item/entities/item.entity';
import { FormConfig, FormHelper } from '~/discord/helpers/form-helper';
import { ButtonStyle } from 'discord.js';
import { DiscordSimpleError } from '~/discord/exceptions';
import { AvailablePointsEnums } from '~/player-system/system-types';
import { ResourceProvider } from '../resource-provider.entity';

export interface ResourceProviderActionContext extends ActionContext {
  space: Space;
  provider?: ResourceProvider;
  item?: Item;
}

interface NewResourceProviderProps1 {
  metaForAExtraDrop: number;
  metaPerceptionRoll: number;
  minDrop: number;
  maxDrop: number;
}
interface NewResourceProviderProps2 {
  daysCooldown: number;
  hoursCooldown: number;
  minutesCooldown: number;
  minutesCooldownPerception: number;
}
interface NewResourceProviderProps
  extends NewResourceProviderProps1,
    NewResourceProviderProps2 {
  roll3?: AvailablePointsEnums;
}

const getForm2 = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewResourceProviderProps2> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps2> = {
        label: `Novo Provedor de Item 4/4: ${context.item.name}`,
        fields: [
          {
            placeholder: 'Dias de cooldown [0]',
            propKey: 'daysCooldown',
            defaultValue: 0,
            options: [
              0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 14, 15, 16, 20, 25, 30,
            ].map((n) => ({
              label: n.toString() + ' dias',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: 'Horas de cooldown [0]',
            propKey: 'hoursCooldown',
            defaultValue: 0,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 20, 24].map(
              (n) => ({
                label: n.toString() + ' horas',
                value: n.toString(),
              }),
            ),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: 'Minutos de cooldown [0]',
            propKey: 'minutesCooldown',
            defaultValue: 0,
            options: [0, 5, 10, 15, 20, 30, 45, 60].map((n) => ({
              label: n.toString() + ' minutos',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: 'Minutos de cooldown para percepção [15]',
            propKey: 'minutesCooldownPerception',
            defaultValue: 0,
            options: [0, 5, 10, 15, 20, 30, 45, 60].map((n) => ({
              label: n.toString() + ' minutos',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
        ],
        buttons: [
          {
            label: 'Cancelar',
            style: ButtonStyle.Danger,
            handler: async (i, form) => {
              reject(null);
            },
          },
          {
            label: 'Criar',
            style: ButtonStyle.Success,
            handler: async (i, form) => {
              resolve(form);
            },
          },
        ],
      };

      new FormHelper<NewResourceProviderProps2>(context, config).init();
    },
  );
  return promise;
};
const getForm1 = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewResourceProviderProps1> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps1> = {
        label: `Novo Provedor de Item 3/4: ${context.item.name}`,
        fields: [
          {
            placeholder: 'Metas para garantir um drop extra (Cada x ganha 1)',
            propKey: 'metaForAExtraDrop',
            defaultValue: 0,
            options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
              label: n.toString() + ' de Meta',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: `Drops mínimos do recurso`,
            propKey: 'minDrop',
            options: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20,
            ].map((n) => ({
              label: n.toString(),
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: `Drops máximos do recurso`,
            propKey: 'maxDrop',
            options: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 25, 30,
            ].map((n) => ({
              label: n.toString(),
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: `Meta para rolagem de percepção`,
            propKey: 'metaPerceptionRoll',
            options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
              label: n.toString() + ' de Meta',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
        ],
        buttons: [
          {
            label: 'Cancelar',
            style: ButtonStyle.Danger,
            handler: async (i, form) => {
              reject(null);
            },
          },
          {
            label: 'Continuar',
            style: ButtonStyle.Primary,
            handler: async (i, form) => {
              resolve(form);
            },
          },
        ],
      };

      new FormHelper<NewResourceProviderProps1>(context, config).init();
    },
  );
  return promise;
};

export const getNewProviderInput = async (
  context: ResourceProviderActionContext,
) => {
  const form1 = await getForm1(context);
  if (!form1?.minDrop && form1?.minDrop !== 0) {
    throw new DiscordSimpleError('Você precisa escolher um drop mínimo');
  }
  if (!form1?.maxDrop) {
    throw new DiscordSimpleError('Você precisa escolher um drop máximo');
  }
  if (!form1?.metaForAExtraDrop) {
    throw new DiscordSimpleError('Você precisa escolher uma meta');
  }
  if (!form1?.metaPerceptionRoll) {
    throw new DiscordSimpleError('Você precisa escolher uma meta');
  }
  const form4 = await getForm2(context);
  const form: NewResourceProviderProps = {
    ...form1,
    ...form4,
  };
  return form;
};
