export interface Problem {
  ID: number
  Title: string
  TitleSlug: string
  Rating: number
}

export interface UserProgress {
  problem_id: number
  solved_at: string
}
