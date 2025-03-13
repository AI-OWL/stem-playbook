
// Font families and styles for the app
export const Fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  light: 'Poppins-Light',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
  italic: 'Poppins-Italic',
};

// Font size constants
export const FontSizes = {
  xs: 12,
  small: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Text styles that can be reused across the app
export const TextStyles = {
  heading: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxxl,
    lineHeight: 38,
  },
  subheading: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xxl,
    lineHeight: 30,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xl,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.medium,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.medium,
    lineHeight: 24,
  },
  small: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.light,
    fontSize: FontSizes.xs,
    lineHeight: 16,
  },
};
