class Embed {
  constructor(container: any, options?: any) {}
  loadMusicXML(_: string) {
    return Promise.resolve();
  }
  getMIDI() {
    return Promise.resolve('');
  }
}
export default Embed;
