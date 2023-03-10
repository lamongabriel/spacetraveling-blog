/* eslint-disable react/no-danger */
import { Fragment } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// Icons
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

// Helpers
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Prismic
import * as prismicH from '@prismicio/helpers';
import { RichText } from 'prismic-dom';
import { createClient } from '../../../prismicio';

// Components
import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

// Styles
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  time_to_read: string;
  data: {
    title: string;
    subtitle: string;
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
        <meta name="description" content={post.data.subtitle} />

        <meta property="og:title" content={post.data.title} />
        <meta property="og:description" content={post.data.subtitle} />
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
            {post.first_publication_date !== post.last_publication_date && (
              <i>* editado em {post.last_publication_date}</i>
            )}
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
                  <span>Pr??ximo post</span>
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
  const prismic = createClient({});
  const pages = await prismic.getAllByType('posts');

  return {
    fallback: true,
    paths: pages.map(page => prismicH.asLink(page)),
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
}) => {
  const { slug } = params as { slug: string };

  const prismic = createClient({ previewData });

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

  function formatDate(date: string): string {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }

  const post = {
    data: {
      title: RichText.asText(currentPost.data.title),
      author: RichText.asText(currentPost.data.author),
      subtitle: RichText.asText(currentPost.data.subtitle),
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
    first_publication_date: formatDate(currentPost.first_publication_date),
    last_publication_date: formatDate(currentPost.last_publication_date),
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
