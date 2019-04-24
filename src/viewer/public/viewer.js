AFRAME.registerComponent('hot-reload', {
  init: function() {
    const el = this.el;
    const stats = { lastModified: null };

    window.setInterval(() => {
      const gltfModelComponent = el.components['gltf-model'];
      const modelId = gltfModelComponent.data;

      fetch(`/info${modelId}`)
        .then(function(response) {
          return response.json();
        })
        .then(({ lastModified }) => {
          if (!stats.lastModified || lastModified > stats.lastModified) {
            stats.lastModified = lastModified;

            THREE.Cache.remove(gltfModelComponent.data);
            gltfModelComponent.loader.load(
              modelId,
              function gltfLoaded(gltfModel) {
                const nextModel = gltfModel.scene || gltfModel.scenes[0];
                nextModel.animations = gltfModel.animations;

                if (
                  JSON.stringify(nextModel) !==
                  JSON.stringify(gltfModelComponent.model)
                ) {
                  gltfModelComponent.model = nextModel;

                  gltfModelComponent.remove();

                  el.setObject3D('mesh', nextModel);
                  el.emit('model-loaded', {
                    format: 'gltf',
                    model: nextModel,
                  });
                }
              },
              undefined /* onProgress */,
              function gltfFailed(error) {
                console.log(error);
              },
            );
          }
        });
    }, 1000);
  },
});

const setScene = selectedModel => {
  const clone = document.importNode(
    document.querySelector('template#scene').content,
    true,
  );

  clone
    .querySelector('a-asset-item#model')
    .setAttribute('src', `/models/${selectedModel}`);

  document.querySelector('#container').appendChild(clone);
};

window.onload = () => {
  // get list of models
  fetch('/models')
    .then(function(response) {
      return response.json();
    })
    .then(function(models) {
      models.forEach(([name]) => {
        const clone = document.importNode(
          document.querySelector('template#model-list-item').content,
          true,
        );

        clone.querySelector('#text').textContent = name;
        clone
          .querySelector('#link')
          .setAttribute('href', `/?selectedItem=${name}`);
        document.querySelector('#model-list').appendChild(clone);
      });
    });

  const searchParams = new URLSearchParams(location.search);

  if (searchParams.has('selectedItem')) {
    // add scene to page
    setScene(searchParams.get('selectedItem'));
  }
};

setAutoRotate = value => {
  document
    .querySelector('a-entity[camera]')
    .setAttribute('orbit-controls', 'autoRotate', value);
};
