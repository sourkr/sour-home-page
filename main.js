import LocalStorage from "./localstorage.js"

const localStore = new LocalStorage('sour-home')

const grid = document.getElementById('grid')
const dock = document.getElementById('dock')


let appInfoPopup = null

function main() {
    localStore.get('dock', []).forEach(app => {
        dock.prepend(createApp(app.icon, app.title, app.url))
    })
    
    localStore.get('apps', []).forEach(app => {
        grid.append(createApp(app.icon, app.title, app.url))
    })
}

document.getElementById("apps").addEventListener('click', async () => {
    const url = prompt("Enter Website Domain Name")
    
    if (url == null || url == '') return
    
    if (!/\w+\.\w+(\.\w+)?/.test(url)) return
    
    const info = await fetchWebsiteInfo('https://' + url)
    const title = info.hybridGraph.title
    const icon = info.hybridGraph.favicon || `http://www.google.com/s2/favicons?domain=${url}&sz=128`
    const uri = info.hybridGraph.url = `https://${url}`
    
    grid.append(createApp(icon, title, uri))
    localStore.push("apps", { icon, title, url: uri})
})

async function fetchWebsiteInfo(domain) {
    const url = `https://opengraph.io/api/1.1/site/${encodeURIComponent(domain)}?app_id=0c253682-e5d9-4402-b0e4-22933b6a92fe`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error(error);
        return 'Untitled'
    }
}

function saveApp(name, icon, url) {
    if (!localStorage.getItem('apps')) {
        localStorage.setItem('apps', '[]')
    }
    
    const apps = JSON.parse(localStorage.getItem('apps'))
    // const index = 
    
    apps.push({ name, icon, url })
    
    localStorage.setItem('apps', JSON.stringify(apps))
}

function startPress(ev) {
    if (appInfoPopup && !document.getElementById('app-info').contains(ev.target)) {
        closePopup()
        ev.stopPropagation()
    }
    
    // timer = setTimeout(() => onlongclick(ev), 700)
}

function closePopup() {
    if (!appInfoPopup) return
    
    appInfoPopup.classList.remove('popup')
    appInfoPopup.style.anchorName = 'none'
    document.getElementById('app-info').style.display = 'none'
    document.getElementById('rect').style.display = 'none'
    appInfoPopup = null
}

document.addEventListener("mousedown", startPress);

document.addEventListener("touchstart", startPress);

document.getElementById('grid').addEventListener('contextmenu', ev => {
    document.body.classList.add('edit')
})

document.getElementById('wallpaper').addEventListener('click', () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Only allow image files
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            convertToBase64(file);
        }
    };
    
    input.click();
})

function convertToBase64(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const url = e.target.result;
        document.body.style.backgroundImage = `url(${url})`
        localStorage.setItem('wallpaper', url)
    };
    reader.readAsDataURL(file);
}

if (localStorage.getItem('wallpaper')) {
    document.body.style.backgroundImage = `url(${localStorage.getItem('wallpaper')})`
}

document.body.addEventListener('click', ev => {
    if (document.body.classList.contains('edit')) {
        ev.preventDefault()
        document.body.classList.remove('edit')
    }
})

function createFakeDockItem() {
    const item = document.createElement('div')
    item.classList.add('fake-dock-item')
    return item;
}

function createApp(iconSrc, titleStr, urlStr, isDock) {
    const app = document.createElement('a')
    const img = document.createElement('img')
    const name = document.createElement('span')
    
    const fakeDockItem = createFakeDockItem()
    
    app.classList.add('app')
    app.href = urlStr
    app.draggable = true
    
    img.src = iconSrc
    img.width = 60
    img.height = 60
    
    name.innerText = titleStr
    
    app.append(img, name)
    
    let movable = false
    let draging = false
    
    app.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        ev.stopPropagation()
        
        app.classList.add('popup')
        app.style.anchorName = '--app-popup'
        
        document.getElementById('app-name').innerText = titleStr
        document.getElementById('app-info').style.display = 'block'
        document.getElementById('rect').style.display = 'block'
        appInfoPopup = app
        movable = true
        
        document.getElementById('app-remove').onclick = () => {
            // console.log(app.parentElement, dock, app.parentElement == dock)
            if (app.parentElement == dock) {
                localStore.filter("dock", app => app.url != urlStr)
            } else {
                localStore.filter("apps", app => app.url != urlStr)
            }
            
            app.remove()
            closePopup()
        }
    });
    
    let x, y
    
    app.addEventListener('touchmove', ev => {
        ev.preventDefault()
        
        closePopup();
        
        app.classList.add('drag')
        document.getElementById('grid').classList.add('drag')
        
        x = ev.touches[0].pageX
        y = ev.touches[0].pageY
        
        app.style.left = x + 'px'
        app.style.top = y + 'px'
        
        const box = document.getElementById('dock').getBoundingClientRect()
        
        if (y >= box.top) {
            document.getElementById('dock').prepend(fakeDockItem)
            // document.getElementById('dock').classList.add('drag')
        } else {
            // document.getElementById('dock').classList.remove('drag')
        }
    })
    
    app.addEventListener('touchend', ev => {
        const box = document.getElementById('dock').getBoundingClientRect()
        
        app.classList.remove('drag')
        document.getElementById('grid').classList.remove('drag')
        
        if (y >= box.top) {
            app.classList.remove('drag')
            
            fakeDockItem.remove()
            app.remove()
            document.getElementById('dock').prepend(app)
            
            app.style.left = 0
            app.style.top = 0
            
            localStore.push('dock', { icon: imgSrc, title, url })
        }
    })
    
    return app
}

main()