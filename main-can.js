import { DockItem, DockAppsItem, GridItem } from "./core.js"
import { LocalStore, loadImage } from "./asset.js"
// import { vec2, normalize, sub, distance, mul, add } from './vec.js';

const localStore = new LocalStore('sour-home')
const can = document.getElementById('can')
const ctx = can.getContext('2d')
const wallpaper = await loadWallpaper()

const grid = new Array(6).fill(0).map(() => {
    return new Array(4).fill(0).map(() => null)
})

let dock 

can.width = innerWidth * devicePixelRatio
can.height = innerHeight * devicePixelRatio

async function main() {
    await loadGrid()
    
    drawWallpaper()
    drawGrid()
    drawDock()
}

can.addEventListener('click', () => {
    location.assign('store')
})

function drawGrid() {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const x = (can.width / 4) * c
            
            grid[r][c]?.draw(ctx, x, 0)
        }
    }
}

function drawDock() {
    const y = can.height - 80..dp() + 10..dp()
    const x = can.width/2 - 30..dp() 
    
    new DockAppsItem().draw(ctx, x, y)
}

async function loadDock() {
    const item = localStore.get('apps')
        .map(item => new DockItem(item))
        .map(item => item.load())
    
    dock = await Promise.all(item)
    // dock.push(new DockItem())
}

async function loadGrid() {
    localStore.get('apps')
        .map(item => {
            for(let y = 0; y < grid.length; y++) {
                for(let x = 0; x < grid[y].length; x++) {
                    if (!grid[y][x]) {
                        return grid[y][x] = new GridItem(item)
                    }
                }
            }
        })
}

function drawWallpaper() {
    const cw = can.width;
    const ch = can.height;
    
    const iw = wallpaper.width;
    const ih = wallpaper.height;
    
    const canvasAspect = cw / ch;
    const imageAspect = iw / ih;
    
    let sx, sy, sWidth, sHeight;
    
    if (imageAspect > canvasAspect) {
        // Image is wider than canvas.
        // Use the full height of the image and calculate width based on canvas aspect.
        sHeight = ih;
        sWidth = ih * canvasAspect;
        sx = (iw - sWidth) / 2; // center horizontally
        sy = 0;
    } else {
        // Image is taller (or equal in aspect).
        // Use the full width of the image and calculate height based on canvas aspect.
        sWidth = iw;
        sHeight = iw / canvasAspect;
        sx = 0;
        sy = (ih - sHeight) / 2; // center vertically
    }
    
    ctx.drawImage(wallpaper, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
}

async function loadWallpaper() {
    return loadImage('wallpaper.jpg')
}

main()