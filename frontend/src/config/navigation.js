import {
  FileText,
  FolderKanban,
  History,
  Layers,
  LayoutDashboard,
  Paperclip,
  Settings,
} from 'lucide-react';

/**
 * Sidebar navigation. `available: false` routes render the Coming soon page.
 * `path` is relative to /dashboard.
 */
export const NAV_ITEMS = [
  {
    path: '',
    label: 'Overview',
    icon: LayoutDashboard,
    available: true,
  },
  {
    path: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    available: false,
    description: 'Document the projects you have built and the role you played in each.',
  },
  {
    path: 'resumes',
    label: 'Resumes',
    icon: FileText,
    available: false,
    description: 'Keep versions of your resume and see how they change over time.',
  },
  {
    path: 'skills',
    label: 'Skills',
    icon: Layers,
    available: false,
    description: 'Track the skills you have and how they develop.',
  },
  {
    path: 'timeline',
    label: 'Timeline',
    icon: History,
    available: false,
    description: 'A chronological view of how your professional identity has evolved.',
  },
  {
    path: 'evidence',
    label: 'Evidence',
    icon: Paperclip,
    available: false,
    description: 'Attach proof of your work to the skills and projects it supports.',
  },
  {
    path: 'settings',
    label: 'Settings',
    icon: Settings,
    available: true,
  },
];
