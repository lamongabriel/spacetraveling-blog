import Head from 'next/head';

import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { createClient } from '../../../prismicio.js';

interface Post {
  first_publication_date: string | null;
  time_to_read: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  if (!post) {
    return null;
  }

  console.log(post);
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      <main className={styles.post}>
        <article>
          <img src={post.data.banner.url} alt="bannert" />
          <section
            className={`${commonStyles.container} ${styles.post__heading}`}
          >
            <h1>{post.data.title}</h1>
            <div>
              <time>
                <FiCalendar size={20} />
                <span>{post.first_publication_date}</span>
              </time>
              <div>
                <FiUser size={20} />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock size={20} />
                <span>4 min</span>
              </div>
            </div>
          </section>
          <section
            className={`${commonStyles.container} ${styles.post__content}`}
          >
            {post.data.content.map(content => (
              <>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.body.text,
                  }}
                />
              </>
            ))}
          </section>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: true,
    paths: ['/post/elixir-por-tras-da-linguagem-de-programacao-brasileira'],
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };

  const prismic = createClient({});

  const response = await prismic.getByUID('posts', slug);

  const post = {
    data: {
      title: RichText.asText(response.data.title),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => ({
        heading: RichText.asText([content.heading[0]]),
        body: {
          text: RichText.asHtml(content.body),
        },
      })),
    },
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};
