AFRAME.registerComponent('hot-reload', {
  init: function() {
    const el = this.el;

    window.setInterval(() => {
      const gltfModelComponent = el.components['gltf-model'];

      THREE.Cache.remove(gltfModelComponent.data);
      gltfModelComponent.loader.load(
        gltfModelComponent.data,
        function gltfLoaded(gltfModel) {
          gltfModelComponent.model = gltfModel.scene || gltfModel.scenes[0];
          gltfModelComponent.model.animations = gltfModel.animations;

          gltfModelComponent.remove();

          el.setObject3D('mesh', gltfModelComponent.model);
          el.emit('model-loaded', {
            format: 'gltf',
            model: gltfModelComponent.model,
          });
        },
        undefined /* onProgress */,
        function gltfFailed(error) {
          console.log(error);
        },
      );
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
