export default class LocalStorage {
    constructor(appName) {
        this.data = JSON.parse(localStorage.getItem(appName))
        this.appName = appName
        if (!this.data) this.data = {}
    }
    
    set(key, value) {
        const keys = key.split('.')
        const data = this._get(keys)
        
        // if (!data[keys.at(-1)]) {
        //     data[keys.at(-1)] = {}
        // }
        
        data[keys.at(-1)] = value
        
        this.save()
    }
    
    get(key, def) {
        const keys = key.split('.')
        
        let data = this.data
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (data[keys[i]]) {
                data = data[keys[i]]
            } else {
                data = {}
            }
        }
        
        if (!data[keys.at(-1)]) {
            data[keys.at(-1)] = def
        }
        
        return data[keys.at(-1)]
    }
    
    push(key, value) {
        const keys = key.split('.')
        const data = this._get(keys)
        
        if (!data[keys.at(-1)]) {
            data[keys.at(-1)] = []
        }
        
        data[keys.at(-1)].push(value)
        
        this.save()
    }
    
    filter(key, predicate) {
        const keys = key.split('.')
        const data = this._get(keys)
        
        if (!data[keys.at(-1)]) {
            data[keys.at(-1)] = []
        }
        
        data[keys.at(-1)] = data[keys.at(-1)]
            .filter(predicate)
        
        this.save()
    }
    
    _get(keys) {
        let data = this.data
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (data[keys[i]]) {
                data = data[keys[i]]
            } else {
                data = {}
            }
        }
        
        return data
    }
    
    save() {
        localStorage.setItem(this.appName, JSON.stringify(this.data))
    }
}