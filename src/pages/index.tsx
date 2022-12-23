import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { createClient } from '../../prismicio.js';

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

function formatPosts(response): PostPagination {
  const posts = {
    // Next page for api calls
    next_page: response.next_page,

    // Posts itself
    results: response.results.map(post => ({
      uid: post.uid,
      // Date with correct format
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        // Convert from richtext HTML to text only
        author: RichText.asText(post.data.author),
        subtitle: RichText.asText(post.data.subtitle),
        title: RichText.asText(post.data.title),
      },
    })),
  };

  return posts;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [showButton, setShowButton] = useState(true);
  const nextPage = useRef(postsPagination.next_page);

  useEffect(() => {
    if (!nextPage.current) {
      setShowButton(false);
    }
  }, [posts]);

  async function loadMorePosts(): Promise<void> {
    if (!nextPage.current) return;

    try {
      const response = await fetch(nextPage.current);
      const data = await response.json();

      const postsFormatted = formatPosts(data);

      nextPage.current = postsFormatted.next_page;

      setPosts(prev => [...prev, ...postsFormatted.results]);
    } catch {
      //
    }
  }

  return (
    <>
      <Head>
        <title>spacetraveling. | Home</title>
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles.content}`}>
        <section className={styles.post__wrapper}>
          {posts.map(post => (
            <article className={styles.post__preview} key={post.uid}>
              <Link href="/">
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar size={20} />
                    <span>{post.first_publication_date}</span>
                  </time>
                  <div>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>
        {showButton && (
          <button type="button" onClick={loadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = createClient({});

  const response = await prismic.getByType('posts', {
    pageSize: 3,
  });

  return {
    props: {
      postsPagination: formatPosts(response),
    },
  };
};
