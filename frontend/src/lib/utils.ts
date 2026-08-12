import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SKILLS_LIST = [
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
  'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Flask',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'AWS', 'Docker', 'Kubernetes', 'CI/CD',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Computer Vision', 'NLP',
  'Figma', 'UI/UX', 'Tailwind CSS', 'Framer Motion',
  'Solidity', 'Web3.js', 'Ethers.js',
  'React Native', 'Flutter',
  'GraphQL', 'REST API', 'WebSockets',
  'Java', 'Spring Boot', 'Go', 'Rust', 'C++',
];

export const ROLES = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'design', label: 'UI/UX Designer' },
  { value: 'ml', label: 'ML Engineer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'other', label: 'Other' },
];

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

export const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    frontend: 'bg-blue-100 text-blue-700',
    backend: 'bg-green-100 text-green-700',
    fullstack: 'bg-purple-100 text-purple-700',
    design: 'bg-pink-100 text-pink-700',
    ml: 'bg-orange-100 text-orange-700',
    devops: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[role] || colors.other;
};