declare global {
  interface Window {
    __fakescope_extract?: () => { title: string; text: string };
  }
}
export {};
