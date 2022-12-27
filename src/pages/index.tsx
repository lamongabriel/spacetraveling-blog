import { useRef, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// Icons
import { FiUser, FiCalendar } from 'react-icons/fi';

// Helpers
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Prismic
import { RichText } from 'prismic-dom';
import { createClient } from '../../prismicio';

// Components
import Header from '../components/Header';
import { Greeting } from '../components/Greeting';

// Styles
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
  const nextPage = useRef(postsPagination.next_page);

  const [showButton, setShowButton] = useState(
    postsPagination.next_page !== null
  );

  async function loadMorePosts(): Promise<void> {
    if (!nextPage.current) return;

    try {
      const request = await fetch(nextPage.current);
      const data = await request.json();

      nextPage.current = data.next_page;
      if (!nextPage.current) setShowButton(false);

      const newPosts = formatPosts(data);
      setPosts(prev => [...prev, ...newPosts.results]);
    } catch {
      setShowButton(false);
    }
  }

  return (
    <>
      <Head>
        <title>spacetraveling. | Home</title>

        <meta
          name="description"
          content="Artigos, tendências, tutoriais e muita informação em um blog para você ficar atualizado e progredir na carreira. Confira!"
        />

        <meta property="og:title" content="spacetraveling. | Home" />
        <meta
          property="og:description"
          content="Artigos, tendências, tutoriais e muita informação em um blog para você ficar atualizado e progredir na carreira. Confira!"
        />
        <meta property="og:image" content="/logo.png" />
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles.content}`}>
        <Greeting />
        <section className={styles.post__wrapper}>
          {posts.map(post => (
            <article className={styles.post__preview} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
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
    // Page size set to 3, to show pagination working, but you can set
    // to a value like 20, to be more useful.
    pageSize: 3,
    orderings: ['document.first_publication_date desc'],
  });

  return {
    props: {
      postsPagination: formatPosts(response),
    },
  };
};
