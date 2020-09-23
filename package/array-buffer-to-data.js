/*!
 * From https://github.com/eelokets/array-buffer-to-data
 */
export const arrayBufferToData = {
  toBase64: function(arrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++){
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  },

  toString: function(arrayBuffer) {
    try {
      const base64 = this.toBase64(arrayBuffer);

      return decodeURIComponent(escape(window.atob(base64)));
    } catch (e){
      console.warn('Can not be converted to String');
      return false;
    }
  },

  toJSON: function(arrayBuffer) {
    try {
      const string = this.toString(arrayBuffer);
      return JSON.parse(string);
    } catch (e){
      console.warn('Can not be converted to JSON');
      return false;
    }
  },
};
