export type Review = {
  id: string;
  title: string;
  ratings: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
};
