import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isValidLocale, Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale: Locale = defaultLocale;

  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (isValidLocale(preferredLocale)) {
        locale = preferredLocale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
