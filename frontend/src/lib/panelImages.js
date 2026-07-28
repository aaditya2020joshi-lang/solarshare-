const PANEL_IMAGES_BY_WATTAGE = {
  100: '/panels/panel-100w.jpg',
  200: '/panels/panel-200w.jpg',
  320: '/panels/panel-320w.jpg',
  335: '/panels/panel-335w.jpg',
  400: '/panels/panel-400w.jpg',
  440: '/panels/panel-440w.jpg',
};

const FALLBACK_IMAGE = '/panels/panel-400w.jpg';

export function getPanelImage(wattage) {
  return PANEL_IMAGES_BY_WATTAGE[Number(wattage)] || FALLBACK_IMAGE;
}
