global.__ExpoImportMetaRegistry = {};

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => callback()),
  };
});
