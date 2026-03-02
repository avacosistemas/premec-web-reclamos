import { FuseNavigationItem } from '@fuse/components/navigation';

export interface Navigation
{
    compact: FuseNavigationItem[];
    default: FuseNavigationItem[];
    futuristic: FuseNavigationItem[];
    horizontal: FuseNavigationItem[];
}

export interface NavigationGroup extends FuseNavigationItem {
    id: string;
    title: string;
    type: 'group' | 'collapsable' | 'basic';
    icon?: string;
    children?: FuseNavigationItem[];
}