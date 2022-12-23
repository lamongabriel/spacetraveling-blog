import Link from 'next/link';

import { AppProps } from 'next/app';
import '../styles/globals.scss';

import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../../prismicio.js';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicProvider internalLinkComponent={props => <Link {...props} />}>
      <PrismicPreview repositoryName={repositoryName}>
        <Component {...pageProps} />
      </PrismicPreview>
    </PrismicProvider>
  );
}

export default MyApp;
