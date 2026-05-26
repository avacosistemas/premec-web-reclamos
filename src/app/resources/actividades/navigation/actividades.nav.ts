import { NavigationDef } from "@fwk/model/component-def/navigation-def";

export const ACTIVIDADES_NAV_DEF: NavigationDef = {
    id: 'actividades',
    url: '/actividades',
    translateKey: 'page_title',
    icon: 'heroicons_outline:clipboard-document-list',
    showInMenu: false,
    activeItemId: 'reclamos'
};
