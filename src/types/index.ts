export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_student: boolean;
  is_hostel_admin: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  is_blocked: boolean;
  is_suspended: boolean;
  suspended_until?: string | null;
  block_reason?: string;
  profile?: StudentProfile;
  date_joined: string;
}

export interface StudentProfile {
  id: number;
  hostel: number | null;
  hostel_detail?: Hostel | null;
  block: number | null;
  block_detail?: Block | null;
  room: number | null;
  room_detail?: Room | null;
  gender?: string;
  programme?: string;
  branch?: string;
  bio: string;
  phone_number: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}


export interface PublicUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email?: string;
  role?: string;
  role_display?: string;
  hostel_name?: string | null;
  room_number?: string | null;
  gender?: string;
  profile_picture?: string | null;
  is_student?: boolean;
  is_hostel_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_blocked_by_me?: boolean;
  profile?: {
    id: number;
    avatar: string | null;
    bio: string;
    gender?: string;
    programme?: string;
    branch?: string;
    hostel_name: string | null;
    hostel_id: number | null;
    block_name: string | null;
    block_id: number | null;
    room_number: string | null;
    room_id: number | null;
  } | null;
  date_joined: string;
}

export interface Hostel {
  id: number;
  name: string;
  code: string;
  description: string;
  gender: 'boys' | 'girls' | 'coed';
  warden_name: string;
  warden_contact: string;
  is_active: boolean;
  blocks_count?: number;
  students_count?: number;
}

export interface Block {
  id: number;
  hostel: number;
  hostel_name?: string;
  name: string;
  floors: number;
  is_active: boolean;
  rooms_count?: number;
}

export interface Room {
  id: number;
  block: number;
  room_number: string;
  floor: number;
  capacity: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  post_type: string;
  is_active: boolean;
  posts_count?: number;
}

export type PostType =
  | 'buy_sell'
  | 'giveaway'
  | 'exchange'
  | 'borrow'
  | 'lend'
  | 'lost'
  | 'found'
  | 'roommate'
  | 'study'
  | 'help'
  | 'service'
  | 'general'
  | 'others';

export interface PostImage {
  id: number;
  image: string;
  caption: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post: number;
  author: number;
  author_detail: PublicUser;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequest {
  id: number;
  post: number;
  post_title: string;
  borrower: number;
  borrower_detail: PublicUser;
  return_date: string | null;
  note: string;
  status: 'pending' | 'accepted' | 'rejected' | 'returned';
  created_at: string;
}

export interface Post {
  id: number;
  author: number;
  author_detail: PublicUser;
  hostel: number | null;
  hostel_name: string | null;
  hostel_detail?: Hostel | null;
  block: number | null;
  block_name: string | null;
  block_detail?: Block | null;
  post_type: PostType;
  category: number | null;
  category_name?: string | null;
  category_detail?: Category | null;
  title: string;
  description: string;
  price: string | null;
  condition: 'new' | 'like_new' | 'good' | 'used' | 'na';
  status: 'available' | 'sold' | 'closed';
  location: string;
  event_date: string | null;
  images: PostImage[];
  comments?: Comment[];
  borrow_requests?: BorrowRequest[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
  views_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  target_hostel: number | null;
  target_hostel_name?: string | null;
  target_block: number | null;
  target_block_name?: string | null;
  publish_date: string;
  expiry_date: string | null;
  attachment: string | null;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string;
  hostel: number | null;
  hostel_name?: string | null;
  organizer: string;
  banner_image: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HostelService {
  id: number;
  name: string;
  category: string;
  category_display: string;
  description: string;
  contact_person: string;
  phone_number: string;
  location: string;
  timings: string;
  hostel: number | null;
  hostel_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StudyResource {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  resource_type_display: string;
  course_name: string;
  course_code: string;
  semester: string;
  department: string;
  file: string | null;
  external_link: string;
  uploader: number;
  uploader_detail: PublicUser;
  downloads_count: number;
  is_active: boolean;
  created_at: string;
}

export interface MessageReactionItem {
  emoji: string;
  count: number;
  users: string[];
  user_reacted: boolean;
}

export interface ReplyToDetail {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  message_type: string;
  file_name?: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_detail: PublicUser;
  message_type?: 'text' | 'image' | 'video' | 'file' | 'audio' | 'gif';
  content: string;
  file?: string | null;
  file_name?: string;
  file_size?: number | null;
  file_type?: string;
  reply_to?: number | null;
  reply_to_detail?: ReplyToDetail | null;
  reactions?: MessageReactionItem[];
  is_deleted_everyone?: boolean;
  is_read: boolean;
  is_me: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  is_group?: boolean;
  group_name?: string;
  group_avatar?: string | null;
  group_admin?: number | null;
  group_admin_detail?: PublicUser | null;
  members_count?: number;
  is_admin?: boolean;
  is_blocked_by_me?: boolean;
  other_user: PublicUser | null;
  participants?: number[];
  participants_detail?: PublicUser[];
  related_post: number | null;
  post_title?: string | null;
  post_info?: {
    id: number;
    title: string;
    price: string | null;
    post_type: string;
    status: string;
  } | null;
  last_message?: {
    id: number;
    content: string;
    sender_id: number;
    sender_name?: string;
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  messages?: Message[];
  updated_at: string;
  created_at: string;
}

export type ChatBgType = 'default' | 'solid' | 'gradient' | 'wallpaper' | 'custom';
export type ChatBubbleStyle = 'classic' | 'rounded' | 'minimal' | 'compact';
export type ChatThemeMode = 'light' | 'dark' | 'system';

export interface UserChatPreference {
  id?: number;
  user?: number;
  conversation?: number | null;
  bg_type: ChatBgType;
  bg_value: string;
  custom_bg_image?: string | null;
  custom_bg_image_url?: string | null;
  bubble_style: ChatBubbleStyle;
  theme_mode: ChatThemeMode;
  created_at?: string;
  updated_at?: string;
}


export interface Notification {
  id: number;
  sender: number | null;
  sender_detail?: PublicUser | null;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: number;
  site_name: string;
  tagline: string;
  community_rules: string;
  guidelines: string;
  contact_email: string;
  maintenance_mode: boolean;
}
