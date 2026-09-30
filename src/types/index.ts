import { Timestamp } from 'firebase/firestore';

export interface Member {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt?: Timestamp | string;
  approvedAt?: Timestamp | string;
}

export interface ProposalComment {
  author: string;
  authorPhoto?: string;
  authorUid?: string;
  text: string;
  date: string;
}

export interface Proposal {
  id: string;
  title: string;
  desc?: string;
  author: string;
  authorPhoto?: string;
  authorUid?: string;
  votes: number;
  voters: string[];
  comments: ProposalComment[];
  isFinal: boolean;
  owner?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  date: string;
  createdAt?: Timestamp | { toMillis: () => number };
}

export interface RecordItem {
  id: string;
  type: 'photo' | 'material';
  url: string;
  text?: string;
  author?: string;
  authorPhoto?: string;
  authorUid?: string;
  date?: string;
  createdAt?: Timestamp | { toMillis: () => number };
}

export interface UpdateItem {
  id: string;
  text: string;
  author: string;
  authorPhoto?: string;
  authorUid?: string;
  imgUrl?: string;
  date: string;
  createdAt?: Timestamp | { toMillis: () => number };
}

export type WishStatus = 'pending' | 'in_progress' | 'completed';

export interface WishComment {
  author: string;
  authorPhoto?: string;
  authorUid?: string;
  text: string;
  date: string;
}

export interface WishItem {
  id: string;
  title: string;
  desc?: string;
  author: string;
  authorPhoto?: string;
  authorUid?: string;
  status: WishStatus;
  likes: string[];
  adminNote?: string;
  changeSummary?: string;       // 此願望帶來的具體改動與擴充功能清單
  versionTag?: string;          // 對應發布的版本號，例如 "v1.1.0"
  comments?: WishComment[];     // 針對該願望的留言回饋串
  date: string;
  createdAt?: Timestamp | { toMillis: () => number };
}
