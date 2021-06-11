import React, { useState } from "react";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.css";

///
interface Post {
  //describes data response from ghost
  posts: {
    slug: string;
    title: string;
    custom_excerpt: string;
    url: string;
    html: string;
    Date: string;
  }[];
}

export const getStaticPaths: GetStaticPaths<Props> = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BLOG_URL}/ghost/api/v3/content/posts/?key=${process.env.NEXT_PUBLIC_CONTEXT_API_KEY}&fields=title,url,custom_excerpt,slug`
  );
  const data: Post = await res.json();
  const paths = data.posts.map((posts: Props) => {
    return {
      //route obj
      params: { slug: posts.slug?.toString() }, //need to string due to id return as integer but url needing string
    };
  });
  return {
    paths,
    fallback: true, //this means if a user tries to visit a page that doesnt exists it returns the 404 page
    //fallback allows for retrying of the page if there is no initial data load
    //in the case of fetching from an api
    //if that is the case from fallback display loading
    //only displayed once as Next saves the data after first visit
    //therefore GhostCMS is only called once per page visit as the file
    //is saved on the Next js filesystem it is called instead
  };
};

//

//Ghost CMS request
interface Props extends ParsedUrlQuery {
  //describes params destructured from context
  //data retrieved from query
  post?: string;
  slug: string;
}
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug; //checking for undefined
  //fetching for slug to id page
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}/?key=${process.env.NEXT_PUBLIC_CONTEXT_API_KEY}&fields=title,url,custom_excerpt&formats=html`
  );

  const data: Props = await res.json();

  return {
    props: data, //alias data as props and passed to Post
    revalidate: 10, //after 10seconds if there is a page visit Next will fetch a new data set from Ghost at least once
    //this ensures that there isn't a big load on the backend as there is a cached data
  };
};

//
const Post: React.FC<Post> = ({ posts }) => {
  //setting state to control loadComments button and OnClick option
  const [enableLoadComments, setEnableLoadComments] = useState(true);
  //If the api data doesnt load display prerender screen
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }
  //Load comments from disqus api
  function loadComments() {
    //going to load discus
    //after Load comments Onclick handler invoke remove LoadComments button
    setEnableLoadComments(false);
    //set types for page returns
    type pages = {
      page: { url: string; identifier: string };
    };
    //window object set as any
    (window as any).disqus_config = function (this: pages) {
      this.page.url = window.location.href; // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = posts[0].slug; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    //create disqus script and embed comments on to page with time stamp
    const script = document.createElement("script");
    script.src = `https://hungrybrains.disqus.com/embed.js`;
    script.setAttribute("data-timestamp", Date.now().toString());
    //append the script tag on to rendered component after load Comments is click
    document.body.appendChild(script);
    //+new Date() will return Date but in UTC Format eg 159741367341 but Date.now().toString() does the same
    //docs are in disqus setup
  }

  //

  return (
    <div className={styles.container}>
      <Link href={"/"}>
        <a>Go back</a>
      </Link>
      <h1>{posts[0].title}</h1>
      <div
        /*in order to render the html */ dangerouslySetInnerHTML={{
          __html: posts[0].html,
        }}
      />
      {enableLoadComments && (
        <p className={styles.back} onClick={loadComments}>
          Load Comments
        </p>
      )}
      <div id="disqus_thread" />
    </div>
  );
};

export default Post;

///
///Mistaken code

// async function getPost(slug: string) {
//   //fetching from Ghost
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}/?key=${process.env.NEXT_PUBLIC_CONTEXT_API_KEY}&fields=title,url,custom_excerpt`
//   ).then((res) => res.json());
//
//   const posts = res.posts;
//   console.log(posts);
//   return posts;
// }

// type Props = {
//   //data retrieved from query
//   post: string;
// };
// interface Params extends ParsedUrlQuery {
//   //extending params next js typed with slug from server
//   slug: string;
// }

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   // @ts-ignore
//   const post = await getPost(params.slug);
//   return {
//     props: { post },
//   };
// };
// export const getStaticPaths = () => {
//   return {
//     path: [],
//     fallback: true,
//   };
// };
