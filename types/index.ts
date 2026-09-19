export type UserProfile = {
  user_id: string;
  username: string | null;
  slug: string | null;
  pfp: string | null;
  birthdate: number | null;
  active_subscription: boolean;
  email: string | null;
};
