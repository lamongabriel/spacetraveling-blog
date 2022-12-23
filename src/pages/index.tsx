import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>spacetraveling. | Home</title>
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles.content}`}>
        <section className={styles.post__wrapper}>
          <article className={styles.post__preview}>
            <Link href="/">
              <a>
                <h2>Como utilizar Hooks</h2>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <div>
                  <time>
                    <FiCalendar size={20} />
                    <span>15 Mar 2021</span>
                  </time>
                  <div>
                    <FiUser size={20} />
                    <span>Joseph Oliveira</span>
                  </div>
                </div>
              </a>
            </Link>
          </article>
          <article className={styles.post__preview}>
            <Link href="/">
              <a>
                <h2>Como utilizar Hooks</h2>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <div>
                  <time>
                    <FiCalendar size={20} />
                    <span>15 Mar 2021</span>
                  </time>
                  <div>
                    <FiUser size={20} />
                    <span>Joseph Oliveira</span>
                  </div>
                </div>
              </a>
            </Link>
          </article>
          <article className={styles.post__preview}>
            <Link href="/">
              <a>
                <h2>Como utilizar Hooks</h2>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <div>
                  <time>
                    <FiCalendar size={20} />
                    <span>15 Mar 2021</span>
                  </time>
                  <div>
                    <FiUser size={20} />
                    <span>Joseph Oliveira</span>
                  </div>
                </div>
              </a>
            </Link>
          </article>
        </section>
        <button type="button">Carregar mais posts</button>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient({});
//   // const postsResponse = await prismic.getByType(TODO);
//   // TODO
// };
