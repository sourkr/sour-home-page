import LocalStorage from "./localstorage.js"

const localStore = new LocalStorage('sour-home')

const grid = document.getElementById('grid')
const dock = document.getElementById('dock')
const fakeApp = document.getElementById('fake-app')

let appInfoPopup = null

// initialaly hidden
fakeApp.remove()

function main() {
    localStore.get('dock', []).forEach(app => {
        dock.prepend(createApp(app))
    })
    
    localStore.get('apps', []).forEach(app => {
        grid.append(createApp(app))
    })
}

/* document.getElementById("apps").addEventListener('click', async () => {
    const url = prompt("Enter Website Domain Name")
    
    if (url == null || url == '') return
    
    if (!/\w+\.\w+(\.\w+)?/.test(url)) return
    
    let icon = null
    
    const info = await fetchWebsiteInfo('https://' + url)
    const title = clearName(info.hybridGraph.title || info.hybridGraph.title || 'Unnamed')
    // const icon = info.hybridGraph.image || info.hybridGraph.favicon || `http://www.google.com/s2/favicons?domain=${url}&sz=128`
    const uri = info.hybridGraph.url = `https://${url}`
    
    try {
        if (/\w+\.\w+(\.\w+)?$/.test(url)) {
            icon = `http://www.google.com/s2/favicons?domain=${url}&sz=128`
        } else {
            icon = info.hybridGraph.image || info.hybridGraph.favicon
            
            if (icon) {
                await loadImage(icon) 
            } else {
                icon = `http://www.google.com/s2/favicons?domain=${url}&sz=128`
            }
        }
    } catch {
        icon = `http://www.google.com/s2/favicons?domain=${url}&sz=128`
    }
    
    // icon = 'https://cors-anywhere.herokuapp.com/google.com/favicon.ico'
    
    grid.append(createApp(icon, title, uri))
    localStore.push("apps", { icon, title, url: uri})
}) */

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image(1, 1)
        img.src = src
        
        img.onload = () => resolve(img)
        img.onerror = () => reject()
    })
}

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

// function createFakeDockItem() {
//     const item = document.createElement('div')
//     item.classList.add('fake-dock-item')
//     return item;
// }

function createApp(appInfo, mode = 'top') {
    const app = document.createElement('a')
    const img = document.createElement('img')
    const name = document.createElement('span')
    
    app.classList.add('app')
    app.href = appInfo.url
    app.draggable = true
    
    img.src = appInfo.icon
    // img.src = 'https://corsproxy.io/' + encodeURIComponent('https://logo.clearbit.com/google.com')
    // console.log(img.src)
    img.width = 60
    img.height = 60
    
    if (appInfo.small) img.classList.add('small')
    
    // isTransparent(appInfo.)
    //     .then(res => {
    //         console.log(res)
    //         if (res) img.classList.add('small')
    //     })
    
    name.innerText = appInfo.title
    
    app.append(img, name)
    
    let movable = false
    let draging = false
    
    app.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        ev.stopPropagation()
        
        app.classList.add('popup')
        app.style.anchorName = '--app-popup'
        
        document.getElementById('app-name').innerText = appInfo.title
        document.getElementById('app-info').style.display = 'block'
        // document.g/etElementById('app-info').classList.add('top')
        document.getElementById('rect').style.display = 'block'
        appInfoPopup = app
        movable = true
        
        document.getElementById("app-sc").innerHTML = ''
        
        if (appInfo.actions) {
            for(let key in appInfo.actions) {
                const li = document.createElement('li')
                const icon = document.createElement('span')
                const title = document.createElement('span')
                
                icon.innerText = key
                icon.classList.add("material-symbols-rounded")
                
                title.innerText = appInfo.actions[key]
                
                li.append(icon, title)
                document.getElementById("app-sc").append(li)
            }
        }
        
        document.getElementById('app-remove').onclick = () => {
            // console.log(app.parentElement, dock, app.parentElement == dock)
            if (app.parentElement == dock) {
                localStore.filter("dock", app => app.url != appInfo.url)
            } else {
                localStore.filter("apps", app => app.url != appInfo.url)
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
            document.getElementById('dock').prepend(fakeApp)
            // document.getElementById('dock').classList.add('drag')
        } else {
            fakeApp.remove()
            // document.getElementById('dock').classList.remove('drag')
        }
    })
    
    app.addEventListener('touchend', ev => {
        const box = document.getElementById('dock').getBoundingClientRect()
        
        app.classList.remove('drag')
        document.getElementById('grid').classList.remove('drag')
        
        fakeApp.remove()
            
        if (y >= box.top) {
            app.classList.remove('drag')
            
            app.remove()
            document.getElementById('dock').prepend(app)
            
            app.style.left = 0
            app.style.top = 0
            
            localStore.filter('apps', app => app.url != appInfo.url)
            localStore.push('dock', appInfo)
        }
    })
    
    return app
}

function loadImageCross(iconSrc) {
    return new Promise((resolve, reject) => {
        const options = { headers: {
            'x-cors-api-key': 'temp_feb2edc04842027197f40b2bf0452b5d'
        } };
        
        fetch('https://proxy.cors.sh/' + iconSrc, options)
            .then(response => response.blob())
            .then(response => {
                var a = new FileReader();
                a.onload = e => {
                    const img = new Image(10, 10)
                    img.onload = () => resolve(img)
                    img.onerror = () => reject("Failed to Load: " + iconSrc)
                    // console.log(e.target.result)
                    img.src = e.target.result
                }
                a.onerror = (e) => reject("Failed to Read: " + iconSrc + e)
                a.readAsDataURL(response);
            })
            // .catch(() => reject("Failed to Fetch: " + iconSrc));
    })
}



async function isTransparent(imgSrc) {
    const img = await loadImageCross(imgSrc)
    // const can = document.createElement('canvas')
    const can = new OffscreenCanvas(10, 10);
    const ctx = can.getContext('2d')
        
    // grid.append(img)
    
    ctx.drawImage(img, 0, 0, 10, 10)
    // grid.append(can)
    const imgd = ctx.getImageData(0, 0, 10, 10)
    let count = 0
            
    for(let i = 0; i < imgd.data.length; i += 4) {
        if (imgd.data[i + 3] < 255) count++
    }
    
    console.log(count)
    
    return count > 10
}

function clearName(name) {
    if (/.*\|.*/.test(name)) {
        return /.*\|(.*)/.exec(name)[1].trim()
    }
    
    if (/.*\•.*/.test(name)) {
        return /(.*)\•.*/.exec(name)[1].trim()
    }
    
    return name.trim()
}

main()