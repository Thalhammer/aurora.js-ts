import * as AV from '../../src/core/';

describe('core/events', () => {
  it('on', () => {
    let emitter = new AV.EventHost();
    let times = 0;
    emitter.on("test", (a,b)=>{
        times++;
        expect(a).toEqual("a");
        expect(b).toEqual("b");
    });
    emitter.emit("test", "a", "b");
    emitter.emit("test", "a", "b");
    expect(times).toEqual(2);
  });

  it('off', () => {
    let emitter = new AV.EventHost();
    let times = 0;
    let fn = ()=>{
        times++;
    };
    emitter.on("test", fn);
    emitter.emit("test");
    emitter.off("test", fn);
    emitter.emit("test");
    expect(times).toEqual(1);
  });

  it('once', () => {
    let emitter = new AV.EventHost();
    let times = 0;

    emitter.once("test", ()=>{
        times++;
    });

    emitter.emit("test");
    emitter.emit("test");
    emitter.emit("test");
    expect(times).toEqual(1);
  });

  it('emit', () => {
    let emitter = new AV.EventHost();
    let times = 0;

    emitter.on("test", ()=>{
        times++;
    });
    emitter.on("test", ()=>{
        times++;
    });

    emitter.emit("test");
    expect(times).toEqual(2);
  });
});
