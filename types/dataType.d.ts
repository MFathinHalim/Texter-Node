declare type userType = {
  id: string;
  name: string;
  pp: string;
  ban: boolean;
  bookmark?: postType[];
};

declare type postType = {
  id: string;
  title: string;
  time: string;
  user: userType;
  like: {
    total: number;
    users: userType[];
  };
  replyTo: string;
  img?: string;
  repost?: userType;
  ogId?: string;
  reQuote?: postType;
};
