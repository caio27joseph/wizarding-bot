import {
  KnowledgeDisplayEnum,
  SkillDisplayEnum,
  TalentDisplayEnum,
  knowledgeDisplayToKeyMap,
  skillDisplayToKeyMap,
  talentDisplayToKeyMap,
} from '~/player-system/abilities/entities/abilities.entity';
import {
  AttributeDisplayEnum,
  attributeDisplayToKeyMap,
} from '~/player-system/attribute/entities/attributes.entity';
import {
  CompetenceDisplayEnum,
  competenceDisplayToKeyMap,
} from '~/player-system/competences/entities/competences.entity';
import {
  WitchPredilectionDisplayEnum,
  witchPredilectionDisplayToKeyMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { ActionContext } from '~/discord/helpers/menu-helper';
import { Item } from '~/items/item/entities/item.entity';
import { FormConfig, FormHelper } from '~/discord/helpers/form-helper';
import { ButtonStyle } from 'discord.js';
import { DiscordSimpleError } from '~/discord/exceptions';
import {
  AvailablePointsEnums,
  PointsDisplayEnum,
  PointsKeyEnum,
  pointsKeyToEnums,
  pointsDisplayToKeyMap,
  pointsKeyToTargetDisplayMap,
  pointsKeyToDisplayMap,
} from '~/player-system/system-types';
import { ResourceProvider } from '../resource-provider.entity';

export interface ResourceProviderActionContext extends ActionContext {
  space: Space;
  provider?: ResourceProvider;
  item?: Item;
}

interface NewResourceProviderProps1 {
  rollType1: PointsKeyEnum;
  rollType2: PointsKeyEnum;
  rollType3?: PointsKeyEnum;
}
interface NewResourceProviderProps2 {
  metaForMaxDrop: number;
  roll1: AvailablePointsEnums;
  roll2: AvailablePointsEnums;
  roll3?: AvailablePointsEnums;
}
interface NewResourceProviderProps3 {
  metaForAExtraDrop: number;
  metaPerceptionRoll: number;
  minDrop: number;
  maxDrop: number;
}
interface NewResourceProviderProps4 {
  daysCooldown: number;
  hoursCooldown: number;
  minutesCooldown: number;
  minutesCooldownPerception: number;
}
interface NewResourceProviderProps
  extends NewResourceProviderProps1,
    NewResourceProviderProps2,
    NewResourceProviderProps3,
    NewResourceProviderProps4 {
  roll3?: AvailablePointsEnums;
}

const getForm4 = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewResourceProviderProps4> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps4> = {
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

      new FormHelper<NewResourceProviderProps4>(context, config).init();
    },
  );
  return promise;
};
const getForm3 = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewResourceProviderProps3> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps3> = {
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

      new FormHelper<NewResourceProviderProps3>(context, config).init();
    },
  );
  return promise;
};

const getForm2 = (
  context: ResourceProviderActionContext,
  props: NewResourceProviderProps1,
) => {
  const promise: Promise<NewResourceProviderProps2> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps2> = {
        label: `Novo Provedor de Item 2/4: ${context.item.name}`,
        fields: [
          {
            placeholder: 'Meta para garantir o máximo de drop',
            propKey: 'metaForMaxDrop',
            defaultValue: 1,
            options: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
              label: n.toString() + ' de Meta',
              value: n.toString(),
            })),
            pipe: (value) => parseInt(value),
          },
          {
            placeholder: `Escolha a rolagem para '${
              pointsKeyToDisplayMap[props.rollType1]
            }'`,
            propKey: 'roll1',
            options: Object.values(pointsKeyToEnums[props.rollType1]).map(
              (r) => ({
                label: r,
                value: pointsKeyToTargetDisplayMap[props.rollType1][r],
              }),
            ),
          },
          {
            placeholder: `Escolha a rolagem para '${
              pointsKeyToDisplayMap[props.rollType2]
            }'`,
            propKey: 'roll2',
            options: Object.values(pointsKeyToEnums[props.rollType2]).map(
              (r) => ({
                label: r,
                value: pointsKeyToTargetDisplayMap[props.rollType2][r],
              }),
            ),
          },
          {
            placeholder: `Escolha a rolagem para '${
              pointsKeyToDisplayMap[props?.rollType3]
            }'`,
            propKey: 'roll3',
            options: props?.rollType3
              ? Object.values(pointsKeyToEnums[props.rollType3])?.map((r) => ({
                  label: r,
                  value: pointsKeyToTargetDisplayMap[props.rollType3][r],
                }))
              : [],
            disabled: !props?.rollType3,
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

      new FormHelper<NewResourceProviderProps2>(context, config).init();
    },
  );
  return promise;
};

const getForm1 = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewResourceProviderProps1> = new Promise(
    (resolve, reject) => {
      const config: FormConfig<NewResourceProviderProps1> = {
        label: `Novo Provedor de Item 1/4:${context.item.name}`,
        fields: [
          {
            placeholder: 'Rolagem 1',
            propKey: 'rollType1',
            options: Object.values(PointsDisplayEnum).map((r) => ({
              label: r + `s`,
              value: pointsDisplayToKeyMap[r],
            })),
          },
          {
            placeholder: 'Rolagem 2',
            propKey: 'rollType2',
            options: Object.values(PointsDisplayEnum).map((r) => ({
              label: r + `s`,
              value: pointsDisplayToKeyMap[r],
            })),
          },
          {
            placeholder: 'Rolagem 3 (Opcional)',
            propKey: 'rollType3',
            options: [
              {
                label: 'Nenhuma',
                value: 'Nenhuma',
              },
              ...Object.values(PointsDisplayEnum).map((r) => ({
                label: r + `s`,
                value: pointsDisplayToKeyMap[r],
              })),
            ],
            defaultValue: undefined,
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
            label: 'Coninuar',
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
  if (!form1?.rollType1) {
    throw new DiscordSimpleError('Você precisa escolher uma rolagem 1');
  }
  if (!form1?.rollType2) {
    throw new DiscordSimpleError('Você precisa escolher uma rolagem 2');
  }
  // if (!form1?.daysCooldown) {
  //   throw new DiscordSimpleError('Você precisa escolher um cooldown');
  // }
  const form2 = await getForm2(context, form1);
  if (!form2?.roll1) {
    throw new DiscordSimpleError('Você precisa escolher uma rolagem 1');
  }
  if (!form2?.roll2) {
    throw new DiscordSimpleError('Você precisa escolher uma rolagem 2');
  }
  if (!form2?.metaForMaxDrop) {
    throw new DiscordSimpleError('Você precisa escolher uma meta');
  }

  const form3 = await getForm3(context);
  if (!form3?.minDrop && form3?.minDrop !== 0) {
    throw new DiscordSimpleError('Você precisa escolher um drop mínimo');
  }
  if (!form3?.maxDrop) {
    throw new DiscordSimpleError('Você precisa escolher um drop máximo');
  }
  if (!form3?.metaForAExtraDrop) {
    throw new DiscordSimpleError('Você precisa escolher uma meta');
  }
  if (!form3?.metaPerceptionRoll) {
    throw new DiscordSimpleError('Você precisa escolher uma meta');
  }
  const form4 = await getForm4(context);
  const form: NewResourceProviderProps = {
    ...form1,
    ...form2,
    ...form3,
    ...form4,
  };
  return form;
};
