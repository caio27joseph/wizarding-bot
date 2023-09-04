export function getDisplayKeyMaps<
  KeyType extends keyof any,
  DisplayType extends string,
>(
  displayEnum: any,
  keyEnum: any,
): {
  displayToKeyMap: Record<DisplayType, KeyType>;
  keyToDisplayMap: Record<KeyType, DisplayType>;
} {
  const displayToKeyMap: Record<DisplayType, KeyType> = {} as Record<
    DisplayType,
    KeyType
  >;
  const keyToDisplayMap: Record<KeyType, DisplayType> = {} as Record<
    KeyType,
    DisplayType
  >;

  for (let key in displayEnum) {
    if (displayEnum.hasOwnProperty(key) && keyEnum.hasOwnProperty(key)) {
      const k = key as KeyType;
      displayToKeyMap[displayEnum[k]] = keyEnum[k];
      keyToDisplayMap[keyEnum[k]] = displayEnum[k];
    }
  }

  return {
    displayToKeyMap,
    keyToDisplayMap,
  };
}
