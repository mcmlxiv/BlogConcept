import React from "react";
import { GetStaticProps } from "next";
import styles from "../styles/Home.module.css";
import Link from "next/link";

interface Post {
  title: string;
  slug: string[];
  post: string[];
  index: number;
}

async function getPosts() {
  //fetching from Ghost
  const res = await fetch(
    `https://hungrybrains.herokuapp.com/ghost/api/v3/content/posts/?key=${process.env.NEXT_PUBLIC_CONTEXT_API_KEY}&fields=title,url,custom_excerpt,slug`
  ).then((res) => res.json());

  //console.log(res);
  return res.posts;
}
//using static props to retrieve data before the page has loaded
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const posts = await getPosts();
  return {
    props: { posts },
    revalidate: 10, //after 10seconds if there is a page visit Next will fetch a new data set from Ghost at least once
    //this ensures that there isn't a big load on the backend as there is a cached data
  };
};

const Home: React.FC<{ posts: Post[] }> = (props) => {
  const { posts } = props;

  return (
    <div className={styles.container}>
      <h1>Blog Concept by MCMLXIV</h1>
      <h3>Built with NextJs and TypeScript with GhostCMS, Hosted on Heroku</h3>
      <ul>
        {posts.map((post: Post, index: number) => {
          return (
            <li key={index}>
              <Link href={"/post/[slug]"} as={`/post/${post.slug}`}>
                <a>{post.title}</a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Home;
