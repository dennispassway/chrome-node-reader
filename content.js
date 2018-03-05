let modules = null

setModulesInVariable()

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'MODULES')) {
    response(modules)
  }
})

function setModulesInVariable () {
  const domHTML = document.all[0].outerHTML
  const urls = findScriptUrls(domHTML)

  Promise.all(urls.map(url => loadData(url).then(data => findNodeModules(data))))
    .then(results => {
      const allModules = [].concat.apply([], results)
      const filteredModules = allModules.filter((value, index, self) => (value !== null) && (self.indexOf(value) === index)).sort()

      const string = filteredModules.map(module => row(module)).join('')
      modules = string
    })
}

function row (name) {
  return `<div class="row"><div class="name">${name}</div><a target="_blank" href="https://www.npmjs.com/package/${name}" class="url">View on NPM</a></div>`
}

function findScriptUrls (html) {
  const scriptRegex = /<script.*?src="(.*?)"/gim

  const scriptMatches = html.match(scriptRegex)

  return scriptMatches.map(script => {
    const srcRegex = /src=\"(.+)\"/gim
    const srcMatches = srcRegex.exec(script)
    return srcMatches[1]
  })
}

function findNodeModules (data) {
  const nodeRegex = /node_modules\/([^/]+)\//gim
  const stringMatches = data.match(nodeRegex)

  if (!stringMatches || !stringMatches.length) {
    return null
  }

  const moduleMatches = stringMatches.map(node => {
    const matches = nodeRegex.exec(node)

    if (!matches || !matches.length) {
      return null
    }

    return matches[1]
  })

  const nodeModules = moduleMatches.filter(value => value !== null)
  return nodeModules
}

function loadData (url) {
  return new Promise(resolve => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.responseText)
      }
    }
    xhr.send()
  })
}
