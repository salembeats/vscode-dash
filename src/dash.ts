export class Dash {
  private OS: string;
  private URIHandler: string;
  private option: DashOption;

  constructor(OS: string, option: DashOption) {
    this.OS = OS;
    this.URIHandler =
      {
        darwin: 'open -g',
        linux: 'zeal',
        // start Zeal before we pass it a URI so it works whether Zeal is running in background or not.
        // Why is this needed? I have no idea, but I think Qt has to start up a listener on cmd before it will work.
        win32: 'start dash-plugin:// && start',
      }[this.OS] || 'zeal';

    this.option = option;
  }

  /**
   * Get command to open dash
   *
   * @param {string} query - text to find
   * @param {string} docsets - array of docset e.g. [css, less]
   * @return {string} dash handler and uri
   */
  getCommand(query: string, docsets: string[] = []): string {
    let uri = 'dash-plugin://query=' + encodeURIComponent(query);
    const keys = this.getKeys(docsets);

    if (keys) {
      uri += '&keys=' + keys;
    }

    return this.URIHandler + ' ' + this.getOSSpecificURI(uri);
  }

  /**
   * Get docset keys parameter for dash
   *
   * @param {Array<string>} docsets - array of docset e.g [css, less]
   * @return {string} joined array in string e.g. "ruby,css,dimas" or empty string
   */
  getKeys(docsets: string[]): string {
    if (docsets.length > 0) {
      // Dash has behaviour to search another docsets that have similarity with targeted docsets
      // e.g search to typescript, will also search in vue
      // Using exact to prevent that so it will search only in targeted docsets
      const { exactDocset } = this.option;
      const finalDocsets = docsets.map(docset => exactDocset ? `exact:${docset}` : docset);

      return finalDocsets.join(',');
    }

    return '';
  }

  /**
   * Returns the OS specific URI to be handled.
   *
   * @param {string} uri - original constructed URI
   * @return {string} OS-specific URI to pass to handler, mainly because of Windows
   */
  getOSSpecificURI(uri: string): string {
    return (
      {
        // on Windows, start can't deal with the double quotes, and & needs to be escaped with ^
        win32: uri.replace('&', '^&'),
      }[this.OS] || '"' + uri + '"'
    );
  }
}

export interface DashOption {
  exactDocset: boolean;
}
