declare type userType = {
  id: string;
  name: string;
  username: string;
  password: string;
  pp?: string;
  ban: boolean;
  bookmark?: postType[];
  accessToken: {
    accessNow: string;
    timeBefore: string;
  };
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
  repost?: userType | undefined;
  ogId?: string;
  reQuote?: postType;
};
