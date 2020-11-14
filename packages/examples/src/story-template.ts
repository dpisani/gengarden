export interface GLTFStoryArgs {
  showGuideBox: boolean;
  guideBoxSize: string[];
  cameraPosition: string[];
  autoRotateCamera: boolean;
}

export const argTypesDefinition: Record<keyof GLTFStoryArgs, any> = {
  autoRotateCamera: { control: { type: 'boolean' }, defaultValue: false },
  cameraPosition: {control: {type: 'array'}, defaultValue: ['0', '1.6', '2']},
  showGuideBox: { control: { type: 'boolean' }, defaultValue: false },
  guideBoxSize: {control: {type: 'array'}, defaultValue: ['1', '1', '1']},
}

export const gltfStoryTemplate = ({src}: {src: string}) => ({showGuideBox, guideBoxSize, cameraPosition, autoRotateCamera}: GLTFStoryArgs) => {
  const clone = document.querySelector<HTMLTemplateElement>('template#scene')?.content.cloneNode(true) as HTMLElement | undefined

  clone?.querySelector('a-asset-item#model')?.setAttribute('src', src)

  const scene = clone?.querySelector('a-scene')

  if (showGuideBox) {
    const guideBox = document.createElement('a-box')
    const [w,h,d] = guideBoxSize
    const width = Number.parseFloat(w)
    const height = Number.parseFloat(h)
    const depth = Number.parseFloat(d)
    guideBox.setAttribute('width', `${width}`)
    guideBox.setAttribute('depth', `${depth}`)
    guideBox.setAttribute('height', `${height}`)
    guideBox.setAttribute('position', `0 ${height/2} 0`)
    guideBox.setAttribute('material', 'color: turquoise; transparent: true; opacity: 0.5; flatShading: true')

    scene?.appendChild(guideBox)
  }

  // Set camera
  const [xS, yS, zS] = cameraPosition
  const x = Number.parseFloat(xS)
  const y = Number.parseFloat(yS)
  const z = Number.parseFloat(zS)

  const camPosSetting = `initialPosition: ${x} ${y} ${z}`

  const camera = scene?.querySelector('#camera')
  const orbitSettings = camera?.getAttribute('orbit-controls')
  camera?.setAttribute('orbit-controls', `${orbitSettings};${camPosSetting}`)

  if(autoRotateCamera) {
    const orbitSettings = camera?.getAttribute('orbit-controls')
  camera?.setAttribute('orbit-controls', `${orbitSettings}; autoRotate: true`)
  }

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