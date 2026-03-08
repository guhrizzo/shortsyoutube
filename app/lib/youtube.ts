export function extractYouTubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/

  const match = url.match(regExp)

  return match && match[2].length === 11
    ? match[2]
    : null
}