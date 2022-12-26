/* eslint-disable react/no-danger */
import { Fragment } from 'react';
import Head from 'next/head';

import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { createClient } from '../../../prismicio.js';

// Comments for blog, using https://utteranc.es/
export function Comments(): JSX.Element {
  return (
    <section
      style={{ width: '100%' }}
      ref={element => {
        if (!element) {
          return;
        }

        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', 'https://utteranc.es/client.js');
        scriptElement.setAttribute('repo', 'lamongabriel/spacetraveling-blog');
        scriptElement.setAttribute('issue-term', 'pathname');
        scriptElement.setAttribute('theme', 'photon-dark');
        scriptElement.setAttribute('crossorigin', 'anonymous');
        scriptElement.setAttribute('async', 'true');
        element.replaceChildren(scriptElement);
      }}
    />
  );
}

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

interface PostNotFiltered {
  uid: string;
  data: {
    title: {
      text: string;
    }[];
    content: {
      body: {
        text: string;
      }[];
      heading: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: PostNotFiltered;
  nextPost: PostNotFiltered;
}

export default function Post({
  post,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  if (!post) {
    return null;
  }
  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling.`}</title>
        <meta property="og:title" content={post.data.title} />
        <meta property="og:image" content={post.data.banner.url} />
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
                <span>{post.time_to_read}</span>
              </div>
            </div>
          </section>
          <section
            className={`${commonStyles.container} ${styles.post__content}`}
          >
            {post.data.content.map(content => (
              <Fragment key={content.heading}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.heading + content.body.text,
                  }}
                />
              </Fragment>
            ))}
          </section>
        </article>
        <section className={commonStyles.container}>
          <hr />
          <div className={styles.post__options}>
            {prevPost && (
              <div className={styles.post__options__prev}>
                <p>{prevPost?.data?.title[0]?.text}</p>
                <Link href={`/post/${prevPost.uid}`}>
                  <span>Post anterior</span>
                </Link>
              </div>
            )}

            {nextPost && (
              <div className={styles.post__options__next}>
                <p>{nextPost?.data?.title[0]?.text}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <span>Próximo post</span>
                </Link>
              </div>
            )}
          </div>
          <Comments />
        </section>
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

  const currentPost = await prismic.getByUID('posts', slug);

  const prevPost = await prismic.getAllByType('posts', {
    orderings: ['document.first_publication_date'],
    after: currentPost.id,
    pageSize: 1,
    limit: 1,
  });

  const nextPost = await prismic.getAllByType('posts', {
    orderings: ['document.first_publication_date desc'],
    after: currentPost.id,
    pageSize: 1,
    limit: 1,
  });

  function calculateTimeToRead(mapper: PostNotFiltered): string {
    const totalSum = Math.ceil(
      (mapper.data.content.reduce((prev, cur): number => {
        return (
          prev +
          (RichText.asText(cur.body).split(' ').length +
            RichText.asText(cur.heading).split(' ').length)
        );
      }, 0) as unknown as number) / 200
    );
    return `${totalSum} min`;
  }

  const post = {
    data: {
      title: RichText.asText(currentPost.data.title),
      author: RichText.asText(currentPost.data.author),
      banner: {
        url: currentPost.data.banner.url,
      },
      content: currentPost.data.content.map(content => ({
        heading: RichText.asHtml([content.heading[0]]),
        body: {
          text: RichText.asHtml(content.body),
        },
      })),
    },
    first_publication_date: format(
      new Date(currentPost.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    time_to_read: calculateTimeToRead(currentPost as PostNotFiltered),
  };

  return {
    props: {
      post,
      nextPost: nextPost[0] ?? null,
      prevPost: prevPost[0] ?? null,
    },
    revalidate: 60 * 60 * 24, // 24 hours, 1 day.
  };
};
