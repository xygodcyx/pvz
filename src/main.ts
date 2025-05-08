// @ts-ignore
import Config from '../anim/Blover.json';
import Vector2 from './base/Vector2';

const canvas: HTMLCanvasElement = document.querySelector('canvas')!;

const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
console.log(WIDTH, HEIGHT);
console.log(Config.tracks);

interface IFrameState {
  x?: number;
  y?: number;
  sx?: number;
  sy?: number;
  kx?: number;
  ky?: number;
  f?: number;
  i?: string;
}
class Frame {
  private index: number;
  private state: IFrameState = {};

  constructor(i: number) {
    this.index = i;
  }

  init(config: IFrameState): void {
    Object.keys(config).forEach(key => {
      this.state[key] = config[key];
    });
  }

  getIndex(): number {
    return this.index;
  }

  getState(): IFrameState {
    return this.state;
  }
  isEmpty() {
    return (
      !this.state.x &&
      !this.state.y &&
      !this.state.sx &&
      !this.state.sy &&
      !this.state.kx &&
      !this.state.ky
    );
  }
  hasEmpty() {
    return (
      !this.state.x ||
      !this.state.y ||
      !this.state.sx ||
      !this.state.sy ||
      !this.state.kx ||
      !this.state.ky
    );
  }
}

class AnimationTrack {
  startFrameIndex: number = 0;
  endFrameIndex: number = 0;
  private anim_name: string;
  constructor() { }
  init(config: (typeof Config.tracks)[0]) {
    this.anim_name = config.name;
    if (!('f' in config.transforms[0])) {
      this.startFrameIndex = 0;
    } else {
      this.startFrameIndex = config.transforms.findIndex((tran: { f: number; }) => tran.f === 0) || 0;
    }
    const end_index = config.transforms.findIndex(
      (tran: { f: number; }, i: number) => tran.f === -1 && i > this.startFrameIndex
    );
    this.endFrameIndex =
      end_index === -1 ? config.transforms.length : end_index;
    console.log(this.anim_name, this.startFrameIndex, this.endFrameIndex);
  }
  getStartFrameIndex() {
    return this.startFrameIndex;
  }
  getEndFrameIndex() {
    return this.endFrameIndex;
  }
  getAnimName() {
    return this.anim_name;
  }
}

class Track {
  private frames: Frame[] = new Array();
  private name: string;
  private imgId?: string | undefined;
  private showImg: HTMLImageElement = new Image();

  private activeLastFrameState: IFrameState = {
    x: undefined,
    y: undefined,
    sx: undefined,
    sy: undefined,
    kx: undefined,
    ky: undefined,
    i: undefined
  };
  private activeFrameState: IFrameState = {
    i: '',
    x: 0,
    y: 0,
    sx: 1,
    sy: 1,
    kx: 0,
    ky: 0,
  };

  private curFrameIndex: number = 0;

  private animationTimer: number = 0;
  private clampFrameRange = [-1, -1];
  private targetFrameState: IFrameState = {}
  imgs = {}
  constructor() { }
  init(config: (typeof Config.tracks)[0]): Promise<unknown> {
    this.name = config.name;
    (config.transforms as Array<IFrameState>).forEach(
      (config_frame: IFrameState, i: number) => {
        const frame = new Frame(i);
        this.frames.push(frame);
        frame.init(config_frame);
      }
    );
    return this.initImage();
  }
  extractNameForFrame() {
    return this.frames.filter(frame => frame.getState().i);
  }
  initImage() {
    return new Promise(resolve => {
      this.extractNameForFrame().forEach(frame => {
        const image = new Image()
        const src: string = frame.getState().i.replace(
          'IMAGE_REANIM_',
          ''
        ).toLocaleLowerCase();
        image.src = `../reanim_png/${src}.png`;
        this.imgs[frame.getState().i] = image
      });
      this.imgId = this.extractNameForFrame()[0]?.getState().i
      if (!this.imgId && !this.name.startsWith('anim_')) {
        throw new Error(
          `--- name:${this.name} ---  ERROR！！！非anim轨道必须要有imgId`
        );
      }
      if (this.name.startsWith('anim_')) {
        resolve(true);
      }
      const src: string = this.imgId!.replace(
        'IMAGE_REANIM_',
        ''
      ).toLocaleLowerCase();
      this.showImg.style.position = 'absolute';
      this.showImg.src = `../reanim_png/${src}.png`;
      this.showImg.onload = () => {
        resolve(true);
      };
    });
  }
  renderfirsetFrame(animTrack: AnimationTrack) {
    this.curFrameIndex = Math.max(
      animTrack.startFrameIndex,
      (this.curFrameIndex + 1) % (animTrack.endFrameIndex)
    );
    const frame = this.frames[this.curFrameIndex];
    this.render(frame, animTrack);
  }
  process(delta: number, plant: Plant, animTrack: AnimationTrack) {
    this.animationTimer += delta;
    if (this.animationTimer >= plant.animationDelta) {
      this.animationTimer = 0;
      this.curFrameIndex = Math.max(
        animTrack.startFrameIndex,
        (this.curFrameIndex + 1) % (animTrack.endFrameIndex)
      );
    }
    const frame = this.frames[this.curFrameIndex];
    this.render(frame, animTrack);
  }
  render(frame: Frame, at: AnimationTrack) {
    ctx.save();
    let state: IFrameState = {}
    if (!this.activeFrameState.x && !this.activeFrameState.y && !this.activeFrameState.kx && !this.activeFrameState.ky && !this.activeFrameState.sx && !this.activeFrameState.sy) {
      state = this.getLastFrameState(at)
    } else {
      state = frame.getState()
    }
    let { x, y, sx, sy, kx, ky, f, i } = state;

    if (this.curFrameIndex === at.startFrameIndex) {
      this.activeFrameState = this.getLastFrameState(at)
      // this.activeFrameState.i = this.imgId
    } else {
      this.activeFrameState.x = x ? x : (this.activeLastFrameState.x || this.frames[0].getState().x);
      this.activeFrameState.y = y ? y : (this.activeLastFrameState.y || this.frames[0].getState().y);
      this.activeFrameState.sx = sx ? sx : (this.activeLastFrameState.sx || this.frames[0].getState().sx);
      this.activeFrameState.sy = sy ? sy : (this.activeLastFrameState.sy || this.frames[0].getState().sy);
      this.activeFrameState.kx = kx ? kx : (this.activeLastFrameState.kx || this.frames[0].getState().kx);
      this.activeFrameState.ky = ky ? ky : (this.activeLastFrameState.ky || this.frames[0].getState().ky);
      this.activeFrameState.i = i ? i : (this.activeLastFrameState.i || this.imgId);
    }

    const pivot = {
      x: WIDTH / 3,
      y: HEIGHT / 3,
    };
    // 应用锚点变换
    ctx.translate(
      this.activeFrameState.x + pivot.x,
      this.activeFrameState.y + pivot.y
    );
    ctx.rotate((Math.PI / 180) * this.activeFrameState.ky);
    ctx.scale(this.activeFrameState.sx, this.activeFrameState.sy);
    // ctx.transform(
    //   1,
    //   Math.tan((Math.PI / 180) * this.activeFrameState.kx),
    //   Math.tan((Math.PI / 180) * this.activeFrameState.ky),
    //   1,
    //   0,
    //   0
    // );
    ctx.drawImage(
      this.imgs[this.activeFrameState.i] || this.showImg,
      0,
      0,
      this.showImg.width,
      this.showImg.height,
      0,
      0,
      this.showImg.width,
      this.showImg.height
    );
    ctx.restore();
    Object.keys(this.activeFrameState).forEach(key => {
      this.activeLastFrameState[key] = this.activeFrameState[key];
    });
  }
  getName() {
    return this.name;
  }
  getImgId() {
    return this.imgId;
  }
  getLastFrameState(at: AnimationTrack) {
    for (const frame of this.frames.filter(f => f.getIndex() <= at.startFrameIndex)) {
      Object.keys(frame.getState()).forEach(key => {
        this.activeLastFrameState[key] = frame.getState()[key]
      })
    }
    return this.activeLastFrameState
  }
  getFrames() {
    return this.frames;
  }
}

class AnimationRoot {
  tracks: Array<Track> = [];
  animTracks: Array<AnimationTrack> = [];
  curAnimName: string = 'anim_loop';
  curAnimTrack: AnimationTrack;
  constructor() { }
  async init(config: typeof Config) {
    const load_tracks: Array<Promise<unknown>> = [];
    config.tracks.forEach((config_track: { name: string; }) => {
      const track = new Track();
      this.tracks.push(track);
      const load_track = track.init(config_track);
      load_tracks.push(load_track);
      if (config_track.name.startsWith('anim_')) {
        const aniTrack = new AnimationTrack();
        console.log(config_track);
        aniTrack.init(config_track);
        this.animTracks.push(aniTrack);
      }
    });
    this.setPlayAnim(this.curAnimName);
    this.tracks.filter(track => track.getImgId()).forEach(track => {
      track.renderfirsetFrame(this.curAnimTrack)
    })
  }
  setPlayAnim(name: string) {
    this.curAnimName = name;
    const track: AnimationTrack | null =
      this.animTracks.find(at => at.getAnimName() === this.curAnimName) || null;
    if (track) {
      this.curAnimTrack = track;
    }
  }
  getTrackForName(name: string) {
    return this.tracks.find(track => track.getName() === name) || null;
  }
  getTrackForImgId(imgId: string) {
    return this.tracks.find(track => track.getImgId() === imgId) || null;
  }
  processTracks(delta: number, plant: Plant) {
    const tracks = this.tracks.filter(track => track.getImgId()).filter(track => {
      //  if(track.getName().startsWith("anim_")) return true
      //  for (let frame of track.getFrames().filter(frame=>frame.getIndex()>=this.curAnimTrack.startFrameIndex && frame.getIndex() < this.curAnimTrack.endFrameIndex)) {
      //    if(frame.getState().i){
      //      return true
      //    }
      //  }
      //  return false;
      return true
    });
    for (const track of tracks) {
      track.process(delta, plant, this.curAnimTrack);
    }
  }
}

class Plant {
  animationDelta = 1000 / Config.fps;
  basePosition: Vector2 = new Vector2();
  animationRoot = new AnimationRoot();
  constructor() {
    this.animationRoot.init(Config);
    console.log(this.animationRoot);
  }
  animationLoop(delta: number) {
    this.animationRoot.processTracks(delta, this);
  }
}

const plant = new Plant();
let lastTime = 0;
let delta = 0;
const loop = async (time: number) => {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  delta = time - lastTime;
  plant.animationLoop(delta);
  requestAnimationFrame(loop);
  lastTime = time;
};

loop(16.6);
