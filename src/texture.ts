import { Application, Assets, Renderer, Text } from 'pixi.js'

// 地图
const map = {
  sun: "白天.jpg"
}

const mapAll = {
  ...map,
}

// 植物
const plants = {
  peashooter: '豌豆射手.gif',
}
const bullets = {
  peashooter_bullet: '豆.gif',
}

const plantAll = {
  ...plants,
  ...bullets,
}
// 僵尸
const zombies = {
  normal_walk: "普通僵尸/普通僵尸走路.gif",
  normal_eat: "普通僵尸/普通僵尸啃食.gif",
}
const zombieAll = {
  ...zombies,
}

const allAssets: Record<string, { values: Array<string>, path: string }> =
{
  plantAssets: {
    values: Object.values(plantAll),
    path: "植物"
  },
  zombieAssets: {
    values: Object.values(zombieAll),
    path: "僵尸"
  },

  mapAssets: {
    values: Object.values(mapAll),
    path: "场景"
  },
}


function initLoading(app: Application<Renderer>) {
  const load_tips = new Text({ text: '0%' })
  load_tips.style.fontSize = 20
  load_tips.style.fill = 0x000000
  load_tips.position.set(window.innerWidth / 2, window.innerHeight / 2)
  app.stage.addChild(load_tips)
  return function updateLoading(process: number) {
    load_tips.text = `${Math.floor(process * 100)}%`
    if (process >= 1) {
      app.stage.removeChild(load_tips)
    }
  }
}

export async function loadAllAssest(app: Application<Renderer>) {
  const updateLoading = initLoading(app)
  for (const key of Object.keys(allAssets)) {
    const basePath = allAssets[key].path
    allAssets[key].values.forEach((path, i) => {
      console.log(`/assets/${basePath}/${path}`)
      Assets.add({
        alias: allAssets[key].values[i],
        src: `/assets/${basePath}/${path}`,
      })
    })
  }

  // Load multiple assets:
  let loaded = 0
  return await Promise.all(
    Object.values(allAssets).map((assest) =>
      Assets.load(assest.values, (progress) => {
        loaded += progress

        updateLoading(
          loaded / (Object.keys(allAssets).length *
            assest.values.length)
        )
      })
    ),
  )
}

export const textureAssets = {
  plant: { ...plantAll },
  zombie: { ...zombieAll },
  map: { ...mapAll },
}