
import { StyleSheet, Platform, TextStyle, Text } from 'react-native';
import { Fonts } from '@/constants/Fonts';

// Override default text styles globally
const defaultTextStyles: TextStyle = {
  fontFamily: Fonts.regular,
};

// Apply global styles to Text components
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  // @ts-ignore - This is a hack to override the default text styles
  if (Text.defaultProps == null) {
    // @ts-ignore
    Text.defaultProps = {};
  }
  // @ts-ignore
  if (Text.defaultProps.style == null) {
    // @ts-ignore
    Text.defaultProps.style = {};
  }
  // @ts-ignore
  Text.defaultProps.style = [defaultTextStyles, Text.defaultProps.style];
}

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: Fonts.regular,
  },
  boldText: {
    fontFamily: Fonts.bold,
  },
  mediumText: {
    fontFamily: Fonts.medium,
  },
  lightText: {
    fontFamily: Fonts.light,
  },
  semiBoldText: {
    fontFamily: Fonts.semiBold,
  },
});
