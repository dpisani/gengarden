export const gltfStoryTemplate = ({src}: {src: string}) => () => {
  const clone = document.querySelector<HTMLTemplateElement>('template#scene')?.content.cloneNode(true) as HTMLElement | undefined

  clone?.querySelector('a-asset-item#model')?.setAttribute('src', src)

  return clone
}

export const textureStoryTemplate = ({imageUrls}: {imageUrls: string[]}) => () => {
  const clone = document.querySelector<HTMLTemplateElement>('template#images')?.content.cloneNode(true) as HTMLElement | undefined

  const container = clone?.querySelector('#image-container')
  for(const image of imageUrls) {
    const imgNode = document.createElement('img')
    imgNode.setAttribute('src', image)
    container?.appendChild(imgNode);
  }

  return clone
}