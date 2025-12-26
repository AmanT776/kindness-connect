export type ComplaintStatus = 'received' | 'under_review' | 'resolved' | 'closed';
export type ComplaintCategory = 'academic' | 'facility' | 'financial' | 'administrative' | 'conduct' | 'other';

export interface Complaint {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department: string;
  status: ComplaintStatus;
  isAnonymous: boolean;
  submitterId?: string;
  submitterName?: string;
  submitterEmail?: string;
  contactEmail?: string;
  contactPhone?: string;
  attachments: { name: string; url: string; type: string }[];
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: ComplaintStatus; date: string; comment?: string }[];
  officerComments: { comment: string; date: string; officerName: string }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  department?: string;
  organizationalUnitId?: number;
}

export const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Arts & Humanities',
  'Student Affairs',
  'Finance Office',
  'Library Services',
  'Campus Security',
  'Facilities Management',
  'IT Services',
  'Registrar Office',
  'Health Services',
];

export const categoryLabels: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facility: 'Facility',
  financial: 'Financial',
  administrative: 'Administrative',
  conduct: 'Conduct',
  other: 'Other',
};

export const statusLabels: Record<ComplaintStatus, string> = {
  received: 'Received',
  under_review: 'Under Review',
  resolved: 'Resolved',
  closed: 'Closed',
};

// Mock users
export const mockUsers: User[] = [
  { id: '1', email: 'student@university.edu', name: 'John Smith', role: 'student', department: 'Computer Science' },
  { id: '2', email: 'officer@university.edu', name: 'Sarah Johnson', role: 'staff' },
  { id: '3', email: 'admin@university.edu', name: 'Michael Brown', role: 'admin' },
];

// Mock complaints
export const mockComplaints: Complaint[] = [
  {
    id: '1',
    referenceNumber: 'CMP-2024-001',
    title: 'Classroom Projector Not Working',
    description: 'The projector in Room 205 has been malfunctioning for the past two weeks. It displays a blurry image and sometimes shuts off during lectures. This is affecting the quality of our classes.',
    category: 'facility',
    department: 'IT Services',
    status: 'under_review',
    isAnonymous: false,
    submitterId: '1',
    submitterName: 'John Smith',
    submitterEmail: 'student@university.edu',
    attachments: [{ name: 'projector_issue.jpg', url: '#', type: 'image/jpeg' }],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    statusHistory: [
      { status: 'received', date: '2024-01-15T10:30:00Z' },
      { status: 'under_review', date: '2024-01-16T14:20:00Z', comment: 'Assigned to IT department' },
    ],
    officerComments: [
      { comment: 'IT team has been notified. A technician will inspect the projector this week.', date: '2024-01-16T14:20:00Z', officerName: 'Sarah Johnson' },
    ],
  },
  {
    id: '2',
    referenceNumber: 'CMP-2024-002',
    title: 'Unfair Grading Concern',
    description: 'I believe there was an error in the grading of my final exam for Advanced Mathematics. My calculated score should be higher based on the marking scheme provided.',
    category: 'academic',
    department: 'Registrar Office',
    status: 'received',
    isAnonymous: true,
    contactEmail: 'anonymous@email.com',
    attachments: [],
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
    statusHistory: [
      { status: 'received', date: '2024-01-18T09:15:00Z' },
    ],
    officerComments: [],
  },
  {
    id: '3',
    referenceNumber: 'CMP-2024-003',
    title: 'Late Fee Dispute',
    description: 'I was charged a late fee for tuition payment, but I submitted my payment on time. I have the bank transaction receipt as proof.',
    category: 'financial',
    department: 'Finance Office',
    status: 'resolved',
    isAnonymous: false,
    submitterId: '1',
    submitterName: 'John Smith',
    submitterEmail: 'student@university.edu',
    attachments: [{ name: 'payment_receipt.pdf', url: '#', type: 'application/pdf' }],
    createdAt: '2024-01-10T11:45:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    statusHistory: [
      { status: 'received', date: '2024-01-10T11:45:00Z' },
      { status: 'under_review', date: '2024-01-11T09:00:00Z' },
      { status: 'resolved', date: '2024-01-14T16:30:00Z', comment: 'Late fee has been reversed' },
    ],
    officerComments: [
      { comment: 'Reviewing payment records.', date: '2024-01-11T09:00:00Z', officerName: 'Sarah Johnson' },
      { comment: 'Confirmed payment was received on time. Late fee has been reversed. Apologies for the inconvenience.', date: '2024-01-14T16:30:00Z', officerName: 'Sarah Johnson' },
    ],
  },
  {
    id: '4',
    referenceNumber: 'CMP-2024-004',
    title: 'Library Noise Complaint',
    description: 'The study area on the 3rd floor of the main library has become very noisy during exam periods. Groups of students are having loud discussions which disturbs others trying to study.',
    category: 'facility',
    department: 'Library Services',
    status: 'closed',
    isAnonymous: true,
    attachments: [],
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
    statusHistory: [
      { status: 'received', date: '2024-01-05T14:00:00Z' },
      { status: 'under_review', date: '2024-01-06T09:00:00Z' },
      { status: 'resolved', date: '2024-01-07T15:00:00Z' },
      { status: 'closed', date: '2024-01-08T10:00:00Z' },
    ],
    officerComments: [
      { comment: 'Library staff has been informed about the noise issue.', date: '2024-01-06T09:00:00Z', officerName: 'Sarah Johnson' },
      { comment: 'Additional signage has been posted and library monitors will enforce quiet hours.', date: '2024-01-07T15:00:00Z', officerName: 'Sarah Johnson' },
    ],
  },
  {
    id: '5',
    referenceNumber: 'CMP-2024-005',
    title: 'Scholarship Application Not Processed',
    description: 'I submitted my scholarship application three months ago but have not received any update. The deadline for the response has passed and I need clarity on my financial aid status.',
    category: 'financial',
    department: 'Finance Office',
    status: 'under_review',
    isAnonymous: false,
    submitterId: '1',
    submitterName: 'John Smith',
    submitterEmail: 'student@university.edu',
    contactPhone: '+1234567890',
    attachments: [
      { name: 'scholarship_application.pdf', url: '#', type: 'application/pdf' },
      { name: 'supporting_documents.pdf', url: '#', type: 'application/pdf' },
    ],
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
    statusHistory: [
      { status: 'received', date: '2024-01-20T08:00:00Z' },
      { status: 'under_review', date: '2024-01-21T11:00:00Z', comment: 'Forwarded to scholarship committee' },
    ],
    officerComments: [
      { comment: 'Application has been forwarded to the scholarship committee for review. Expected response within 5 business days.', date: '2024-01-21T11:00:00Z', officerName: 'Sarah Johnson' },
    ],
  },
];

// Helper to generate reference number
export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `CMP-${year}-${randomNum}`;
}
