import rimraf from 'rimraf';

export default class RimrafPlugin {
  constructor(opt = {}) {
    const {path, hook = 'emit'} = opt;
    this.path = path;
    this.hook = hook;
  }

  apply(compiler) {
    compiler.hooks[this.hook].tapAsync('WebpackRimrafPlugin', (_, resolve) =>
      rimraf(this.path || compiler.options.output.path, resolve)
    );
  }
}
