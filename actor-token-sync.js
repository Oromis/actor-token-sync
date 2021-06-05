Hooks.on('preUpdateActor', (actor, data) => {
  if (data != null && typeof data === 'object') {
    if (data.name !== actor.name) {
      if (data.token == null) {
        data.token = {}
      }
      data.token.name = data.name
    }
  }
})

Hooks.on('init', () => {

})

Hooks.on('ready', () => {

})
