import '@pixi/gif'
import { Application, Assets, Graphics, Sprite } from 'pixi.js'
import { loadAllAssest, textureAssets } from './texture'
    ; (async () => {
        // Create a new application
        const app = new Application()

        // Initialize the application
        await app.init({ background: 'white', width: 1920, height: 1080 })

        // Append the application canvas to the document body
        document.getElementById('pixi-container')!.appendChild(app.canvas)

        await loadAllAssest(app)

        const plant_temp = () => new Sprite(Assets.get(textureAssets.plant.peashooter))

        const startPos = [485, 300]
        function initBG() {
            const bg_map = new Sprite(Assets.get(textureAssets.map.sun))
            bg_map.anchor.set(0.5, 0.5)
            bg_map.x = app.screen.width / 2
            bg_map.y = app.screen.height / 2
            bg_map.scale.set(2, 2)
            app.stage.addChild(bg_map)
            // bg_map.interactive = true
            // bg_map.on("click", (e) => {
            //     const x = e.screenX
            //     const y = e.screenY
            //     console.log(`x: ${x}, y: ${y}`)
            // })
        }
        const width = 81
        const height = 98
        const gap = [6, 8]
        const mapArray = Array.from({ length: 5 }, (_, y) => Array.from({ length: 9 }, (_, x) => {
            return {
                x: startPos[0] + x * (width + gap[0]),
                y: startPos[1] + y * (height + gap[1]),
                width,
                height
            }
        }))
        function initCollision() {
            for (const row of mapArray) {
                for (const cell of row) {
                    const rect = new Graphics().rect(
                        cell.x,
                        cell.y,
                        cell.width,
                        cell.height
                    ).fill(0x00000, 0.1)
                    rect.interactive = true
                    rect.on("mouseup", () => {
                        const plant = plant_temp()
                        console.log(plant)
                        plant.position.set(cell.x, cell.y)
                        app.stage.addChild(plant)
                    })

                    app.stage.addChild(rect)
                }
            }

        }
        initBG()
        initCollision()
        // Listen for animate update
        app.ticker.add(() => {
            // // Just for fun, let's rotate mr rabbit a little.
            // // * Delta is 1 if running at 100% performance *
            // // * Creates frame-independent transformation *
            // bunny.rotation += 0.1 * time.deltaTime
        })
    })()
