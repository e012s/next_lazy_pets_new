/** Local paths under public/ for mock order photo grids. */
export const mockOrderPhotos = ["/icons/pet-boarding.svg", "/icons/pet-groom.svg", "/icons/pet-walk.svg"];

export function mockPhotosForCount(count) {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, index) => mockOrderPhotos[index % mockOrderPhotos.length]);
}
