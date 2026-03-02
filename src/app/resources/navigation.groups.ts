import { FuseNavigationItem } from '@fuse/components/navigation';

export interface NavigationGroup extends FuseNavigationItem {
    id: string;
    title: string;
    type: 'collapsable' | 'group';
    icon?: string;
    children?: FuseNavigationItem[]; 
}

export const NAVIGATION_GROUPS_MAP: NavigationGroup[] = [
    {
        id: 'menu_servicios',
        title: 'Servicios',
        type: 'group',
        icon: 'heroicons_outline:wrench-screwdriver',
    },
    {
        id: 'seguridad',
        title: 'Seguridad',
        type: 'group',
        icon: 'heroicons_outline:shield-check',
    }
];
