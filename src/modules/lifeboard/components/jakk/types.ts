export type Author = 'jakk' | 'me'
export type ChatMessage = {
  id: string
  author: Author
  body: string
  createdAt: string
  edited?: boolean
  replyToId?: string | null
}
