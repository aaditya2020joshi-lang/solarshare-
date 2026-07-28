const PANEL_IMAGES = ['https://upload.wikimedia.org/wikipedia/commons/9/90/Solar_cell.png'];

export function getPanelImage(panelId) {
  const index = Number(panelId) % PANEL_IMAGES.length;
  return PANEL_IMAGES[index];
}
