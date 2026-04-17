export interface Chat {
  id: number;
  title: string | null;
  token: string;
  userId: number;
  isShared: boolean;
  sharedAt: Date | null;
  createdAt: Date;
}

export interface CreateChat {
  title?: string;
  token: string;
  userId: number;
}
