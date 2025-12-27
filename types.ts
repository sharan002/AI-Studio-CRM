
export interface Conversation {
  _id?: string;
  userMsg: string;
  botReply: string;
  timestamp: string | { $date: string };
}

export interface Remark {
  _id: string;
  remark: string;
  timestamp: string | { $date: string };
}

export interface User {
  _id: string;
  username: string;
  useremail: string;
  userNumber?: string;
  role: 'admin' | 'user';
}

export interface Lead {
  _id: string;
  userName: string;
  userNumber: string;
  course: string | null;
  courseofintrest?: string;
  leadfrom: string;
  assignedto?: string;
  conversations: Conversation[];
  programType?: string;
  city?: string;
  profession: string | null;
  location: string | null;
  status: string;
  pipeline: string;
  remarks: Remark[];
  reminder: string | null | { $date: string };
  followUpCount: number;
  respondedAfterFollowUp: boolean;
  lastFollowUpSentAt: string | null | { $date: string };
  datecreated: string | { $date: string };
  lastInteracted: string | { $date: string };
}

export interface DashboardResponse {
  success: boolean;
  user?: User;
  leads: Lead[];
  staffs?: User[]; // Only returned for admins
  message?: string;
}
