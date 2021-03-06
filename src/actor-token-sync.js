import './actor-token-sync.css'

import packageFile from '../package.json'
import {libWrapper} from './libWrapper'

const MODULE_NAME = 'actor-token-sync'

Hooks.on('preUpdateActor', (actor, data) => {
  if (data != null && typeof data === 'object') {
    syncName(actor, data)
  }
})

Hooks.on('init', () => {
  console.log(`Loading Actor-Token-Sync v${packageFile.version}`)

  if (isDnD5e()) {
    libWrapper.register(MODULE_NAME, 'ActorSheet.prototype.activateListeners', function (wrapped, html, ...args) {
      const superResult = wrapped.call(this, html, ...args)
      addImageHtml(html, this)
      return superResult
    }, 'WRAPPER')
  }
})

function syncName(actor, data) {
  if (data.name !== actor.name) {
    if (data.token == null) {
      data.token = {}
    }
    data.token.name = data.name
  }
}

function addImageHtml(sheetHtml, actorSheet) {
  const actor = actorSheet.actor
  const actorImage = actor.data?.img
  const tokenImage = actor.data?.token?.img

  const actorImageElement = sheetHtml.find('.sheet-header .profile')
  const toolbar = $(`<div class="actor-token-sync__toolbar"></div>`)

  if (actorImage !== tokenImage && !actor.data?.token?.randomImg) {
    const tokenImageElement = $(`
        <div class="actor-token-sync__token-image-container">
          <div class="window-content actor-token-sync__image actor-token-sync__token-image">
            <img alt="Token" src="${tokenImage}" title="Token image" />
          </div>
        </div>
    `)
    tokenImageElement.on('click', event => {
      actorSheet._onConfigureToken(event)
    })

    actorImageElement.addClass('actor-token-sync__image actor-token-sync__actor-image')
    actorImageElement.after(tokenImageElement)

    const syncButton = $(`<a class="actor-token-sync__tiny-btn" title="Sync Images"><i class="fas fa-sync"></i></a>`)
    syncButton.on('click', async () => {
      await actor.update({ token: { img: actorImage } })
      actorSheet.render()
    })
    toolbar.append(syncButton)
  }

  const actorLinkIsActive = actor.data?.token?.actorLink
  const linkButton = $(`<a class="actor-token-sync__tiny-btn ${actorLinkIsActive ? 'active' : ''}" title="Link Actor Data"><i class="fas fa-link"></i></a>`)
  linkButton.on('click', () => {
    actor.update({ token: { actorLink: !actorLinkIsActive } })
  })
  toolbar.append(linkButton)

  actorImageElement.after(toolbar)
}

function isDnD5e() {
  return game.system.id === 'dnd5e'
}
