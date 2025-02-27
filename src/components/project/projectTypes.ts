export interface TimelineEvent {
  id: number;
  time: string;
  end_time: string;
  duration: string;
  title: string;
  description?: string;
  location?: string;
  project_id: number;
  user_id: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  created_at: string;
  user_id: string;
  wedding_date?: string;
  events: TimelineEvent[];
  vendors: any[];
}