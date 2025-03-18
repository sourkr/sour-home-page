import { loadImage } from "./asset.js"

export class DockItem {
    constructor(data) {
        this.imgSrc = data.src
    }
    
    async load() {
        this.img = await loadImage(this.imgSrc, (60).dp(), (60).dp())
    }
    
    draw(ctx, x, y) {
        ctx.drawImage(this.img, x, y)
    }
}

export class GridItem {
    constructor(data) {
        this.imgSrc = data.src
    }
    
    async load() {
        this.img = await loadImage(this.imgSrc, (60).dp(), (60).dp())
    }
    
    draw(ctx, x, y) {
        ctx.fillRect(x, y, 60..dp(), 60..dp())
        // ctx.drawImage(this.img, x, y)
    }
}

export class DockAppsItem {
    draw(ctx, x, y) {
        // console.log(60..dp)
        ctx.fillRect(x, y, 60..dp(), 60..dp())
    }
}

Number.prototype.dp = function() {
    return this * devicePixelRatio
}

// export function dpToPx()