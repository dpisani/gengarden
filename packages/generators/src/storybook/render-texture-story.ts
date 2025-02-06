export const renderTextureStory =
  (
    ...imageBuffers: (Promise<Buffer | ArrayBuffer> | (Buffer | ArrayBuffer))[]
  ) =>
  () => {
    const container = document.createElement("div");

    imageBuffers.map(async (imageBufferPromise) => {
      const imageBuffer = await imageBufferPromise;
      const src = URL.createObjectURL(new Blob([imageBuffer]));

      const img = document.createElement("img");
      img.setAttribute("src", src);

      container.appendChild(img);
    });

    return container;
  };
