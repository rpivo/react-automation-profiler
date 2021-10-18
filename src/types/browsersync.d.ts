// TODO: remove this type definition file once the @types/browser-sync package
// has been updated. See: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56578
declare module "browser-sync" {
  export function init(config: {
    browser: string;
    logLevel: string;
    notify: boolean;
    open: boolean;
    port: number;
    proxy: string;
    reloadOnRestart: boolean;
  }): void;
  export function reload(): void;
}
