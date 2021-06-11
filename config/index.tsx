const dev = process.env.NODE_ENV !== "production";

export const server = dev ? null : "https://hungrybrains.herokuapp.com/";
