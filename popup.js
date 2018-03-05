function setContent (content) {
  document.getElementById('content').innerHTML = content
}

window.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', subject: 'MODULES' }, setContent)
  })
})
