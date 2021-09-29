function mapGen(_mainMulti=1, _secondMulti=1, _exp=0.6, _mask="none", _width=1000, _height=1000, _seaLevel=0.5){
    let multiplierPerlin = _mainMulti
    let octaveMulti = _secondMulti
    let exp = _exp
    let mask = _mask
    let width = _width
    let height = _height
    let seaLevel = _seaLevel

    let heightMap = []
    let tempMap = []
    let moistMap = []
    let biomeMap = []
    let archipelagoMask = []
    let grtLakesMask = []

    function ConvertTo1D(map) {
        let out = []
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                out.push(map[x][y])
            }
        }
        return(out)
    }

    function initMasks() {
        for (let x = 0; x < width; x++) {
            archipelagoMask.push([])
            for (let y = 0; y < height; y++) {
                let nx = x/width - 0.5
                let ny = y/height - 0.5
                let d = Math.sqrt(nx*nx + ny*ny) / Math.sqrt(0.5)
                archipelagoMask[x][y] = d
            }
        }
        for (let x = 0; x < width; x++) {
            grtLakesMask.push([])
            for (let y = 0; y < height; y++) {
                let nx = x/width - 0.5
                let ny = y/height - 0.5
                let d = Math.sqrt(nx*nx + ny*ny) / Math.sqrt(0.5)
                d = Math.pow(d, 2.5)
                grtLakesMask[x][y] = -d
            }
        }
    }

    function initHM() {
        noise.seed(Math.random())
        for (let x = 0; x < width; x++) {
            heightMap.push([])
            for (let y = 0; y < height; y++) {
                let nx = x/width - 0.5 
                let ny = y/height - 0.5;
                e  =    1*octaveMulti * noise.perlin2(1 * nx * multiplierPerlin*octaveMulti, 1 * ny * multiplierPerlin*octaveMulti)
                    +  0.5*octaveMulti * noise.perlin2(2 * nx * multiplierPerlin*octaveMulti, 2 * ny * multiplierPerlin*octaveMulti)
                    + 0.25*octaveMulti * noise.perlin2(4 * nx * multiplierPerlin*octaveMulti, 4 * ny * multiplierPerlin*octaveMulti)
                e = e / (1 + 0.5 + 0.25);
                e += 1.0;
                e /= 2.0;

                if (e <= seaLevel) {
                    e = 0
                }

                e -= seaLevel
                if (mask !== "great lakes") {
                    if (e <= 0) {
                        e = 0
                    }
                } else {
                    if (e <= 0) {
                        e = 0
                    }
                }
                let value = e
                value = Math.pow(e,exp)
                heightMap[x][y] = value
            }
        }
    }

    function initTM() {
        noise.seed(Math.random())
        for (let x = 0; x < width; x++) {
            tempMap.push([])
            for (let y = 0; y < height; y++) {
                let nx = x/width - 0.5 
                let ny = y/height - 0.5;
                tempMap[x][y] = noise.perlin2(nx*multiplierPerlin,ny*multiplierPerlin)
            }
        }
    }

    function initMM() {
        noise.seed(Math.random())
        for (let x = 0; x < width; x++) {
            moistMap.push([])
            for (let y = 0; y < height; y++) {
                let nx = x/width - 0.5 
                let ny = y/height - 0.5;
                moistMap[x][y] = noise.perlin2(nx*multiplierPerlin,ny*multiplierPerlin)
            }
        }
    }

    // 0 = tundra
    // 1 = taiga
    // 2 = temp grassland
    // 3 = temp decid forest
    // 4 = temp conif forest
    // 5 = sub trop desert
    // 6 = savanna
    // 7 = trop seasonal forest
    // 8 = trop rainforest

    function biomeCheck() {
        for (let x = 0; x < width; x++) {
            biomeMap.push([])
            for (let y = 0; y < height; y++) {
                if (tempMap[x][y] <= -0.3) {
                    biomeMap[x][y] = 0
                } else if (tempMap[x][y] <= -0.1) {
                    if (moistMap[x][y] <= -0.45) {
                        biomeMap[x][y] = 5
                    } else if (moistMap[x][y] <= -0.35) {
                        biomeMap[x][y] = 2
                    } else {
                        biomeMap[x][y] = 1
                    }
                } else if (moistMap[x][y] <= 0.35) {
                    if (moistMap[x][y] <= -0.425) {
                        biomeMap[x][y] = 5
                    } else if (moistMap[x][y] <= -0.3) {
                        biomeMap[x][y] = 2
                    } else if (moistMap[x][y] <= 0.3){
                        biomeMap[x][y] = 3
                    } else {
                        biomeMap[x][y] = 4
                    }
                } else {
                    if (moistMap[x][y] <= -0.35) {
                        biomeMap[x][y] = 5
                    } else if (moistMap[x][y] <= -0.275) {
                        biomeMap[x][y] = 6
                    } else if (moistMap[x][y] <= 0.2){
                        biomeMap[x][y] = 7
                    } else {
                        biomeMap[x][y] = 8
                    }
                }
            }
        }
    }

    function applyMask(mask) {
        if(mask == "archipelago") {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    heightMap[x][y] -= archipelagoMask[x][y]/1.25
                }
            }
        }
        if(mask == "great lakes") {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    
                    heightMap[x][y] += (grtLakesMask[x][y])*1.5
                    if (heightMap[x][y] <= 0) {
                        heightMap[x][y] = 0
                    }
                    heightMap[x][y] -= 0.5
                    heightMap[x][y] *= -1
                    heightMap[x][y] += 0.2
                    if (heightMap[x][y] < 0.7) {
                        heightMap[x][y] *= 0.5
                    }
                }
            }
        }
    }
    initMasks()
    initHM()
    applyMask(mask)
    initTM()
    initMM()
    biomeCheck()
    heightMap = ConvertTo1D(heightMap)
    biomeMap = ConvertTo1D(biomeMap)
    let output = {
        heightMap: heightMap,
        biomeMap: biomeMap
    }
    return(output)
}