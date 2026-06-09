import {
  Users, User, UserCheck, UserPlus, UserCog,
  DollarSign, CreditCard, Banknote, Wallet, TrendingUp, TrendingDown,
  BarChart3, PieChart, LineChart,
  Briefcase, Building2, Building, Factory, Store, Landmark,
  Phone, Headphones, MessageCircle, MessageSquare, Mail, Bell, Megaphone,
  Settings, Settings2, Shield, Lock, Key, Database, Server, Monitor, Cloud,
  FileText, File, ClipboardList, Clipboard, FolderOpen, Archive, BookOpen, Book,
  Calendar, Clock, Timer, AlarmClock,
  Truck, Car, Plane, Ship,
  Hammer, Wrench, HardHat,
  Home, Globe, Star, Heart, Zap, Target, CheckCircle, Award, Flag,
  GraduationCap, Layers, Layout, Grid, Package, ShoppingCart,
  Wifi, Cpu, Code, Terminal, GitBranch,
  type LucideIcon,
} from 'lucide-react'

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // People
  'users':         Users,
  'user':          User,
  'user-check':    UserCheck,
  'user-plus':     UserPlus,
  'user-cog':      UserCog,
  // Finance
  'dollar-sign':   DollarSign,
  'credit-card':   CreditCard,
  'banknote':      Banknote,
  'wallet':        Wallet,
  'trending-up':   TrendingUp,
  'trending-down': TrendingDown,
  // Charts
  'bar-chart':     BarChart3,
  'pie-chart':     PieChart,
  'line-chart':    LineChart,
  // Business
  'briefcase':     Briefcase,
  'building':      Building2,
  'building-2':    Building,
  'factory':       Factory,
  'store':         Store,
  'landmark':      Landmark,
  // Communication
  'phone':         Phone,
  'headphones':    Headphones,
  'message-circle':MessageCircle,
  'message-square':MessageSquare,
  'mail':          Mail,
  'bell':          Bell,
  'megaphone':     Megaphone,
  // Tech & Admin
  'settings':      Settings,
  'settings-2':    Settings2,
  'shield':        Shield,
  'lock':          Lock,
  'key':           Key,
  'database':      Database,
  'server':        Server,
  'monitor':       Monitor,
  'cloud':         Cloud,
  // Documents
  'file-text':     FileText,
  'file':          File,
  'clipboard-list':ClipboardList,
  'clipboard':     Clipboard,
  'folder':        FolderOpen,
  'archive':       Archive,
  'book-open':     BookOpen,
  'book':          Book,
  // Time
  'calendar':      Calendar,
  'clock':         Clock,
  'timer':         Timer,
  'alarm-clock':   AlarmClock,
  // Transport
  'truck':         Truck,
  'car':           Car,
  'plane':         Plane,
  'ship':          Ship,
  // Tools
  'hammer':        Hammer,
  'wrench':        Wrench,
  'hard-hat':      HardHat,
  // General
  'home':          Home,
  'globe':         Globe,
  'star':          Star,
  'heart':         Heart,
  'zap':           Zap,
  'target':        Target,
  'check-circle':  CheckCircle,
  'award':         Award,
  'flag':          Flag,
  'graduation-cap':GraduationCap,
  'layers':        Layers,
  'layout':        Layout,
  'grid':          Grid,
  'package':       Package,
  'shopping-cart': ShoppingCart,
  'wifi':          Wifi,
  'cpu':           Cpu,
  'code':          Code,
  'terminal':      Terminal,
  'git-branch':    GitBranch,
}

export const ICON_LIST = Object.keys(ICON_REGISTRY)

export function getIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? Settings
}

export const MODULE_GRADIENTS: Record<string, string> = {
  'hr':               'linear-gradient(135deg,#1e40af,#60a5fa)',
  'self-service':     'linear-gradient(135deg,#0f766e,#34d399)',
  'accounting':       'linear-gradient(135deg,#92400e,#fbbf24)',
  'customer-service': 'linear-gradient(135deg,#15803d,#4ade80)',
  'projects':         'linear-gradient(135deg,#6d28d9,#a78bfa)',
  'finance':          'linear-gradient(135deg,#065f46,#10b981)',
  'admin':            'linear-gradient(135deg,#1e293b,#475569)',
  'admin/modules':    'linear-gradient(135deg,#1e293b,#475569)',
}

const FALLBACKS = [
  'linear-gradient(135deg,#c2410c,#fb923c)',
  'linear-gradient(135deg,#be185d,#ec4899)',
  'linear-gradient(135deg,#4338ca,#818cf8)',
  'linear-gradient(135deg,#0e7490,#22d3ee)',
  'linear-gradient(135deg,#7c3aed,#c4b5fd)',
  'linear-gradient(135deg,#b91c1c,#f87171)',
]

export function getGradient(slug: string, index = 0): string {
  return MODULE_GRADIENTS[slug] ?? FALLBACKS[index % FALLBACKS.length]
}
