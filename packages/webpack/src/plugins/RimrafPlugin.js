import rimraf from 'rimraf';

export default class RimrafPlugin {
  constructor({path, hook = 'emit'}) {
    this.path = path;
    this.hook = hook;
  }

  apply(compiler) {
    compiler.hooks[this.hook].tapAsync('WebpackRimrafPlugin', (_, resolve) =>
      rimraf(this.path || compiler.options.output.path, resolve)
    );
  }
}
