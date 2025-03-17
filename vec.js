/**
 * @param { number } x
 * @param { number } y
 */
export function vec2(x, y) {
    return { x, y }
}

/**
 * @param { { x: number, y: number } } v1
 * @param { { x: number, y: number } } v2
 */
export function distance(v1, v2) {
    const { x, y } = pow(sub(v2, v1), 2)
    return Math.abs(Math.sqrt(x + y))
}

/**
 * @param { { x: number, y: number } } v1
 * @param { { x: number, y: number } } v2
 */
export function add(v1, v2) {
    return vec2(v1.x + v2.x, v1.y + v2.y)
}

/**
 * @param { { x: number, y: number } } v1
 * @param { { x: number, y: number } } v2
 */
export function sub(v1, v2) {
    return vec2(v1.x - v2.x, v1.y - v2.y)
}

export function pow({ x, y }, e) {
    return vec2(x**e, x**e)
}

/** @param { { x: number, y: number } } */
export function normalize(v) {
    const m = magnitude(v)
    return div(v, vec2(m, m))
}

export function magnitude(v) {
    const a = pow(v, 2)
    return Math.sqrt(a.x + a.y)
}

export function div(v1, v2) {
    return vec2(v1.x / v2.x, v1.y / v2.y)
}

/**
 * @param { { x: number, y: number } } v1
 * @param { { x: number, y: number } } v2
 */
export function mul(v1, v2) {
    return vec2(v1.x * v2.x, v1.y * v2.y)
}