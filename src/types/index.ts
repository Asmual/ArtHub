export type UserRole = "user" | "artist" | "admin" | "buyer";

export interface UserSubscription {
  plan?: string;
  status?: string;
  interval?: string;
  amount?: number;
  artLimit?: number | string;
  stripeSessionId?: string;
  activatedAt?: string | Date;
  expiresAt?: string | Date;
  updatedAt?: string | Date;
}

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role: UserRole | string;
  image?: string;
  bio?: string;
  location?: string;
  phone?: string;
  specialty?: string;
  speciality?: string;
  status?: "active" | "blocked" | "suspended" | string;
  isBlocked?: boolean;
  plan?: string;
  subscription?: UserSubscription;
  subscriptionTier?: string;
  purchasesCount?: number;
  totalSold?: number;
  followers?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Artwork {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  artistName?: string;
  artistEmail?: string;
  artistImage?: string;
  artistId?: string;
  userId?: string;
  userEmail?: string;
  quantity?: number;
  isSold?: boolean;
  status?: "available" | "sold" | "out_of_stock" | string;
  isDraft?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  tags?: string[];
  dominantColors?: string[];
  artistDetails?: Partial<User>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Artist extends User {
  totalArtworks?: number;
  totalSold?: number;
}

export interface Review {
  _id?: string;
  id?: string;
  artworkId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userImage?: string;
  rating: number;
  text: string;
  images?: string[];
  isVerifiedBuyer?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderArtworkDetails {
  _id?: string;
  title?: string;
  image?: string;
  price?: number;
  category?: string;
  artistName?: string;
  artistEmail?: string;
}

export interface Order {
  _id?: string;
  id?: string;
  transactionId: string;
  type?: string;
  artworkId?: string | any;
  artworkTitle?: string;
  artworkImage?: string;
  artworkDetails?: OrderArtworkDetails | null;
  buyerId?: string | any;
  buyerEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  artistEmail: string;
  amount: number;
  price?: number;
  currency?: string;
  status: "paid" | "failed" | "pending" | string;
  paymentMethod?: string;
  date?: string | Date;
  createdAt?: string | Date;
}

export interface CartItem {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  image: string;
  artistName?: string;
  artistEmail?: string;
  quantity?: number;
  category?: string;
  isSold?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  verifiedArtworks: number;
  transactionsCount: number;
  platformRevenue: number;
  recentSales?: Order[];
}

export interface AiAdvisorArtwork {
  id: string;
  title: string;
  price: number;
  category: string;
  artistName: string;
  image: string;
  curatorNote: string;
}

export interface AiAdvisorResponse {
  reply: string;
  recommendedArtworks: AiAdvisorArtwork[];
  suggestedPrompts: string[];
}
