export const getDisplayKeyMaps = (displayEnum: any, keyEnum: any) => {
  const displayToKeyMap: { [key: string]: string } = {};
  const keyToDisplayMap: { [key: string]: string } = {};

  for (let key in displayEnum) {
    if (displayEnum.hasOwnProperty(key) && keyEnum.hasOwnProperty(key)) {
      displayToKeyMap[displayEnum[key]] = keyEnum[key];
      keyToDisplayMap[keyEnum[key]] = displayEnum[key];
    }
  }

  return {
    displayToKeyMap,
    keyToDisplayMap,
  };
};
