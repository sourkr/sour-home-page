import LocalStorage from '../localstorage.js';

const localStore = new LocalStorage('sour-home')
const namesCom = await (await fetch('./namesCom.txt')).text()
const list = document.getElementById('apps')

namesCom.split('\n').forEach(name => {
    const words = name.split(' ')
    
    if (!words[0]) {
        const domain = words[1].toLowerCase() + "." + words[2].toLowerCase()
        createItem({
            icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            title: words[1],
            url: `https://${domain}`,
            small: words[3] == 'S'
        })
    }
})

const apps = await (await fetch('./apps.json')).json()

apps.forEach(createItem)

function createItem(app) {
    const root = document.createElement('li')
    const icon = document.createElement('div')
    const img = document.createElement('img')
    const title = document.createElement('span')
    
    icon.classList.add('icon')
    
    img.src = app.icon
    img.width = 60
    img.height = 60
    
    title.innerText = app.title
    
    if (app.small) {
        img.classList.add('small')
    }
    
    icon.append(img)
    root.append(icon, title)
    
    if (!(localStore.find('apps', item => item.url == app.url) || localStore.find('dock', item => item.url == app.url))) {
        const btn = document.createElement('button')
        btn.innerText = 'Add'
        btn.onclick = () => {
            localStore.push('apps', app)
            btn.remove()
        }
        root.append(btn)
    }
    
    list.append(root)
}