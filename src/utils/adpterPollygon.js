export default function adapter (path) {
  return path.map(point => {
    return [point.lng, point.lat]
  })
}
