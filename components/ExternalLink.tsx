import { ExternalPathString, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export function ExternalLink({ href, ...rest }: Props) {
  const handlePress = async (event: any) => {
    if (!href) return;

    if (Platform.OS !== 'web') {
      event.preventDefault();
      await openBrowserAsync(href);
    }
  };

  return (
    <Link
      {...rest}
      href={href as ExternalPathString}
      target="_blank"
      onPress={handlePress}
    />
  );
}
