import { LocalStore } from "./asset.js"
import { vec2, normalize, sub, distance, mul, add } from './vec.js';

const localStore = new LocalStore('sour-home')

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
        
        try { appInfo.actions?.forEach(action => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            const icon = document.createElement('span')
            const title = document.createElement('span')
            
            a.href = action.url
            
            icon.innerText = action.icon
            icon.classList.add("material-symbols-rounded")
            
            title.innerText = action.title
            
            a.append(icon, title)
            li.append(a)
            document.getElementById("app-sc").append(li)
        }) } catch {}
        
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
    
    let animator
    
    app.addEventListener('touchmove', ev => {
        ev.preventDefault()
        
        closePopup();
        
        const x = ev.touches[0].pageX
        const y = ev.touches[0].pageY
        const touchPos = vec2(x, y)
        
        if (!app.classList.contains('drag')) {
            const rect = app.getBoundingClientRect()
            app.style.left = rect.left - rect.width/2 + 'px'
            app.style.top = rect.top - rect.height/2 + 'px'
            
            animator = new Animator(app)
            animator.target = touchPos
            animator.start()
        
            app.classList.add('drag')
            
            document.getElementById('grid').classList.add('drag')
        }
        
        animator.target = touchPos
        
        if (animator.isFinished) {
            app.style.left = x + 'px'
            app.style.top = y + 'px'
        }
        
        const box = document.getElementById('dock').getBoundingClientRect()
        
        if (y >= box.top) {
            if (!dock.contains(fakeApp)) {
                dock.prepend(fakeApp)
                setTimeout(() => {
                    fakeApp.style.flex = 1
                    fakeApp.querySelector('svg').style.scale = 1
                })
            }
        } else {
            fakeApp.remove()
            fakeApp.style.flex = 0
        }
    })
    
    app.addEventListener('touchend', ev => {
        const box = document.getElementById('dock').getBoundingClientRect()
        
        document.getElementById('grid').classList.remove('drag')
        
        if (animator.target.y >= box.top) {
            const rect = fakeApp.querySelector('svg').getBoundingClientRect()
            const animator = new Animator(app)
            animator.target = vec2(rect.left + rect.width/2, rect.top + rect.height/2)
            animator.start()
            
            animator.onfinish = () => {
                fakeApp.remove()
                app.classList.remove('drag')

                app.remove()
                document.getElementById('dock').prepend(app)
                
                app.style.left = 0
                app.style.top = 0
                
                localStore.filter('apps', app => app.url != appInfo.url)
                localStore.push('dock', appInfo)
            }
        } else {
            app.classList.remove('drag')
        }
    })
    
    return app
}

function loadImageCross(iconSrc) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'x-cors-api-key': 'temp_feb2edc04842027197f40b2bf0452b5d'
            }
        };
        
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
    
    for (let i = 0; i < imgd.data.length; i += 4) {
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

class Animator {
    
    /** @type { { x: number, y: number } } */
    target
    
    /** @type { () => void } */
    onfinish
    
    #running = false
    #ele
    
    constructor(ele) {
        this.#ele = ele
    }
    
    start() {
        this.#loop()
    }
    
    #loop() {
        const rect = this.#ele.getBoundingClientRect()
        const elePos = vec2(rect.left + rect.width/2, rect.top + rect.height/2)
        
        if (distance(elePos, this.target) <= 1.8) {
            this.isFinished = true
            this.onfinish?.()
            return
        }
        
        const dir = normalize(sub(this.target, elePos))
        const newPos = add(mul(dir, vec2(5, 5)), elePos)
        
        this.#ele.style.left = newPos.x + 'px'
        this.#ele.style.top = newPos.y + 'px'
        
        requestAnimationFrame(this.#loop.bind(this))
    }
}

main()